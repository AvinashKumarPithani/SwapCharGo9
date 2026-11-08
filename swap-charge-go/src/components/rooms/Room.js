import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  Alert,
  IconButton,
  CircularProgress,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useValue } from "../../context/ContextProvider";
import { Close } from "@mui/icons-material";
import { cancelBooking, createBooking, getBookingStatus, getMyBookings, getRoomAvailability } from "../../actions/booking";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCoverflow, Lazy, Zoom } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import "swiper/css/lazy";
import "swiper/css/zoom";
import "./swiper.css";

const Transition = forwardRef((props, ref) => {
  return <Slide direction="up" {...props} ref={ref} />;
});

const Room = () => {
  const {
    state: { room, currentUser },
    dispatch,
  } = useValue();

  const [place, setPlace] = useState(null);
  const stationId = room?._id || room?.roomId;
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [stationBooking, setStationBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [cancellationPending, setCancellationPending] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [clockNow, setClockNow] = useState(Date.now());
  const bookingRequestRef = useRef(false);
  const focusRefreshRef = useRef(false);
  const refreshExpiredBooking = useRef(null);
  const currentStationIdRef = useRef(stationId);
  currentStationIdRef.current = stationId;
  const isRoomOpen = Boolean(room);

  const refreshAvailability = useCallback(async () => {
    if (!stationId) return null;
    const requestedStationId = stationId;
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const nextAvailability = await getRoomAvailability(requestedStationId, {}, dispatch);
      if (currentStationIdRef.current === requestedStationId) setAvailability(nextAvailability);
      return nextAvailability;
    } catch (error) {
      if (currentStationIdRef.current === requestedStationId) setAvailabilityError(error.message);
      return null;
    } finally {
      if (currentStationIdRef.current === requestedStationId) setAvailabilityLoading(false);
    }
  }, [dispatch, stationId]);

  useEffect(() => {
    if (room) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${room.lng},${room.lat}.json?access_token=${process.env.REACT_APP_MAP_TOKEN}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => setPlace(data.features[0]));
    }
  }, [room]);

  useEffect(() => {
    if (!isRoomOpen || !stationId) {
      setAvailability(null);
      setStationBooking(null);
      setAvailabilityError("");
      setBookingError("");
      setBookingMessage(null);
      return undefined;
    }
    const controller = new AbortController();
    refreshExpiredBooking.current = null;
    setAvailability(null);
    setAvailabilityLoading(true);
    setAvailabilityError("");
    setBookingError("");
    setBookingMessage(null);
    getRoomAvailability(stationId, { signal: controller.signal }, dispatch)
      .then((result) => {
        if (!controller.signal.aborted && currentStationIdRef.current === stationId) setAvailability(result);
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !controller.signal.aborted) setAvailabilityError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      });
    return () => controller.abort();
  }, [isRoomOpen, room, stationId, dispatch]);

  useEffect(() => {
    if (!isRoomOpen || !stationId || !currentUser?.token) {
      setStationBooking(null);
      setBookingLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setBookingLoading(true);
    getMyBookings({ token: currentUser.token, signal: controller.signal }, dispatch)
      .then((bookings) => {
        if (controller.signal.aborted || currentStationIdRef.current !== stationId) return;
        const ownBooking = (Array.isArray(bookings) ? bookings : []).find((booking) => {
          const bookingRoomId = typeof booking.roomId === "object" ? booking.roomId?._id : booking.roomId;
          return String(bookingRoomId) === String(stationId);
        });
        setStationBooking(ownBooking || null);
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          setBookingError(error.message);
          if (error.status === 401) dispatch({ type: "OPEN_LOGIN" });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBookingLoading(false);
      });
    return () => controller.abort();
  }, [isRoomOpen, room, stationId, currentUser?.token, dispatch]);

  const expiryTime = stationBooking?.expiresAt ? new Date(stationBooking.expiresAt).getTime() : 0;
  const ownsStationBooking = Boolean(currentUser?.id && String(stationBooking?.userId) === String(currentUser.id));
  const isActiveBooking = ownsStationBooking && stationBooking?.status === "active" && expiryTime > clockNow;
  const remainingMs = isActiveBooking ? Math.max(0, expiryTime - clockNow) : 0;

  useEffect(() => {
    if (!isActiveBooking) return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isActiveBooking, stationBooking?._id]);

  useEffect(() => {
    if (!ownsStationBooking || !stationBooking?._id || stationBooking.status !== "active" || remainingMs > 0) return;
    if (refreshExpiredBooking.current === stationBooking._id) return;
    refreshExpiredBooking.current = stationBooking._id;
    const bookingId = stationBooking._id;
    getBookingStatus(bookingId, { token: currentUser?.token }, dispatch)
      .then((result) => {
        if (currentStationIdRef.current !== stationId) return;
        setStationBooking(result.booking);
        setAvailability(result.availability);
      })
      .catch((error) => {
        if (currentStationIdRef.current === stationId) setBookingError(error.message);
      });
  }, [ownsStationBooking, stationBooking, remainingMs, currentUser?.token, dispatch, stationId]);

  useEffect(() => {
    if (!isRoomOpen || !stationId) return undefined;
    const refreshWhenVisible = async () => {
      if (document.visibilityState !== "visible" || focusRefreshRef.current) return;
      focusRefreshRef.current = true;
      const requestedStationId = stationId;
      try {
        await refreshAvailability();
        if (!ownsStationBooking || !stationBooking?._id || !currentUser?.token) return;
        const result = await getBookingStatus(stationBooking._id, { token: currentUser.token }, dispatch);
        if (currentStationIdRef.current !== requestedStationId) return;
        setStationBooking(result.booking);
        setAvailability(result.availability);
      } catch (error) {
        if (currentStationIdRef.current === requestedStationId) setBookingError(error.message);
      } finally {
        focusRefreshRef.current = false;
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [isRoomOpen, stationId, ownsStationBooking, stationBooking?._id, currentUser?.token, dispatch, refreshAvailability]);

  const handleBook = async () => {
    if (!currentUser?.token) {
      setBookingError("Sign in to reserve a station slot.");
      dispatch({ type: "OPEN_LOGIN" });
      return;
    }
    if (!stationId || bookingRequestRef.current) return;
    bookingRequestRef.current = true;
    setBookingPending(true);
    setBookingError("");
    setBookingMessage(null);
    try {
      const result = await createBooking(stationId, currentUser.token, dispatch);
      if (currentStationIdRef.current !== stationId) return;
      setStationBooking(result.booking);
      setAvailability(result.availability);
      setBookingMessage(`Booking confirmed. It expires ${new Date(result.booking.expiresAt).toLocaleString()}.`);
      await refreshAvailability();
    } catch (error) {
      if (currentStationIdRef.current !== stationId) return;
      if (error.status === 401) dispatch({ type: "OPEN_LOGIN" });
      if (error.code === "STATION_FULL" && error.details?.availability) setAvailability(error.details.availability);
      setBookingError(
        error.code === "STATION_FULL" ? "This station is full right now. Availability has been refreshed."
          : error.code === "ACTIVE_BOOKING_EXISTS" ? "You already have an active booking at this station."
            : error.code === "CAPACITY_NOT_CONFIGURED" ? "Booking capacity has not been configured for this station."
              : error.status === 401 ? "Your session has expired. Please sign in again."
                : error.message
      );
      if (error.code === "ACTIVE_BOOKING_EXISTS" && currentUser?.token) {
        try {
          const bookings = await getMyBookings({ token: currentUser.token }, dispatch);
          const ownBooking = bookings.find((booking) => {
            const bookingRoomId = typeof booking.roomId === "object" ? booking.roomId?._id : booking.roomId;
            return String(bookingRoomId) === String(stationId);
          });
          if (currentStationIdRef.current === stationId) setStationBooking(ownBooking || null);
        } catch {
          // Keep the conflict message visible if the follow-up history request also fails.
        }
      }
      if (error.code === "STATION_FULL") await refreshAvailability();
    } finally {
      bookingRequestRef.current = false;
      setBookingPending(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!ownsStationBooking || !stationBooking?._id || cancellationPending || !window.confirm("Cancel this station reservation?")) return;
    const requestedStationId = stationId;
    setCancellationPending(true);
    setBookingError("");
    setBookingMessage(null);
    try {
      const result = await cancelBooking(stationBooking._id, currentUser.token, dispatch);
      if (currentStationIdRef.current !== requestedStationId) return;
      setStationBooking(result.booking);
      setAvailability(result.availability);
      setBookingMessage(result.booking.status === "cancelled" ? "Booking cancelled. The slot is available again." : "This booking has already expired.");
      await refreshAvailability();
    } catch (error) {
      if (currentStationIdRef.current !== requestedStationId) return;
      if (error.status === 401) dispatch({ type: "OPEN_LOGIN" });
      setBookingError(error.message);
    } finally {
      setCancellationPending(false);
    }
  };

  const handleClose = () => {
    dispatch({ type: "UPDATE_ROOM", payload: null });
  };

  return (
    <Dialog
      fullScreen
      open={Boolean(room)}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar position="relative" color="primary">
        <Toolbar>
          <Typography variant="h6" component="h3" sx={{ ml: 2, flex: 1 }}>
            {room?.title}
          </Typography>
          <IconButton color="inherit" onClick={handleClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ pt: { xs: 2, sm: 3, md: 5 }, pb: { xs: 3, md: 5 } }}>
        <Swiper
          modules={[Navigation, Autoplay, EffectCoverflow, Lazy, Zoom]}
          centeredSlides
          slidesPerView={1}
          breakpoints={{
            600: { slidesPerView: 1.5 },
            900: { slidesPerView: 2 },
          }}
          grabCursor
          navigation
          autoplay
          lazy
          zoom
          effect="coverflow"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
        >
          {room?.images?.map((url) => (
            <SwiperSlide key={url}>
              <div className="swiper-zoom-container">
                <img src={url} alt={`${room?.title || "Station"} image`} />
              </div>
            </SwiperSlide>
          ))}
          <Tooltip
            title={room?.uName || ""}
            sx={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              zIndex: 2,
            }}
          >
            <Avatar src={room?.uPhoto} />
          </Tooltip>
        </Swiper>
        <Stack
          sx={{
            p: { xs: 2, sm: 3 },
            mt: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
          }}
          spacing={2}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="overline" color="text.secondary">PRICE</Typography>
              <Typography component="span" variant="h6" sx={{ color: "secondary.main" }}>
                {room?.price === 0
                  ? "Free with Subscription"
                  : "$" + room?.price}
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary" display="block">PLACE</Typography>
              <Typography>{place?.text || "Location details loading"}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" display="block">ADDRESS</Typography>
              <Typography>{place?.place_name || `${room?.lat}, ${room?.lng}`}</Typography>
            </Box>
          </Stack>
          <Stack>
            <Typography variant="overline" color="text.secondary">STATION DETAILS</Typography>
            <Typography sx={{ mt: 0.5, lineHeight: 1.75 }}>{room?.description}</Typography>
          </Stack>
          <Box aria-live="polite" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: "background.default", border: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Station capacity</Typography>
            {availabilityLoading && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                <CircularProgress size={18} aria-label="Loading station availability" />
                <Typography variant="body2">Checking current availability…</Typography>
              </Stack>
            )}
            {availabilityError && (
              <Alert severity="error" action={<Button color="inherit" size="small" onClick={refreshAvailability}>Retry</Button>} sx={{ mb: 1 }}>
                Could not load station availability: {availabilityError}
              </Alert>
            )}
            {!availabilityLoading && availability?.capacityConfigured === false && (
              <Alert severity="info" sx={{ mb: 1 }}>Booking capacity not configured. This station can still be viewed, but reservations are unavailable.</Alert>
            )}
            {availability?.capacityConfigured && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{availability.availableSlots}</strong> of {availability.totalSlots} slots available
              </Typography>
            )}
            {bookingLoading && currentUser && <Typography variant="body2" color="text.secondary">Checking your booking…</Typography>}
            {isActiveBooking && (
              <Alert severity="success" sx={{ mb: 1 }}>
                <Typography fontWeight={700}>Your booking is active</Typography>
                <Typography variant="body2">Expires {new Date(stationBooking.expiresAt).toLocaleString()}</Typography>
                <Typography variant="body2" aria-live="polite">
                  {Math.floor(remainingMs / 60000)}:{String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")} remaining
                </Typography>
                <Button size="small" color="error" disabled={cancellationPending} onClick={handleCancelBooking} sx={{ mt: 1 }}>
                  {cancellationPending ? "Cancelling…" : "Cancel booking"}
                </Button>
              </Alert>
            )}
            {!isActiveBooking && ownsStationBooking && stationBooking?.status === "active" && expiryTime <= clockNow && (
              <Alert severity="info" sx={{ mb: 1 }}>The reservation time has ended. Confirming its status with the server…</Alert>
            )}
            {!isActiveBooking && ownsStationBooking && stationBooking && ["expired", "cancelled"].includes(stationBooking.status) && (
              <Alert severity={stationBooking.status === "expired" ? "warning" : "info"} sx={{ mb: 1 }}>
                Your previous booking is {stationBooking.status}. You may reserve again if capacity is available.
              </Alert>
            )}
            {bookingMessage && <Alert severity="success" onClose={() => setBookingMessage(null)} sx={{ mb: 1 }}>{bookingMessage}</Alert>}
            {bookingError && <Alert severity="error" onClose={() => setBookingError("")} sx={{ mb: 1 }}>{bookingError}</Alert>}
            <Button
              variant="contained"
              color="primary"
              onClick={handleBook}
              disabled={bookingPending || bookingLoading || availabilityLoading || !availability?.capacityConfigured || availability.availableSlots <= 0 || isActiveBooking}
              startIcon={bookingPending ? <CircularProgress color="inherit" size={16} /> : undefined}
              sx={{ mt: 1 }}
            >
              {bookingPending ? "Booking…" : isActiveBooking ? "Booking active" : availability?.capacityConfigured && availability.availableSlots === 0 ? "Fully booked" : "Book Slot"}
            </Button>
            {!currentUser && availability?.capacityConfigured && availability.availableSlots > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Sign in is required to reserve a slot.</Typography>
            )}
          </Box>
        </Stack>
      </Container>
    </Dialog>
  );
};

export default Room;
