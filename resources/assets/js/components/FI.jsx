import React from "react";
export default ({ style, icon, className }) => (
    <div
        style={{
            backgroundColor: "#f6f6f6",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            ...style
        }}
        className={`d-inline-flex justify-content-center align-items-center ${className}`}
    >
        <img src={`../../img/${icon}.svg`} alt="" />
    </div>
);
