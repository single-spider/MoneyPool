import {test,expect} from '@playwright/test';
test('split preview, export and persistent theme',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'＋ Add expense'}).click();
 await page.getByLabel('Description').fill('Snacks');
 await page.getByLabel('Amount (₹)').fill('100');
 await page.getByRole('button',{name:'Preview split'}).click();
 await expect(page.locator('.split-preview')).toContainText('33.34');
 await page.getByRole('button',{name:'Save expense'}).click();
 await page.getByRole('button',{name:'Activity',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export CSV'}).click();
 expect((await download).suggestedFilename()).toBe('moneypool-expenses.csv');
 await page.getByRole('button',{name:'Toggle color theme'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
