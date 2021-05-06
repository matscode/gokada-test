import React from "react";
import FI from "./FI";

export default function GetLocationButton({ onClick }) {
    return (
        <a
            href="#"
            className="d-inline-block bg-white shadow rounded"
            style={
                {
                    position: 'fixed',
                    bottom: '150px',
                    right: '8px'
                }
            }
            onClick={onClick}
        >
            <FI icon="crosshair" className="bg-transparent" />
        </a>
    );
}
