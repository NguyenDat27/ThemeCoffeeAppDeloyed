import React, { useState } from "react";
import GoogleMapReact from "google-map-react";

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
  const [location, setLocation] = useState({
    lat: 10.831098,
    lng: 106.733128,
  });

  const defaultProps = {
    center: {
      lat: location.lat,
      lng: location.lng,
    },
    zoom: 15,
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyC-VRgtd5SUVoKvU5-rnfJzopJY2wgKDj0" }} // Thay bằng API Key của bạn
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onClick={(e) => setLocation({ lat: e.lat, lng: e.lng })} // Cho phép chọn vị trí bằng cách nhấn
      >
        <Marker lat={location.lat} lng={location.lng} text="📍" />
      </GoogleMapReact>
    </div>
  );
}
