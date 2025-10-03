import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { handleSchedule } from './functions/scheduled';
import type { ExecutionContext } from '@cloudflare/workers-types';

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);
  return {
    default: {
      async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        // @ts-expect-error - https://github.com/withastro/astro/issues/14038
        return handle(manifest, app, request, env, ctx);
      },
      async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
        return await handleSchedule(controller, env, ctx);
      }
    } satisfies ExportedHandler<Env>
  };
}
