// api/stream/youtube.js
import { spawn } from "child_process";

export default async function youtube(streamInfo, res) {
  const url = streamInfo?.url;
  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Invalid YouTube URL" }));
    return;
  }

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);

  const proc = spawn("yt-dlp", [
    "-f",
    "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
    "-o",
    "-",
    url,
  ]);

  proc.stdout.pipe(res);
  proc.stderr.on("data", (data) => {
    console.error("[yt-dlp]", data.toString());
  });

  proc.on("close", (code) => {
    if (code !== 0 && !res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "yt-dlp failed" }));
    }
  });
}
