import React, { useState } from "react";

export function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <div id="menu" onClick={() => { setOpen(!open) }}>
      <div id="bars">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      {open && <div id="about">
        <p>ברוכים הבאים לגשם.ספייס!</p>
        <h2>מה זה?</h2>
        <p>גשם.ספייס מראה מיקום של ענני גשם בזמן אמת כפי שנקלטים במכ"מ של השירות המטארולוגי. התצוגה הזו מאפשרת לדעת האם בטווח הזמן הקצר ירד גשם באיזור שנמצאים בו. הסליידר בתחתית העמוד מראה את תזוזת העננים בשעה האחרונה.</p>
        <p>את כל הקוד של גשם.ספייס אפשר למצוא ב<a href="https://github.com/yuvadm/geshem.space">גיטהאב</a>.</p>
        <p>נבנה על ידי <a href="https://yuv.al">יובל אדם</a>.</p>
      </div>}
    </div>
  );
}
