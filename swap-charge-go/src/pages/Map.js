import React from "react";
import Loading from "../components/Loading";
import NavBar from "../components/NavBar";
import Notification from "../components/Notification";
import Login from "../components/user/Login";
import BottomNav from "../components/BottomNav";
import "mapbox-gl/dist/mapbox-gl.css";
import Room from "../components/rooms/Room";
import Protected from "../components/protected/Protected";

const Map = () => {
  return (
    <>
      <Loading />
      <Notification />
      <Login />
      <NavBar />
      <BottomNav />
      <Room />
    </>
  );
};

export default Map;
