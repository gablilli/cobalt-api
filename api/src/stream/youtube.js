import { spawn } from 'child_process';

export async function handleYouTubeStream(req, res) {
  const url = req.query.url;

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.code(400).send({ error: 'Invalid YouTube URL' });
  }

  res.header('Content-Type', 'video/mp4');
  res.header('Content-Disposition', 'attachment; filename="video.mp4"');

  const proc = spawn('yt-dlp', [
    '-f',
    'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
    '-o',
    '-',
    url,
  ]);

  proc.stdout.pipe(res.raw);

  proc.stderr.on('data', (data) => {
    console.error('[yt-dlp]', data.toString());
  });

  proc.on('close', (code) => {
    if (code !== 0 && !res.raw.headersSent) {
      res.status(500).send({ error: 'yt-dlp failed.' });
    }
  });
}
