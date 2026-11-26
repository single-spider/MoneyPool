import {test,expect} from '@playwright/test';
test('unreadable demo records survive startup and retry',async({page})=>{
 await page.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('mp-demo-v1','{"groups":null}');sessionStorage.setItem('seeded','yes')}});
 await page.goto('./');await expect(page.getByRole('heading',{name:'Demo data unavailable'})).toBeVisible();
 await page.getByRole('button',{name:'Retry'}).click();await expect(page.getByRole('heading',{name:'Demo data unavailable'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('mp-demo-v1'))).toBe('{"groups":null}');
});
