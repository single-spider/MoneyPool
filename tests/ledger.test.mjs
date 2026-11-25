import test from "node:test";
import assert from "node:assert/strict";
import {parseMoney,splitAmount,balances,upiUri} from "../src/ledger.mjs";
test("rounding conserves paise",()=>assert.deepEqual(splitAmount(100,["a","b","c"],"equal").map(x=>x.amount),[34,33,33]));
test("percentage validates sum",()=>assert.throws(()=>splitAmount(100,["a","b"],"percentage",{a:40,b:40})));
test("shares conserve total",()=>assert.deepEqual(splitAmount(101,["a","b"],"shares",{a:1,b:2}).map(x=>x.amount),[34,67]));
test("exact split validates total",()=>assert.throws(()=>splitAmount(100,["a","b"],"exact",{a:"0.50",b:"0.49"})));
test("pending does not settle; confirmed does",()=>{const e=[{payer_id:"b",splits:[{user_id:"a",amount:10000}]}];const p={payer_id:"a",recipient_id:"b",amount:3000,status:"reported"};assert.equal(balances(e,[p],"a").b,10000);assert.equal(balances(e,[{...p,status:"confirmed"}],"a").b,7000);});
test("precise decimal parsing",()=>assert.equal(parseMoney("123.45"),12345));
test("UPI encodes exact amount",()=>assert.match(upiUri({upi:"friend@example",recipient_name:"A & B",amount:10001,id:"abc"}),/am=100.01/));

import {demoQrPayload,reservedAmount,categoryTotals} from "../src/ledger.mjs";
test("voided expense no longer affects balances",()=>assert.deepEqual(balances([{payer_id:"b",voided_at:"today",splits:[{user_id:"a",amount:500}]}],[],"a"),{}));
test("reversal retains confirmed repayment",()=>assert.equal(balances([{payer_id:"b",voided_at:"today",splits:[{user_id:"a",amount:500}]}],[{payer_id:"a",recipient_id:"b",amount:200,status:"confirmed"}],"a").b,-200));
test("demo QR never contains a payment URI",()=>assert.ok(!demoQrPayload({id:"demo",recipient_name:"Riya",amount:100}).startsWith("upi:")));
test("pending request reserves funds but confirmed does not",()=>assert.equal(reservedAmount([{payer_id:"a",recipient_id:"b",status:"reported",amount:100},{payer_id:"a",recipient_id:"b",status:"confirmed",amount:200}],"a","b"),100));
test("category summary excludes voided records",()=>assert.deepEqual(categoryTotals([{category:"Food",splits:[{user_id:"a",amount:100}]},{category:"Food",voided_at:"now",splits:[{user_id:"a",amount:200}]}],"a"),[["Food",100]]));
