import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import {
  BOOKING_DURATION_MS,
  BookingError,
  isValidObjectId,
  sendBookingError,
} from "./utils/booking.js";

let bookingIndexesPromise;
const ensureBookingIndexes = () => {
  if (!bookingIndexesPromise) {
    bookingIndexesPromise = Booking.init().catch((error) => {
      bookingIndexesPromise = undefined;
      throw error;
    });
  }
  return bookingIndexesPromise;
};

const withSessionTransaction = async (callback) => {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(
      async () => {
        result = await callback(session);
      },
      {
        readPreference: "primary",
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      }
    );
    return result;
  } finally {
    await session.endSession();
  }
};

const lockRoom = async (roomId, session) => {
  const room = await Room.findOneAndUpdate(
    { _id: roomId },
    { $inc: { bookingRevision: 1 } },
    { new: true, session, runValidators: false }
  ).select("+bookingRevision");
  if (!room) throw new BookingError(404, "STATION_NOT_FOUND", "Station not found.");
  return room;
};

const getAvailabilityForRoom = async (room, session, now = new Date()) => {
  const activeBookings = await Booking.countDocuments({
    roomId: room._id,
    status: "active",
    expiresAt: { $gt: now },
  }).session(session || null);
  const capacityConfigured = Number.isInteger(room.totalSlots) && room.totalSlots > 0;
  return {
    roomId: String(room._id),
    totalSlots: capacityConfigured ? room.totalSlots : null,
    availableSlots: capacityConfigured
      ? Math.max(0, room.totalSlots - activeBookings)
      : null,
    activeBookings,
    capacityConfigured,
  };
};

const validatePathId = (value, entity) => {
  if (!isValidObjectId(value)) {
    throw new BookingError(400, "INVALID_ID", `Invalid ${entity} ID.`);
  }
};

export const getRoomAvailability = async (req, res) => {
  try {
    validatePathId(req.params.roomId, "station");
    const room = await Room.findById(req.params.roomId).select("totalSlots");
    if (!room) throw new BookingError(404, "STATION_NOT_FOUND", "Station not found.");
    const availability = await getAvailabilityForRoom(room, null);
    return res.status(200).json({ success: true, result: availability });
  } catch (error) {
    return sendBookingError(res, error);
  }
};

export const createBooking = async (req, res) => {
  try {
    const { roomId } = req.body || {};
    validatePathId(roomId, "station");
    if (typeof req.user?.id !== "string" || !req.user.id) {
      throw new BookingError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }
    await ensureBookingIndexes();
    const result = await withSessionTransaction(async (session) => {
      const room = await lockRoom(roomId, session);
      if (!Number.isInteger(room.totalSlots) || room.totalSlots < 1) {
        throw new BookingError(
          409,
          "CAPACITY_NOT_CONFIGURED",
          "This station is not configured for bookings."
        );
      }

      const bookedAt = new Date();
      await Booking.updateMany(
        {
          userId: req.user.id,
          roomId: room._id,
          status: "active",
          expiresAt: { $lte: bookedAt },
        },
        { $set: { status: "expired" } },
        { session }
      );

      const existing = await Booking.findOne({
        userId: req.user.id,
        roomId: room._id,
        status: "active",
        expiresAt: { $gt: bookedAt },
      }).session(session);
      if (existing) {
        throw new BookingError(409, "ACTIVE_BOOKING_EXISTS", "You already have an active booking for this station.");
      }

      const activeBefore = await Booking.countDocuments({
        roomId: room._id,
        status: "active",
        expiresAt: { $gt: bookedAt },
      }).session(session);
      if (activeBefore >= room.totalSlots) {
        throw new BookingError(409, "STATION_FULL", "No booking capacity is currently available.", {
          availability: {
            roomId: String(room._id),
            totalSlots: room.totalSlots,
            availableSlots: 0,
            activeBookings: activeBefore,
            capacityConfigured: true,
          },
        });
      }

      const [booking] = await Booking.create(
        [
          {
            userId: req.user.id,
            roomId: room._id,
            status: "active",
            bookedAt,
            expiresAt: new Date(bookedAt.getTime() + BOOKING_DURATION_MS),
          },
        ],
        { session }
      );
      const availability = {
        roomId: String(room._id),
        totalSlots: room.totalSlots,
        availableSlots: room.totalSlots - activeBefore - 1,
        activeBookings: activeBefore + 1,
        capacityConfigured: true,
      };
      return { booking, availability };
    });
    return res.status(201).json({ success: true, result });
  } catch (error) {
    if (error?.code === 11000) {
      return sendBookingError(
        res,
        new BookingError(409, "ACTIVE_BOOKING_EXISTS", "You already have an active booking for this station.")
      );
    }
    return sendBookingError(res, error);
  }
};

export const cancelBooking = async (req, res) => {
  try {
    validatePathId(req.params.bookingId, "booking");
    await ensureBookingIndexes();
    const result = await withSessionTransaction(async (session) => {
      const ownedBooking = await Booking.findOne({
        _id: req.params.bookingId,
        userId: req.user.id,
      }).session(session);
      if (!ownedBooking) throw new BookingError(404, "BOOKING_NOT_FOUND", "Booking not found.");

      let room = await lockRoom(ownedBooking.roomId, session).catch(async (error) => {
        if (error instanceof BookingError && error.status === 404) return null;
        throw error;
      });
      const booking = await Booking.findOne({
        _id: ownedBooking._id,
        userId: req.user.id,
      }).session(session);
      if (!booking) throw new BookingError(404, "BOOKING_NOT_FOUND", "Booking not found.");

      const now = new Date();
      if (booking.status === "active" && booking.expiresAt <= now) {
        booking.status = "expired";
        await booking.save({ session });
      } else if (booking.status === "active") {
        booking.status = "cancelled";
        await booking.save({ session });
      }

      const availability = room
        ? await getAvailabilityForRoom(room, session, now)
        : {
            roomId: String(booking.roomId),
            totalSlots: null,
            availableSlots: null,
            activeBookings: null,
            capacityConfigured: false,
          };
      return { booking, availability };
    });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return sendBookingError(res, error);
  }
};

export const getMyBookings = async (req, res) => {
  try {
    await ensureBookingIndexes();
    const now = new Date();
    await Booking.updateMany(
      { userId: req.user.id, status: "active", expiresAt: { $lte: now } },
      { $set: { status: "expired" } }
    );
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("roomId", "title lng lat totalSlots images price");
    const result = bookings.map((booking) => ({
      ...booking.toObject(),
      remainingMs:
        booking.status === "active"
          ? Math.max(0, booking.expiresAt.getTime() - now.getTime())
          : 0,
    }));
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return sendBookingError(res, error);
  }
};

export const getBookingStatus = async (req, res) => {
  try {
    validatePathId(req.params.bookingId, "booking");
    let booking = await Booking.findOne({
      _id: req.params.bookingId,
      userId: req.user.id,
    });
    if (!booking) throw new BookingError(404, "BOOKING_NOT_FOUND", "Booking not found.");

    const now = new Date();
    if (booking.status === "active" && booking.expiresAt <= now) {
      await Booking.updateOne(
        {
          _id: booking._id,
          userId: req.user.id,
          status: "active",
          expiresAt: { $lte: now },
        },
        { $set: { status: "expired" } }
      );
      booking = await Booking.findOne({ _id: booking._id, userId: req.user.id });
    }
    const room = await Room.findById(booking.roomId).select("totalSlots");
    const availability = room
      ? await getAvailabilityForRoom(room, null, now)
      : {
          roomId: String(booking.roomId),
          totalSlots: null,
          availableSlots: null,
          activeBookings: null,
          capacityConfigured: false,
        };
    return res.status(200).json({
      success: true,
      result: {
        booking,
        remainingMs:
          booking.status === "active"
            ? Math.max(0, booking.expiresAt.getTime() - now.getTime())
            : 0,
        availability,
      },
    });
  } catch (error) {
    return sendBookingError(res, error);
  }
};
