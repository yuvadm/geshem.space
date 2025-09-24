import React from "react";
import { DateTime as LuxonDateTime } from "luxon";

interface DateTimeProps {
  images: string[];
  slider: number;
}

export function DateTime({ images, slider }: DateTimeProps) {
  let datetime: LuxonDateTime | null = null;

  if (images.length > 0 && images[slider]) {
    const ds = images[slider].substring(5, 18);
    datetime = LuxonDateTime.fromFormat(ds, "yyyyMMdd/HHmm", {
      zone: "utc",
    }).setZone("Asia/Jerusalem");
  }

  const date = datetime ? datetime.toFormat("dd/MM/y") : "";
  const time = datetime ? datetime.toFormat("HH:mm") : "";

  return (
    <div id="datetime" className="absolute top-5 left-5 text-white font-mono">
      <div id="date" className="text-xl">{date}</div>
      <div id="time" className="text-4xl">{time}</div>
    </div>
  );
}