import {test,expect} from '@playwright/test';
test('manifest and service worker resolve inside the deployed base path',async({page})=>{
 await page.goto('./');
 await expect(page.getByRole('heading',{name:'Overview'})).toBeVisible();
 const info=await page.evaluate(async()=>{
   const href=document.querySelector('link[rel=manifest]').href;
   const manifest=await fetch(href).then(r=>{if(!r.ok)throw Error('manifest unavailable');return r.json()});
   const reg=await navigator.serviceWorker.ready;
   return {href,scope:reg.scope,manifestScope:new URL(manifest.scope,href).href,start:new URL(manifest.start_url,href).href,icon:new URL(manifest.icons[0].src,href).href};
 });
 const base=new URL('./',page.url()).href;
 expect(info.href).toBe(base+'manifest.webmanifest');
 expect(info.scope).toBe(base);
 expect(info.manifestScope).toBe(base);
 expect(info.start).toBe(base);
 expect((await page.request.get(info.icon)).ok()).toBeTruthy();
});
