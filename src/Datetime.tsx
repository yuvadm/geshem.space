import React from "react";
import { DateTime as LuxonDateTime } from "luxon";

function DateTime(props) {
  let { images, slider } = props;
  let datetime = null;

  if (images.length > 0) {
    const ds = images[slider].substr(5, 13);
    datetime = LuxonDateTime.fromFormat(ds, "yyyyMMdd/HHmm", {
      zone: "utc",
    }).setZone("Asia/Jerusalem");
  }

  const date = datetime ? datetime.toFormat("dd/MM/y") : "";
  const time = datetime ? datetime.toFormat("HH:mm") : "";

  return (
    <div id="datetime">
      <div id="date">{date}</div>
      <div id="time">{time}</div>
    </div>
  );
}

export default DateTime;
