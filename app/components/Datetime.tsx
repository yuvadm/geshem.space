import React from "react";
import { DateTime as LuxonDateTime } from "luxon";

interface DateTimeProps {
  images: string[],
  slider: number
}

export function DateTime({ images, slider }: DateTimeProps) {
  let datetime = null;

  if (images.length > 0) {
    const ds = images[slider].substring(5, 18);
    datetime = LuxonDateTime.fromFormat(ds, "yyyyMMdd/HHmm", {
      zone: "utc",
    }).setZone("Asia/Jerusalem");
  }

  const date = datetime ? datetime.toFormat("dd/MM/y") : "";
  const time = datetime ? datetime.toFormat("HH:mm") : "";

  return (
    <div id="datetime" className="absolute top-3 left-5 font-mono text-gray-200">
      <div id="date" className="text-lg">{date}</div>
      <div id="time" className="text-4xl">{time}</div>
    </div>
  );
}
