import { Box } from "@mui/material";
import ReactMapGL, {
  GeolocateControl,
  Marker,
  NavigationControl,
} from "react-map-gl";
import { useValue } from "../../../context/ContextProvider";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import Geocoder from "./Geocoder";

const AddLocation = () => {
  const {
    state: {
      location: { lng, lat },
    },
    dispatch,
  } = useValue();
  const mapRef = useRef();
  const hasLocation = [lng, lat].every(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)),
  );
  const initialLongitude = hasLocation ? Number(lng) : 78.96;
  const initialLatitude = hasLocation ? Number(lat) : 20.59;

  useEffect(() => {
    if (!lng && !lat) {
      fetch("https://ipapi.co/json")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          mapRef.current.flyTo({
            center: [data.longitude, data.latitude],
          });
          dispatch({
            type: "UPDATE_LOCATION",
            payload: { lng: data.longitude, lat: data.latitude },
          });
        });
    }
  }, []);
  return (
    <Box
      sx={{
        height: 400,
        position: "relative",
      }}
    >
      <ReactMapGL
        ref={mapRef}
        projection="mercator"
        mapboxAccessToken={process.env.REACT_APP_MAP_TOKEN}
        initialViewState={{
          longitude: initialLongitude,
          latitude: initialLatitude,
          zoom: hasLocation ? 8 : 4.2,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {hasLocation && (
          <Marker
            latitude={Number(lat)}
            longitude={Number(lng)}
            draggable
            onDragEnd={(e) =>
              dispatch({
                type: "UPDATE_LOCATION",
                payload: { lng: e.lngLat.lng, lat: e.lngLat.lat },
              })
            }
          />
        )}
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="top-left"
          trackUserLocation
          onGeolocate={(e) =>
            dispatch({
              type: "UPDATE_LOCATION",
              payload: { lng: e.coords.longitude, lat: e.coords.latitude },
            })
          }
        />
        <Geocoder />
      </ReactMapGL>
    </Box>
  );
};

export default AddLocation;
