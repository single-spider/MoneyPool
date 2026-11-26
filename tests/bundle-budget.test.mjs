import test from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {checkBudget} from '../scripts/bundle-budget.mjs';
test('budget counts every JS chunk and excludes CSS',()=>{
 const content=Buffer.from('const x=1;'),assets=[{name:'main.js',content},{name:'lazy.js',content},{name:'style.css',content}];
 const bytes=2*gzipSync(content).length;
 assert.equal(checkBudget(assets,bytes),bytes);
 assert.throws(()=>checkBudget(assets,bytes-1),/budget exceeded/);
 assert.throws(()=>checkBudget([assets[2]]),/No JavaScript/);
});
