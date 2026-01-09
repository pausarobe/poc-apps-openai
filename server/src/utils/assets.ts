import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function loadWebAssets(WEB_DIST: string) {
  return {
    JS: readFileSync(join(WEB_DIST, 'component.js'), 'utf8'),
    JS_FLIGHT_DASHBOARD: readFileSync(join(WEB_DIST, 'flight-dashboard.js'), 'utf8'),
    JS_FLIGHT_DETAIL: readFileSync(join(WEB_DIST, 'flight-detail.js'), 'utf8'),
  };
}
