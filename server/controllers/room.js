import Room from "../models/Room.js";
import tryCatch from "./utils/tryCatch.js";

export const createRoom = tryCatch(async (req, res) => {
  const { id: uid, name: uName, photoURL: uPhoto, slots = 50 } = req.user;
  const { maxSlots } = req.body;
  const newRoom = new Room({
    ...req.body,
    slots: maxSlots,
    // maxSlots: slots,
    uid,
    uName,
    uPhoto,
    nextIncrementTime: Date.now() + 1 * 10 * 1000, // Set the initial nextIncrementTime to 30 minutes from now
  });
  await newRoom.save();
  res.status(201).json({ success: true, result: newRoom });
});

export const getRooms = tryCatch(async (req, res) => {
  const rooms = await Room.find().sort({ _id: -1 });
  res.status(200).json({ success: true, result: rooms });
});

export const updateRoom = tryCatch(async (req, res) => {
  const roomId = req.params.id;
  const updatedData = req.body;

  const updatedRoom = await Room.findByIdAndUpdate(roomId, updatedData, {
    new: true,
  });

  if (!updatedRoom) {
    return res.status(404).json({ success: false, message: "Station not found" });
  }

  res.status(200).json({ success: true, result: updatedRoom });
});
