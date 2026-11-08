import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  cancelBooking,
  createBooking,
  getBookingStatus,
  getMyBookings,
} from "../controllers/booking.js";

const bookingRouter = Router();
bookingRouter.post("/", auth, createBooking);
bookingRouter.get("/", auth, getMyBookings);
bookingRouter.get("/:bookingId", auth, getBookingStatus);
bookingRouter.delete("/:bookingId", auth, cancelBooking);

export default bookingRouter;
