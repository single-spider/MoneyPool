import {defineConfig} from '@playwright/test';
import {basePath} from './scripts/base-path.mjs';
const appURL='http://127.0.0.1:4173'+basePath();
export default defineConfig({testDir:'./tests/browser',use:{baseURL:appURL},webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4173',url:appURL,reuseExistingServer:!process.env.CI},projects:[{name:'desktop',use:{browserName:'chromium'}},{name:'mobile',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true}}]});
