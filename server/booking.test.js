import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const testUri = process.env.BOOKING_TEST_MONGO_URI;
if (!testUri) throw new Error("Set BOOKING_TEST_MONGO_URI to an isolated local replica-set database.");
const parsedTestUri = new URL(testUri);
if (parsedTestUri.protocol !== "mongodb:" || !["127.0.0.1", "localhost"].includes(parsedTestUri.hostname) || !/booking.?test/i.test(parsedTestUri.pathname)) {
  throw new Error("Booking tests only permit a local database with a booking-test name.");
}

process.env.JWT_SECRET = "booking-test-only-secret";
process.env.GOOGLE_CLIENT_ID = "booking-test-client";
const [{ default: Room }, { default: Booking }, { default: roomRouter }, { default: bookingRouter }] = await Promise.all([
  import("./models/Room.js"),
  import("./models/Booking.js"),
  import("./routes/roomRouter.js"),
  import("./routes/bookingRouter.js"),
]);
const [{ default: User }, { default: userRouter }, { default: bcrypt }] = await Promise.all([
  import("./models/User.js"),
  import("./routes/userRouter.js"),
  import("bcryptjs"),
]);

const app = express();
app.use(express.json());
app.use("/room", roomRouter);
app.use("/booking", bookingRouter);
app.use("/user", userRouter);
let server;
let baseUrl;

const tokenFor = (id) => jwt.sign({ id, name: "Booking Test" }, process.env.JWT_SECRET);
const headersFor = (userId) => ({ "Content-Type": "application/json", Authorization: `Bearer ${tokenFor(userId)}` });
const createRoom = async ({ owner, totalSlots } = {}) => Room.create({
  lng: 72.8777,
  lat: 19.076,
  title: "Isolated test station",
  description: "Room created only in the local booking test database.",
  images: ["https://example.invalid/test.png"],
  uid: owner || new mongoose.Types.ObjectId().toString(),
  uName: "Test owner",
  ...(totalSlots === undefined ? {} : { totalSlots }),
});
const postBooking = (roomId, userId) => fetch(`${baseUrl}/booking`, {
  method: "POST", headers: headersFor(userId), body: JSON.stringify({ roomId }),
});
const setCapacity = (roomId, owner, totalSlots) => fetch(`${baseUrl}/room/${roomId}/capacity`, {
  method: "PATCH", headers: headersFor(owner), body: JSON.stringify({ totalSlots }),
});

before(async () => {
  await mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000 });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  assert.ok(hello.setName, "booking integration tests require a replica set");
  await mongoose.connection.dropDatabase();
  await Promise.all([Room.init(), Booking.init()]);
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});
beforeEach(async () => Promise.all([Booking.deleteMany({}), Room.deleteMany({}), User.deleteMany({})]));
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

test("creates a 30-minute booking and returns authoritative availability", async () => {
  const room = await createRoom({ totalSlots: 2 });
  const response = await postBooking(room.id, "user-a");
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.result.availability.availableSlots, 1);
  assert.equal(body.result.availability.activeBookings, 1);
  assert.equal(body.result.booking.userId, "user-a");
  assert.equal(new Date(body.result.booking.expiresAt).getTime() - new Date(body.result.booking.bookedAt).getTime(), 30 * 60 * 1000);
});

test("rejects full capacity without creating a partial booking", async () => {
  const room = await createRoom({ totalSlots: 1 });
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
  assert.equal((await postBooking(room.id, "user-b")).status, 409);
  assert.equal(await Booking.countDocuments({ roomId: room.id, status: "active" }), 1);
});

test("allows multiple users to reserve available capacity", async () => {
  const room = await createRoom({ totalSlots: 2 });
  const responses = await Promise.all([postBooking(room.id, "user-a"), postBooking(room.id, "user-b")]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 201]);
  assert.equal(await Booking.countDocuments({ roomId: room.id, status: "active" }), 2);
});

test("rejects a second active booking by the same user at one station", async () => {
  const room = await createRoom({ totalSlots: 3 });
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
  assert.equal((await postBooking(room.id, "user-a")).status, 409);
  assert.equal(await Booking.countDocuments({ roomId: room.id }), 1);
});

test("allows the same user to reserve a different station", async () => {
  const one = await createRoom({ totalSlots: 1 });
  const two = await createRoom({ totalSlots: 1 });
  assert.equal((await postBooking(one.id, "user-a")).status, 201);
  assert.equal((await postBooking(two.id, "user-a")).status, 201);
});

test("expiry restores availability and history marks records expired", async () => {
  const room = await createRoom({ totalSlots: 1 });
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
  await Booking.updateOne({ roomId: room.id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  const availability = await (await fetch(`${baseUrl}/room/${room.id}/availability`)).json();
  assert.equal(availability.result.availableSlots, 1);
  const history = await (await fetch(`${baseUrl}/booking`, { headers: headersFor("user-a") })).json();
  assert.equal(history.result[0].status, "expired");
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
});

test("owner cancellation releases capacity", async () => {
  const room = await createRoom({ totalSlots: 1 });
  const created = await (await postBooking(room.id, "user-a")).json();
  const response = await fetch(`${baseUrl}/booking/${created.result.booking._id}`, { method: "DELETE", headers: headersFor("user-a") });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.result.booking.status, "cancelled");
  assert.equal(body.result.availability.availableSlots, 1);
});

test("another user cannot cancel a booking", async () => {
  const room = await createRoom({ totalSlots: 1 });
  const created = await (await postBooking(room.id, "user-a")).json();
  const response = await fetch(`${baseUrl}/booking/${created.result.booking._id}`, { method: "DELETE", headers: headersFor("user-b") });
  assert.equal(response.status, 404);
  assert.equal((await Booking.findById(created.result.booking._id)).status, "active");
});

test("repeated cancellation is idempotent", async () => {
  const room = await createRoom({ totalSlots: 1 });
  const created = await (await postBooking(room.id, "user-a")).json();
  const cancel = () => fetch(`${baseUrl}/booking/${created.result.booking._id}`, { method: "DELETE", headers: headersFor("user-a") });
  assert.equal((await cancel()).status, 200);
  const repeated = await cancel();
  assert.equal(repeated.status, 200);
  assert.equal((await repeated.json()).result.booking.status, "cancelled");
  assert.equal(await Booking.countDocuments({ roomId: room.id, status: "active" }), 0);
});

test("rejects booking without authentication", async () => {
  const room = await createRoom({ totalSlots: 1 });
  const response = await fetch(`${baseUrl}/booking`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId: room.id }) });
  assert.equal(response.status, 401);
});

test("rejects malformed station IDs", async () => {
  assert.equal((await postBooking("bad-id", "user-a")).status, 400);
});

test("simultaneous last-slot requests allow exactly one booking", async () => {
  const room = await createRoom({ totalSlots: 1 });
  const responses = await Promise.all([postBooking(room.id, "user-a"), postBooking(room.id, "user-b")]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
  assert.equal(await Booking.countDocuments({ roomId: room.id, status: "active", expiresAt: { $gt: new Date() } }), 1);
  const availability = await (await fetch(`${baseUrl}/room/${room.id}/availability`)).json();
  assert.equal(availability.result.availableSlots, 0);
});

test("unknown-capacity stations remain visible and unbookable", async () => {
  const room = await createRoom();
  const availability = await (await fetch(`${baseUrl}/room/${room.id}/availability`)).json();
  assert.equal(availability.result.capacityConfigured, false);
  assert.equal(availability.result.totalSlots, null);
  assert.equal(availability.result.availableSlots, null);
  assert.equal((await postBooking(room.id, "user-a")).status, 409);
});

test("only the station owner can configure capacity", async () => {
  const room = await createRoom({ owner: "owner-a", totalSlots: 2 });
  assert.equal((await setCapacity(room.id, "other-user", 4)).status, 403);
  const allowed = await setCapacity(room.id, "owner-a", 4);
  assert.equal(allowed.status, 200);
  assert.equal((await allowed.json()).result.totalSlots, 4);
});

test("capacity cannot be reduced below active reservations", async () => {
  const room = await createRoom({ owner: "owner-a", totalSlots: 2 });
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
  assert.equal((await postBooking(room.id, "user-b")).status, 201);
  assert.equal((await setCapacity(room.id, "owner-a", 1)).status, 409);
  assert.equal((await Room.findById(room.id)).totalSlots, 2);
});

test("station creation requires explicit integer capacity and ignores supplied ownership", async () => {
  const user = new mongoose.Types.ObjectId().toString();
  const payload = { lng: 72.8, lat: 19, title: "Created through endpoint", description: "Valid station details for the isolated test.", images: ["https://example.invalid/test.png"] };
  const request = (body) => fetch(`${baseUrl}/room`, { method: "POST", headers: headersFor(user), body: JSON.stringify(body) });
  assert.equal((await request(payload)).status, 400);
  for (const totalSlots of [0, -1, 1.2, "2", 501]) assert.equal((await request({ ...payload, totalSlots })).status, 400);
  const response = await request({ ...payload, totalSlots: 3, uid: "forged-owner" });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.result.uid, user);
  assert.equal(body.result.totalSlots, 3);
});

test("concurrent requests cannot exceed configured capacity", async () => {
  const room = await createRoom({ totalSlots: 2 });
  const responses = await Promise.all([postBooking(room.id, "user-a"), postBooking(room.id, "user-b"), postBooking(room.id, "user-c")]);
  assert.equal(responses.filter((response) => response.status === 201).length, 2);
  assert.equal(await Booking.countDocuments({ roomId: room.id, status: "active", expiresAt: { $gt: new Date() } }), 2);
});

test("simultaneous booking and cancellation preserve station capacity", async () => {
  const room = await createRoom({ totalSlots: 1 });
  const initial = await (await postBooking(room.id, "user-a")).json();
  const cancel = fetch(`${baseUrl}/booking/${initial.result.booking._id}`, {
    method: "DELETE", headers: headersFor("user-a"),
  });
  const book = postBooking(room.id, "user-b");
  const [cancelResponse, bookingResponse] = await Promise.all([cancel, book]);
  assert.equal(cancelResponse.status, 200);
  assert.equal((await cancelResponse.json()).result.booking.status, "cancelled");
  assert.ok([201, 409].includes(bookingResponse.status));
  const current = await Booking.countDocuments({ roomId: room.id, status: "active", expiresAt: { $gt: new Date() } });
  assert.equal(current, bookingResponse.status === 201 ? 1 : 0);
  assert.equal((await Room.findById(room.id)).totalSlots, 1);
});

test("simultaneous booking and capacity reduction cannot overbook", async () => {
  const room = await createRoom({ owner: "owner-a", totalSlots: 2 });
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
  const [bookingResponse, capacityResponse] = await Promise.all([
    postBooking(room.id, "user-b"),
    setCapacity(room.id, "owner-a", 1),
  ]);
  assert.ok(
    (bookingResponse.status === 201 && capacityResponse.status === 409)
      || (bookingResponse.status === 409 && capacityResponse.status === 200),
    `Unexpected booking/capacity outcomes: ${bookingResponse.status}/${capacityResponse.status}`,
  );
  const finalRoom = await Room.findById(room.id);
  const active = await Booking.countDocuments({ roomId: room.id, status: "active", expiresAt: { $gt: new Date() } });
  assert.ok(active <= finalRoom.totalSlots);
});

test("simultaneous rebooking attempts after expiry create only one active booking", async () => {
  const room = await createRoom({ totalSlots: 3 });
  assert.equal((await postBooking(room.id, "user-a")).status, 201);
  await Booking.updateOne({ roomId: room.id, userId: "user-a" }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  const responses = await Promise.all([
    postBooking(room.id, "user-a"),
    postBooking(room.id, "user-a"),
    postBooking(room.id, "user-a"),
  ]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409, 409]);
  assert.equal(responses.filter((response) => response.status === 201).length, 1);
  assert.equal(await Booking.countDocuments({ roomId: room.id, userId: "user-a", status: "active", expiresAt: { $gt: new Date() } }), 1);
  assert.equal(await Booking.countDocuments({ roomId: room.id, userId: "user-a", status: "expired" }), 1);
});

test("existing login token works for station creation and protected booking routes", async () => {
  const password = "booking-test-password";
  const user = await User.create({
    name: "Integration User",
    email: "integration-user@example.invalid",
    password: await bcrypt.hash(password, 4),
  });
  const loginResponse = await fetch(`${baseUrl}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password }),
  });
  assert.equal(loginResponse.status, 200);
  const loginBody = await loginResponse.json();
  assert.ok(loginBody.result.token);
  assert.equal(loginBody.result.id.toString(), user.id);

  const stationResponse = await fetch(`${baseUrl}/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${loginBody.result.token}` },
    body: JSON.stringify({
      lng: 72.8,
      lat: 19,
      title: "Authenticated station",
      description: "Created with a token from the existing login endpoint.",
      images: ["https://example.invalid/auth-test.png"],
      totalSlots: 1,
    }),
  });
  assert.equal(stationResponse.status, 201);
  const stationBody = await stationResponse.json();
  assert.equal(stationBody.result.uid, user.id);

  const protectedResponse = await fetch(`${baseUrl}/booking`, {
    headers: { Authorization: `Bearer ${loginBody.result.token}` },
  });
  assert.equal(protectedResponse.status, 200);
  assert.deepEqual((await protectedResponse.json()).result, []);
  assert.equal((await fetch(`${baseUrl}/booking`)).status, 401);
});
