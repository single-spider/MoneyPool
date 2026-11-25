import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const views=['Overview','Groups','Activity','Payments','Friends','Insights','Settings'];
const pathFor=name=>name==='Overview'?'./':'./?view='+name.toLowerCase();
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
async function checkA11y(page){const r=await new AxeBuilder({page}).withTags(tags).analyze();expect(r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);}
async function checkOverflow(page){const x=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));expect(x.scroll).toBeLessThanOrEqual(x.width+1);}
for(const theme of ['light','dark']){
 test('accessibility '+theme,async({page})=>{
  test.setTimeout(90000);
  await page.addInitScript(t=>{localStorage.setItem('mp-theme',t)},theme);
  for(const view of views){await page.goto(pathFor(view));await expect(page.getByRole('heading',{name:view,exact:true})).toBeVisible();await checkOverflow(page);await checkA11y(page);}
  await page.goto('./');await page.getByRole('button',{name:'＋ Add expense'}).click();await expect(page.getByRole('dialog')).toBeVisible();await checkA11y(page);
 });
}
for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
 test('visual evidence '+width+' '+theme,async({page},info)=>{
  test.skip(info.project.name!=='desktop','Single screenshot matrix per build');
  test.setTimeout(90000);
  await page.setViewportSize({width,height:width<768?844:1000});
  await page.addInitScript(t=>{localStorage.setItem('mp-theme',t)},theme);
  for(const view of views){await page.goto(pathFor(view));await expect(page.getByRole('heading',{name:view,exact:true})).toBeVisible();await checkOverflow(page);await page.screenshot({path:info.outputPath(view+'.png'),fullPage:true,animations:'disabled'});}
 });
}
test('narrow layout survives long labels and large currency values',async({page})=>{
 await page.setViewportSize({width:320,height:844});
 await page.addInitScript(()=>{const id='me',other='other',name='A'.repeat(80);localStorage.setItem('mp-demo-v1',JSON.stringify({profile:{id,name},groups:[{id:'long',name:'Trip '+name,members:[{id,name},{id:other,name:'B'.repeat(80)}],expenses:[{id:'e',payer_id:other,title:'Long expense '+('C'.repeat(110)),amount:999999999,category:'Travel',created_at:'2026-11-01T00:00:00Z',splits:[{user_id:id,amount:999999999}]}],payments:[]}]}))});
 await page.goto('./');await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await checkOverflow(page);
 const buttons=await page.locator('nav button:visible').evaluateAll(bs=>bs.map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})));expect(buttons.every(b=>b.w>=44&&b.h>=44)).toBeTruthy();
 await page.getByRole('button',{name:'Activity',exact:true}).click();await checkOverflow(page);
 await page.getByRole('button',{name:'More',exact:true}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.getByRole('heading',{name:'Settings',exact:true})).toBeVisible();await checkOverflow(page);
});
