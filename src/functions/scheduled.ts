// Cloudflare Workers scheduled handler for cron jobs
import type { ScheduledController, ScheduledEvent } from '@cloudflare/workers-types';

interface Env {
  BASE_URL: string;
  AUTH_USER: string;
  AUTH_PASS: string;
  IMGS_BUCKET: R2Bucket;
}

interface ImageData {
  [key: string]: string[];
}

class GeshemUpdate {
  private bucket: R2Bucket;
  private env: Env;

  constructor(bucket: R2Bucket, env: Env) {
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

  private async generateJson(): Promise<void> {
    const latestKeys = await this.getLatestBucketKeys();
    const keys = latestKeys
      .filter(key => key.endsWith('280.png'))
      .sort()
      .slice(-10);

    const index: ImageData = { '280': keys };

    await this.bucket.put('imgs.json', JSON.stringify(index), {
      httpMetadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=60'
      }
    });
  }

  async run(): Promise<string> {
    try {
      const updated = await this.fetchMissingImages();
      if (updated) {
        await this.generateJson();
      }
      return `Updated: ${updated}`;
    } catch (error) {
      console.error('Error in GeshemUpdate.run():', error);
      throw error;
    }
  }
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Cron job triggered at', new Date().toISOString());

    try {
      if (!env?.BASE_URL || !env?.AUTH_USER || !env?.AUTH_PASS) {
        throw new Error('Missing environment variables');
      }

      if (!env.IMGS_BUCKET) {
        throw new Error('R2 bucket not configured');
      }

      const updater = new GeshemUpdate(env.IMGS_BUCKET, env);
      const result = await updater.run();

      console.log(`Cron job completed: ${result}`);
    } catch (error) {
      console.error('Error in scheduled function:', error);
      throw error;
    }
  }
};