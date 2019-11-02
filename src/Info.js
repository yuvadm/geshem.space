import React from "react";

function Info(props) {
  const [open, setOpen] = useState(false);

  if (images.length > 0) {
    const ds = images[slider].substr(5, 13);
    datetime = LuxonDateTime.fromFormat(ds, "yyyyMMdd/HHmm", {
      zone: "utc"
    }).setZone("Asia/Jerusalem");
  }

  const date = datetime ? datetime.toFormat("dd-MM-y") : "";
  const time = datetime ? datetime.toFormat("HH:mm") : "";

  return (
    <div id="info">
      <div id="info-button">?</div>
      <div id="info-modal">This is the info page</div>
    </div>
  );
}

export default Info;
