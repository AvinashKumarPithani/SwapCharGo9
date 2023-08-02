import { Router } from "express";

import { createRoom, getRooms, updateRoom } from "../controllers/room.js";
import auth from "../middleware/auth.js";

const roomRouter = Router();
roomRouter.post("/", auth, createRoom);
roomRouter.get("/", getRooms);
roomRouter.put("/:id", auth, updateRoom); // Add the new route for updating room

export default roomRouter;
