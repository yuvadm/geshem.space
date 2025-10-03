import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { handleSchedule } from './functions/scheduled';

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);
  return {
    default: {
      async fetch(request, env, ctx) {
        return handle(manifest, app, request, env, ctx);
      },
      async scheduled(controller, env, ctx) {
        return await handleSchedule(controller, env, ctx);
      }
    }
  };
}
