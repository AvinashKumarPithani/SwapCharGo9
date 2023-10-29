import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { AddLocationAlt, Bed, LocationOn } from "@mui/icons-material";
import EvStationIcon from "@mui/icons-material/EvStation";
import { useEffect, useRef, useState } from "react";
import ClusterMap from "./map/ClusterMap";
import Rooms from "./rooms/Rooms";
import AddRoom from "./addRoom/AddRoom";
import Protected from "./protected/Protected";
import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const Theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
  },
});

const BottomNav = () => {
  const [value, setValue] = useState(0);
  const ref = useRef();
  useEffect(() => {
    ref.current.ownerDocument.body.scrollTop = 0;
  }, [value]);
  return (
    <ThemeProvider theme={Theme}>
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
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 2 }}
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
    </ThemeProvider>
  );
};

export default BottomNav;
