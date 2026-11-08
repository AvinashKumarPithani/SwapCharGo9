export const BOOKING_DURATION_MS = 30 * 60 * 1000;
export const MAX_TOTAL_SLOTS = 500;

export class BookingError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const isValidCapacity = (value) =>
  Number.isInteger(value) && value >= 1 && value <= MAX_TOTAL_SLOTS;

export const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

export const sendBookingError = (res, error) => {
  if (error instanceof BookingError) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message, ...(error.details || {}) },
    });
  }
  console.error("Booking operation failed", error?.name || "UnknownError");
  return res.status(500).json({
    success: false,
    error: {
      code: "BOOKING_OPERATION_FAILED",
      message: "The booking request could not be completed.",
    },
  });
};
