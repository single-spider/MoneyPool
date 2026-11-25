# Mobile delivery
Responsive web UI uses a bottom navigation bar at mobile widths. PWA manifest includes standalone display and SVG icon. Production service worker caches static shell and hashed assets, never API responses. Offline connected financial writes are unsupported.
## Capacitor
Existing capacitor.config.json defines appId com.moneypool.app, name MoneyPool and webDir dist. Install matching current Capacitor CLI/core/platform versions. npm run build; npx cap add android (or ios); npx cap sync. Open native IDE for signing and device tests. iOS builds require supported macOS/Xcode; Android requires supported SDK/JDK.
## Release checklist
Generate native icons/splash screens, safe-area layouts, keyboard handling, deep-link and auth redirects, UPI intent behavior, external browser fallback, accessibility, privacy declarations, signing, store policies and device testing. Do not ship until actual transfer and confirmation flows are validated. Store accounts may incur fees; obtain approval.
