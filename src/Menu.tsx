import React, { useState } from "react";

interface MenuProps {
  // open: boolean,
}

export function Menu({ }: MenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div id="menu" onClick={() => { setOpen(!open) }}>
      <div id="bars">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      {open ? <div id="about">
        <p>זה הטקסט אודות האתר.</p>
        <p>את כל הקוד אפשר למצוא ב<a href="">גיטהאב</a>.</p>
      </div> : null}
    </div>
  );
}
