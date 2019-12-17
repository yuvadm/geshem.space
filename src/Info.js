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
          <p>
            <strong>
              Geshem.space shows real-time rain radar data in Israel
            </strong>
          </p>
          <p>
            Rain clouds show up as colored patches on the map, a warmer color
            means stronger percipication
          </p>
          <p>
            Use the slider on the bottom to scroll through the animation of the
            last hour and determine whether the clouds are coming your way
          </p>
          <p>
            Developed by <a href="https://yuv.al">Yuval Adam</a>
          </p>
          <p>
            Source code available on{" "}
            <a href="https://github.com/yuvadm/geshem.space">Github</a>
          </p>
        </div>
        <div id="info-heb">
          <p>
            <strong>גשם.ספייס מציג בזמן אמת ענני גשם בכל הארץ</strong>
          </p>
          <p>
            עננים מופיעים כגושים צבעוניים על גבי המפה, צבע חם יותר מסמל עננות
            צפופה ולכן גשם חזק יותר
          </p>
          <p>
            השתמשו בסליידר בתחתית המסך כדי לגלול באנימציה של העננים בשעה האחרונה
            על מנת להבין האם ענני הגשם בדרך אליכם
          </p>
          <p>
            פותח ע"י <a href="https://yuv.al">יובל אדם</a>
          </p>
          <p>
            קוד המקור זמין ב
            <a href="https://github.com/yuvadm/geshem.space">גיטהאב</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Info;
