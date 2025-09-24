import type { APIRoute } from 'astro';

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

    // Get the latest images from yesterday onwards
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');

    const objects = await bucket.list({
      prefix: 'imgs/',
      startAfter: `imgs/${yesterdayStr}`
    });

    // Filter for 280.png files and get the latest 10
    const imageKeys = objects.objects
      .map((obj: any) => obj.key)
      .filter((key: string) => key.endsWith('/280.png'))
      .sort()
      .slice(-10);

    // Transform keys to full URLs
    const images = imageKeys.map((key: string) => {
      // Extract date/time from path: imgs/20250622/0930/280.png
      const pathParts = key.split('/');
      const date = pathParts[1];
      const time = pathParts[2];
      const filename = pathParts[3];

      return {
        path: key,
        url: `https://imgs.geshem.space/${date}/${time}/${filename}`,
        date: date,
        time: time
      };
    });

    return new Response(JSON.stringify({
      images: images,
      count: images.length,
      timestamp: new Date().toISOString()
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