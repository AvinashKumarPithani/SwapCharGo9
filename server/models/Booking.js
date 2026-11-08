import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      required: true,
      default: "active",
    },
    bookedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

bookingSchema.index(
  { userId: 1, roomId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
    name: "one_active_booking_per_user_room",
  }
);
bookingSchema.index({ roomId: 1, status: 1, expiresAt: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model("bookings", bookingSchema);

export default Booking;
