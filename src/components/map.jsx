import React, { useState } from "react";
import GoogleMapReact from "google-map-react";
import { useUserInfo } from "../store/infoStore";

// Thành phần hiển thị marker
const Marker = ({ text }) => (
  <div style={{
    color: "red",
    background: "white",
    padding: "5px 10px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "translate(-50%, -50%)",
    fontWeight: "bold",
  }}>
    {text}
  </div>
);

export default function SimpleMap() {
  const [latitude, setLatitude] = useUserInfo.latitude();
  const [longitude, setLongitude] = useUserInfo.longitude();

  const defaultProps = {
    center: {
      lat: latitude,
      lng: longitude,
    },
    zoom: 18,
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAP_KEY_API }} // Thay bằng API Key của bạn
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onClick={(e) => { //Cho phép chọn vị trí
          setLat(e.lat); 
          setLong(e.lng);
        }}
      >
        <Marker lat={latitude} lng={longitude} text="📍" />
      </GoogleMapReact>
    </div>
  );
}
