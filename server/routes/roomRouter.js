import { Router } from "express";

import { createRoom, getRooms, setRoomCapacity } from "../controllers/room.js";
import { getRoomAvailability } from "../controllers/booking.js";
import auth from "../middleware/auth.js";

const roomRouter = Router();
roomRouter.post("/", auth, createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/:roomId/availability", getRoomAvailability);
roomRouter.patch("/:roomId/capacity", auth, setRoomCapacity);
export default roomRouter;
