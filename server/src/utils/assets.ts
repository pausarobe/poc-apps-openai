import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function loadWebAssets(WEB_DIST: string) {
  return {
    CSS: readFileSync(join(WEB_DIST, 'styles.css'), 'utf8'),
    JS_FLIGHT_DETAIL: readFileSync(join(WEB_DIST, 'flight-detail.js'), 'utf8'),
    JS_FLIGHT_DASHBOARD: readFileSync(join(WEB_DIST, 'flight-dashboard.js'), 'utf8'),
    JS_CAR_DETAIL: readFileSync(join(WEB_DIST, 'car-detail.js'), 'utf8'),
    JS_CAR_DASHBOARD: readFileSync(join(WEB_DIST, 'car-dashboard.js'), 'utf8'),
    JS_CAR_CREATE: readFileSync(join(WEB_DIST, 'car-create.js'), 'utf8'),
    JS_RENFE: readFileSync(join(WEB_DIST, 'train-dashboard.js'), 'utf8'),
    JS_ITEM_DASHBOARD: readFileSync(join(WEB_DIST, 'item-dashboard.js'), 'utf8'),
  };
}
