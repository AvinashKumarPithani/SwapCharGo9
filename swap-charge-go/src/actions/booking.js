const serverUrl = process.env.REACT_APP_SERVER_URL;

class BookingApiError extends Error {
  constructor(message, code, status, details = {}) {
    super(message);
    this.name = "BookingApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const request = async ({ path, method = "GET", token, body, signal }, dispatch) => {
  if (!serverUrl) {
    throw new BookingApiError("The server URL is not configured.", "SERVER_URL_MISSING", 0);
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${serverUrl}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new BookingApiError("Could not reach the booking service. Check your connection and try again.", "NETWORK_ERROR", 0);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new BookingApiError("The booking service returned an invalid response.", "INVALID_RESPONSE", response.status);
  }

  if (!response.ok || !data?.success) {
    if (response.status === 401 && dispatch) {
      dispatch({ type: "UPDATE_USER", payload: null });
    }
    throw new BookingApiError(
      data?.error?.message || data?.message || "The booking request could not be completed.",
      data?.error?.code || data?.code || "BOOKING_REQUEST_FAILED",
      response.status,
      data?.error || {}
    );
  }

  return data.result;
};

export const getRoomAvailability = (roomId, options = {}, dispatch) =>
  request({ path: `/room/${encodeURIComponent(roomId)}/availability`, ...options }, dispatch);

export const getMyBookings = (options = {}, dispatch) =>
  request({ path: "/booking", ...options }, dispatch);

export const getBookingStatus = (bookingId, options = {}, dispatch) =>
  request({ path: `/booking/${encodeURIComponent(bookingId)}`, ...options }, dispatch);

export const createBooking = (roomId, token, dispatch) =>
  request({ path: "/booking", method: "POST", token, body: { roomId } }, dispatch);

export const cancelBooking = (bookingId, token, dispatch) =>
  request({ path: `/booking/${encodeURIComponent(bookingId)}`, method: "DELETE", token }, dispatch);

export { BookingApiError };
