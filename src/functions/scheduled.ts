// Cloudflare Workers scheduled handler for cron jobs
import type { ScheduledController, ScheduledEvent } from '@cloudflare/workers-types';
import { DateTime } from 'luxon';

interface Env {
  IMGS_BUCKET: R2Bucket;
}

interface RadarImage {
  id: string;
  forecast_time: string;
  modified: string;
  created: string;
  file_name: string;
  type: string;
}

interface RadarResponse {
  data: {
    types: {
      IMSRadar: RadarImage[];
    };
  };
}


class GeshemUpdate {
  private bucket: R2Bucket;
  private static readonly API_URL = 'https://ims.gov.il/he/radar_satellite';
  private static readonly BASE_URL = 'https://ims.gov.il';

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  private convertIsraeliToUTC(dateStr: string, timeStr: string): { date: string; time: string } {
    // Parse YYYYMMDD HHMM format in Israeli timezone
    const israeliTime = DateTime.fromFormat(
      `${dateStr} ${timeStr}`,
      'yyyyMMdd HHmm',
      { zone: 'Asia/Jerusalem' }
    );

    // Convert to UTC
    const utcTime = israeliTime.toUTC();

    // Format as YYYYMMDD and HHMM
    return {
      date: utcTime.toFormat('yyyyMMdd'),
      time: utcTime.toFormat('HHmm')
    };
  }

  private async getLatestImage(): Promise<RadarImage | null> {
    const response = await fetch(GeshemUpdate.API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch radar data: ${response.statusText}`);
    }

    const data: RadarResponse = await response.json();
    const images = data.data.types.IMSRadar;

    if (!images || images.length === 0) {
      return null;
    }

    // Get the latest image (last in the array)
    return images[images.length - 1];
  }

  private parseFilename(filepath: string): { date: string; time: string } | null {
    // Extract filename from path: /sites/default/files/ims_data/map_images/IMSRadar4GIS/IMSRadar4GIS_202510030935_0.png
    const filename = filepath.split('/').pop();
    if (!filename) return null;

    // Match pattern: IMSRadar4GIS_YYYYMMDDHHMM_0.png
    const match = filename.match(/IMSRadar4GIS_(\d{8})(\d{4})_\d\.png/);
    if (!match) return null;

    const dateStr = match[1]; // YYYYMMDD
    const timeStr = match[2]; // HHMM

    return { date: dateStr, time: timeStr };
  }

  private async getExistingGisKeys(): Promise<Set<string>> {
    // Get yesterday's date in YYYYMMDD format
    const yesterday = DateTime.utc().minus({ days: 1 });
    const yesterdayStr = yesterday.toFormat('yyyyMMdd');

    console.log(`Listing bucket keys starting from ${yesterdayStr}`);

    const existingKeys = new Set<string>();

    try {
      const objects = await this.bucket.list({
        prefix: 'imgs/',
        startAfter: `imgs/${yesterdayStr}`
      });

      for (const obj of objects.objects) {
        // Only include keys that end with gis.png
        if (obj.key.endsWith('gis.png')) {
          existingKeys.add(obj.key);
        }
      }

      console.log(`Found ${existingKeys.size} existing gis.png files since ${yesterdayStr}`);
    } catch (error) {
      console.error('Error listing bucket objects:', error);
    }

    return existingKeys;
  }

  private async fetchAndStoreImages(): Promise<number> {
    // Get all images from API
    const apiImage = await this.getLatestImage();
    if (!apiImage) {
      console.log('No images found in API response');
      return 0;
    }

    // Get existing gis.png keys in bucket
    const existingKeys = await this.getExistingGisKeys();

    let savedCount = 0;

    console.log(`Processing image: ${apiImage.file_name}`);

    // Parse filename to get date and time
    const parsed = this.parseFilename(apiImage.file_name);
    if (!parsed) {
      console.error(`Failed to parse filename: ${apiImage.file_name}`);
      return 0;
    }

    console.log(`Parsed Israeli time - Date: ${parsed.date}, Time: ${parsed.time}`);

    // Convert Israeli time to UTC
    const utc = this.convertIsraeliToUTC(parsed.date, parsed.time);
    console.log(`Converted to UTC - Date: ${utc.date}, Time: ${utc.time}`);

    // Build R2 key: imgs/YYYYMMDD/HHMM/gis.png
    const key = `imgs/${utc.date}/${utc.time}/gis.png`;

    // Check if already exists
    if (existingKeys.has(key)) {
      console.log(`Image already exists at ${key}`);
      return 0;
    }

    // Fetch the image
    const imageUrl = `${GeshemUpdate.BASE_URL}${apiImage.file_name}`;
    console.log(`Downloading from ${imageUrl}`);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageData = await response.arrayBuffer();

    // Upload to R2
    console.log(`Uploading to ${key}`);
    await this.bucket.put(key, imageData, {
      httpMetadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
      }
    });

    savedCount++;

    return savedCount;
  }


  async run(): Promise<string> {
    try {
      const savedCount = await this.fetchAndStoreImages();
      return `Saved ${savedCount} new images`;
    } catch (error) {
      console.error('Error in GeshemUpdate.run():', error);
      throw error;
    }
  }
}

export async function handleSchedule(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  console.log('Cron job triggered at', new Date().toISOString());

  try {
    if (!env.IMGS_BUCKET) {
      throw new Error('R2 bucket not configured');
    }

    const updater = new GeshemUpdate(env.IMGS_BUCKET);
    const result = await updater.run();

    console.log(`Cron job completed: ${result}`);
  } catch (error) {
    console.error('Error in scheduled function:', error);
    throw error;
  }
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    return handleSchedule(controller, env, ctx);
  }
};