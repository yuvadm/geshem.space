import type { APIRoute } from 'astro';

export const prerender = false;


interface CloudflareEnv {
  BASE_URL: string;
  AUTH_USER: string;
  AUTH_PASS: string;
  IMGS_BUCKET: R2Bucket;
  SCHEDULED?: boolean;
}

class GeshemUpdate {
  private bucket: R2Bucket;
  private env: CloudflareEnv;

  constructor(bucket: R2Bucket, env: CloudflareEnv) {
    this.bucket = bucket;
    this.env = env;
  }

  private async authenticate(request: Request): Promise<Request> {
    const headers = new Headers(request.headers);
    const credentials = btoa(`${this.env.AUTH_USER}:${this.env.AUTH_PASS}`);
    headers.set('Authorization', `Basic ${credentials}`);

    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body
    });
  }

  private async getLatestImages(): Promise<string[]> {
    const authenticatedRequest = await this.authenticate(new Request(this.env.BASE_URL));
    const response = await fetch(authenticatedRequest);
    const html = await response.text();

    const regex = /radar280comp_\d+\.png/g;
    const matches = html.match(regex) || [];
    const uniqueImages = [...new Set(matches)];

    return uniqueImages.sort().slice(-10);
  }

  private async getLatestBucketKeys(): Promise<string[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');

    try {
      const objects = await this.bucket.list({
        prefix: 'imgs/',
        startAfter: `imgs/${yesterdayStr}`
      });

      return objects.objects.map(obj => obj.key);
    } catch (error) {
      console.error('Error listing bucket objects:', error);
      return [];
    }
  }

  private async fetchMissingImages(): Promise<boolean> {
    const images = await this.getLatestImages();
    const s3Images = await this.getLatestBucketKeys();
    let updated = false;

    for (const img of images) {
      const key = this.keyFromFilename(img);
      if (!s3Images.includes(key)) {
        await this.fetchImage(img, key);
        updated = true;
      }
    }

    return updated;
  }

  private async fetchImage(imgName: string, key: string): Promise<void> {
    console.log(`Downloading ${imgName} from web server`);

    const imageUrl = `${this.env.BASE_URL}/${imgName}`;
    const authenticatedRequest = await this.authenticate(new Request(imageUrl));
    const response = await fetch(authenticatedRequest);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageData = await response.arrayBuffer();

    console.log(`Uploading to ${key}`);
    await this.bucket.put(key, imageData, {
      httpMetadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
      }
    });
  }

  private keyFromFilename(filename: string): string {
    const [name, dateStr] = filename.split('.')[0].split('_');
    const res = 280;

    // Parse date: YYYYMMDDHHMM
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(8, 10);
    const minute = dateStr.slice(10, 12);

    const d = `${year}${month}${day}`;
    const t = `${hour}${minute}`;

    return `imgs/${d}/${t}/${res}.png`;
  }


  async run(): Promise<string> {
    try {
      const updated = await this.fetchMissingImages();
      return `Updated: ${updated}`;
    } catch (error) {
      console.error('Error in GeshemUpdate.run():', error);
      throw error;
    }
  }
}

export const GET: APIRoute = async ({ locals, request }) => {
  // This endpoint should only be accessible via Cloudflare Cron
  const cron = request.headers.get('CF-Cron');
  if (!cron) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const env = (locals as any).runtime?.env as unknown as CloudflareEnv;

    if (!env?.BASE_URL || !env?.AUTH_USER || !env?.AUTH_PASS) {
      return new Response('Missing environment variables', { status: 500 });
    }

    if (!env.IMGS_BUCKET) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    const bucket = env.IMGS_BUCKET;

    const updater = new GeshemUpdate(bucket, env);
    const result = await updater.run();

    return new Response(JSON.stringify({
      message: `SUCCESS: ${result}`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in update handler:', error);
    return new Response(JSON.stringify({
      message: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};