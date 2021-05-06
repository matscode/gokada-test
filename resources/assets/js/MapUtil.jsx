import React from "react";
import ReactDOM from "react-dom";

export const renderMapElement = jsx => {
    const div = document.createElement("div");
    // div.style.display = 'inline-block'
    ReactDOM.render(jsx, div);
    return div;
};
