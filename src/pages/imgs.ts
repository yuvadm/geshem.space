import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';

export const prerender = false;

interface CloudflareEnv {
  IMGS_BUCKET: R2Bucket;
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;

    if (!env?.IMGS_BUCKET) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    const bucket = env.IMGS_BUCKET;

    // Get images from the last hour
    const now = DateTime.utc();
    const oneHourAgo = now.minus({ hours: 1 });

    // Search from 6 hours ago to have a buffer in case some images are missing
    const sixHoursAgo = now.minus({ hours: 6 });
    const startDate = sixHoursAgo.toFormat('yyyyMMdd');
    const startHour = sixHoursAgo.toFormat('HH');

    const objects = await bucket.list({
      prefix: 'imgs/',
      startAfter: `imgs/${startDate}/${startHour}`
    });

    // Filter for gis.png files from the last hour and get up to 12 images
    const imageKeys = objects.objects
      .map((obj: any) => obj.key)
      .filter((key: string) => {
        if (!key.endsWith('/gis.png')) return false;

        // Extract date/time from path: imgs/20251003/0950/gis.png
        const pathParts = key.split('/');
        if (pathParts.length !== 4) return false;

        const dateStr = pathParts[1]; // YYYYMMDD
        const timeStr = pathParts[2]; // HHMM

        // Parse as UTC timestamp using luxon
        const imageTime = DateTime.fromFormat(
          `${dateStr} ${timeStr}`,
          'yyyyMMdd HHmm',
          { zone: 'utc' }
        );

        if (!imageTime.isValid) return false;

        return imageTime >= oneHourAgo && imageTime <= now;
      })
      .sort()
      .slice(-12);

    // Transform keys to full URLs
    const images = imageKeys.map((key: string) => {
      // Extract date/time from path: imgs/20251003/0950/gis.png
      const pathParts = key.split('/');
      const date = pathParts[1];
      const time = pathParts[2];
      const filename = pathParts[3];

      return {
        path: key,
        url: `https://imgs.geshem.space/imgs/${date}/${time}/${filename}`,
        date: date,
        time: time
      };
    });

    return new Response(JSON.stringify({
      images: images,
      count: images.length,
      timestamp: DateTime.utc().toISO()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60'
      }
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch images',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};