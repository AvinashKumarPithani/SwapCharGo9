import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Map from "./pages/Map";
import ContextProvider from "./context/ContextProvider";
import "mapbox-gl/dist/mapbox-gl.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />}></Route>
        <Route
          path="/map"
          element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ContextProvider>
                <Map />
              </ContextProvider>
            </ThemeProvider>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
