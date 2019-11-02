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
        <div id="info-eng">
          <p>Geshem.space shows real-time rain radar data in Israel.</p>
          <p>The entire source code is open and available at</p>
          <p>
            <a href="https://github.com/yuvadm/geshem.space">
              https://github.com/yuvadm/geshem.space
            </a>
          </p>
        </div>
        <div id="info-heb">
          <p>גשם.ספייס מציג מידע בזמן אמת על ענני גשם בכל הארץ</p>
          <p>קוד המקור של האתר פתוח וזמין לצפייה בכתובת</p>
          <p>
            <a href="https://github.com/yuvadm/geshem.space">
              https://github.com/yuvadm/geshem.space
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Info;
