import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
} from "@mui/material";
import { AddLocationAlt, LocationOn } from "@mui/icons-material";
import EvStationIcon from "@mui/icons-material/EvStation";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ClusterMap from "./map/ClusterMap";
import Rooms from "./rooms/Rooms";
import AddRoom from "./addRoom/AddRoom";
import Protected from "./protected/Protected";
import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const BottomNav = () => {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(() =>
    searchParams.get("tab") === "add" ? 2 : 0,
  );
  const ref = useRef();
  useEffect(() => {
    ref.current.ownerDocument.body.scrollTop = 0;
  }, [value]);
  return (
    <Box ref={ref}>
      {
        {
          0: <ClusterMap />,
          1: (
            <Protected>
              <Rooms />
            </Protected>
          ),
          2: (
            <Protected>
              <AddRoom setPage={setValue} />
            </Protected>
          ),
        }[value]
      }
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          borderTop: 1,
          borderColor: "divider",
          borderRadius: 0,
          backgroundColor: "#202827",
          boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.2)",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(e, newValue) => setValue(newValue)}
        >
          <BottomNavigationAction label="Map" icon={<LocationOn />} />
          <BottomNavigationAction label="Stations" icon={<EvStationIcon />} />
          <BottomNavigationAction label="Add" icon={<AddLocationAlt />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;
