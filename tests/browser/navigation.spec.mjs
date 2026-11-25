import {test,expect} from '@playwright/test';
test('history, deep links and expense details',async({page})=>{
 await page.goto('./');
 await page.getByRole('button',{name:'Activity',exact:true}).click();
 await expect(page).toHaveURL(/view=activity/);
 await page.getByRole('button',{name:'Dinner at the rooftop',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Expense details'})).toContainText('Split breakdown');
 await page.keyboard.press('Escape');
 await page.reload();
 await expect(page.getByRole('heading',{name:'Activity',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Overview',exact:true}).click();
 await page.goBack();
 await expect(page.getByRole('heading',{name:'Activity',exact:true})).toBeVisible();
});
