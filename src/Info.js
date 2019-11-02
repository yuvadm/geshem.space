import React, { useState } from "react";

function Info(props) {
  const [open, setOpen] = useState(false);

  return (
    <div id="info">
      <div
        id="info-button"
        onClick={() => {
          setOpen(!open);
        }}
      >
        ?
      </div>
      <div id="info-modal" style={{ display: open ? "block" : "none" }}>
        This is the info page
      </div>
    </div>
  );
}

export default Info;
