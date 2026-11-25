import test from 'node:test';import assert from 'node:assert/strict';import {pageFromUrl,urlForPage} from '../src/navigation.mjs';
test('navigation preserves base and auth fragment',()=>{const x=urlForPage('https://example.com/MoneyPool/?a=1#auth','Activity');assert.equal(x.pathname,'/MoneyPool/');assert.equal(x.searchParams.get('a'),'1');assert.equal(x.hash,'#auth');assert.equal(pageFromUrl(x),'Activity');assert.equal(urlForPage(x,'Overview').searchParams.has('view'),false);});
test('unknown view falls back safely',()=>assert.equal(pageFromUrl('https://example.com/?view=bad'),'Overview'));
