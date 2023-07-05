import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Map from "./pages/Map";
import ContextProvider from "./context/ContextProvider";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />}></Route>
        <Route path="/map" element={
        <ContextProvider><Map /></ContextProvider>}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
