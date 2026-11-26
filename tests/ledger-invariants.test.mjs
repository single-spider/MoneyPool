import test from 'node:test';
import assert from 'node:assert/strict';
import {splitAmount,balances,reservedAmount} from '../src/ledger.mjs';

test('deterministic allocation conserves integer paise across varied totals and weights',()=>{
 for(let count=1;count<=12;count++){
  const ids=Array.from({length:count},(_,i)=>'member'+i);
  for(const total of [1,2,7,99,100,101,999999999]){
   const weights=Object.fromEntries(ids.map((id,i)=>[id,String(i+1)]));
   for(const method of ['equal','shares']){
    const rows=splitAmount(total,ids,method,weights);
    assert.deepEqual(rows.map(r=>r.user_id),ids);
    assert.equal(rows.reduce((s,r)=>s+r.amount,0),total);
    assert.ok(rows.every(r=>Number.isSafeInteger(r.amount)&&r.amount>=0));
    assert.deepEqual(rows,splitAmount(total,ids,method,weights));
    const denominator=method==='equal'?count:count*(count+1)/2;
    rows.forEach((r,i)=>assert.ok(Math.abs(r.amount-total*(method==='equal'?1:i+1)/denominator)<1));
   }
  }
 }
});

test('pairwise ledger remains antisymmetric through reversals and all payment states',()=>{
 const ids=['a','b','c','d'];
 const expenses=ids.map((payer_id,i)=>({payer_id,splits:splitAmount(101+i*17,ids,'equal'),...(i===2?{voided_at:'2026-11-26'}:{})}));
 const confirmed={payer_id:'a',recipient_id:'b',amount:13,status:'confirmed'};
 const baseline=ids.map(id=>balances(expenses,[confirmed],id));
 for(const status of ['created','reported','rejected','cancelled']){
  const p={payer_id:'b',recipient_id:'c',amount:7,status};
  const actual=ids.map(id=>balances(expenses,[confirmed,p],id));
  assert.deepEqual(actual,baseline);
  assert.equal(reservedAmount([p],'b','c'),['created','reported'].includes(status)?7:0);
 }
 let net=0;
 ids.forEach((id,i)=>ids.forEach((other,j)=>{
  const amount=baseline[i][other]||0;
  assert.equal(amount+(baseline[j][id]||0),0);
  net+=amount;
 }));
 assert.equal(net,0);
 const next=balances(expenses,[confirmed,{payer_id:'b',recipient_id:'c',amount:7,status:'confirmed'}],'b');
 assert.equal(next.c,(baseline[1].c||0)-7);
});
