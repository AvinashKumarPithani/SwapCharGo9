import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Close, EventAvailable, Place } from "@mui/icons-material";
import { cancelBooking, getBookingStatus, getMyBookings } from "../../actions/booking";
import { useValue } from "../../context/ContextProvider";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString();
};

const formatRemaining = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} remaining`;
};

const BookingHistory = () => {
  const {
    state: { openBookingHistory, currentUser },
    dispatch,
  } = useValue();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const checkedExpiryIds = useRef(new Set());
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (!openBookingHistory) return undefined;
    if (!currentUser?.token) {
      dispatch({ type: "CLOSE_BOOKING_HISTORY" });
      dispatch({ type: "OPEN_LOGIN" });
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    setNotice("");
    setBookings([]);
    getMyBookings({ token: currentUser.token, signal: controller.signal }, dispatch)
      .then((items) => {
        if (!controller.signal.aborted) setBookings(Array.isArray(items) ? items : []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError" && !controller.signal.aborted) {
          setError(requestError.message);
          if (requestError.status === 401) dispatch({ type: "OPEN_LOGIN" });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [openBookingHistory, currentUser?.token, dispatch]);

  useEffect(() => {
    if (!openBookingHistory) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [openBookingHistory]);

  useEffect(() => {
    if (!openBookingHistory || !currentUser?.token) return;
    bookings.forEach((booking) => {
      const expiresAt = new Date(booking.expiresAt).getTime();
      if (booking.status !== "active" || expiresAt > now || checkedExpiryIds.current.has(booking._id)) return;
      checkedExpiryIds.current.add(booking._id);
      getBookingStatus(booking._id, { token: currentUser.token }, dispatch)
        .then(({ booking: updated }) => {
          if (mountedRef.current) setBookings((items) => items.map((item) => item._id === updated._id ? { ...item, ...updated } : item));
        })
        .catch((requestError) => { if (mountedRef.current) setError(requestError.message); });
    });
  }, [bookings, currentUser?.token, dispatch, now, openBookingHistory]);

  const close = () => dispatch({ type: "CLOSE_BOOKING_HISTORY" });

  const handleCancel = async (booking) => {
    if (!window.confirm("Cancel this station reservation?")) return;
    setCancellingId(booking._id);
    setError("");
    setNotice("");
    try {
      const result = await cancelBooking(booking._id, currentUser.token, dispatch);
      if (!mountedRef.current) return;
      setBookings((items) => items.map((item) => item._id === booking._id ? { ...item, ...result.booking } : item));
      setNotice(result.booking.status === "cancelled" ? "Booking cancelled. Station availability has been released." : "This booking has already expired.");
    } catch (requestError) {
      if (mountedRef.current) setError(requestError.message);
    } finally {
      if (mountedRef.current) setCancellingId(null);
    }
  };

  return (
    <Dialog open={openBookingHistory} onClose={close} fullWidth maxWidth="sm" aria-labelledby="booking-history-title">
      <DialogTitle id="booking-history-title" sx={{ pr: 7 }}>
        My Bookings
        <IconButton aria-label="Close booking history" onClick={close} sx={{ position: "absolute", right: 12, top: 10 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {notice && <Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress aria-label="Loading bookings" /></Box>
          ) : bookings.length === 0 ? (
            error ? null : <Alert severity="info">You do not have any bookings yet.</Alert>
          ) : bookings.map((booking) => {
            const station = booking.roomId && typeof booking.roomId === "object" ? booking.roomId : null;
            const expiration = new Date(booking.expiresAt).getTime();
            const active = booking.status === "active" && expiration > now;
            const displayStatus = booking.status === "active" && expiration <= now ? "expired" : booking.status;
            const statusColor = displayStatus === "active" ? "success" : displayStatus === "cancelled" ? "default" : "warning";
            return (
              <Box key={booking._id} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box>
                    <Typography variant="h6">{station?.title || "Station details unavailable"}</Typography>
                    {station && <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Place fontSize="small" />{station.lat}, {station.lng}</Typography>}
                    {station && Number.isFinite(station.price) && <Typography variant="body2" color="text.secondary">{station.price === 0 ? "Free with subscription" : `Price: $${station.price}`}</Typography>}
                  </Box>
                  <Chip size="small" label={displayStatus} color={statusColor} sx={{ textTransform: "capitalize" }} />
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                  <Typography variant="body2"><strong>Booked:</strong> {formatDate(booking.bookedAt)}</Typography>
                  <Typography variant="body2"><strong>Expires:</strong> {formatDate(booking.expiresAt)}</Typography>
                  {active && <Typography variant="body2" color="success.dark" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><EventAvailable fontSize="small" />{formatRemaining(expiration - now)}</Typography>}
                </Stack>
                {active && (
                  <Button
                    color="error"
                    variant="outlined"
                    sx={{ mt: 1.5 }}
                    disabled={cancellingId === booking._id}
                    onClick={() => handleCancel(booking)}
                  >
                    {cancellingId === booking._id ? "Cancelling…" : "Cancel booking"}
                  </Button>
                )}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default BookingHistory;
