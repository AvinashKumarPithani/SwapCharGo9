import Room from "../models/Room.js";
import tryCatch from "./utils/tryCatch.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { BookingError, isValidCapacity, isValidObjectId, sendBookingError } from "./utils/booking.js";

export const createRoom = tryCatch(async (req, res) => {
  const { id: uid, name: uName, photoURL: uPhoto } = req.user;
  const { lng, lat, price, title, description, images, totalSlots } = req.body || {};
  if (!isValidCapacity(totalSlots)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_CAPACITY",
        message: "Total capacity must be a whole number between 1 and 500.",
      },
    });
  }
  const newRoom = new Room({ lng, lat, price, title, description, images, totalSlots, uid, uName, uPhoto });
  await newRoom.save();
  const result = newRoom.toObject();
  delete result.bookingRevision;
  res.status(201).json({ success: true, result });
});

export const getRooms = tryCatch(async (req, res) => {
  const rooms = await Room.find().sort({ _id: -1 });
  res.status(200).json({ success: true, result: rooms });
});

export const setRoomCapacity = async (req, res) => {
  let session;
  try {
    if (!isValidObjectId(req.params.roomId)) {
      throw new BookingError(400, "INVALID_ID", "Invalid station ID.");
    }
    const { totalSlots } = req.body || {};
    if (!isValidCapacity(totalSlots)) {
      throw new BookingError(400, "INVALID_CAPACITY", "Total capacity must be a whole number between 1 and 500.");
    }

    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      const room = await Room.findOneAndUpdate(
        { _id: req.params.roomId, uid: req.user.id },
        { $inc: { bookingRevision: 1 } },
        { new: true, session }
      ).select("+bookingRevision");
      if (!room) {
        const exists = await Room.exists({ _id: req.params.roomId }).session(session);
        throw new BookingError(
          exists ? 403 : 404,
          exists ? "STATION_OWNER_REQUIRED" : "STATION_NOT_FOUND",
          exists ? "Only the station owner can configure capacity." : "Station not found."
        );
      }

      const now = new Date();
      const activeBookings = await Booking.countDocuments({
        roomId: room._id,
        status: "active",
        expiresAt: { $gt: now },
      }).session(session);
      if (totalSlots < activeBookings) {
        throw new BookingError(
          409,
          "CAPACITY_BELOW_ACTIVE_BOOKINGS",
          "Capacity cannot be lower than the current active bookings.",
          { activeBookings }
        );
      }

      room.totalSlots = totalSlots;
      await room.save({ session });
      result = {
        roomId: String(room._id),
        totalSlots,
        activeBookings,
        availableSlots: totalSlots - activeBookings,
        capacityConfigured: true,
      };
    }, {
      readPreference: "primary",
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
    });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return sendBookingError(res, error);
  } finally {
    if (session) await session.endSession();
  }
};
