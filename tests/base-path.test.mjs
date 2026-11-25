import test from 'node:test';
import assert from 'node:assert/strict';
import {basePath} from '../scripts/base-path.mjs';
test('valid hosting bases',()=>{assert.equal(basePath('/'),'/');assert.equal(basePath('/MoneyPool/'),'/MoneyPool/');});
test('reject unsafe bases',()=>{for(const value of ['//','/../','/./','MoneyPool/','/MoneyPool','https://example.com/'])assert.throws(()=>basePath(value));});
