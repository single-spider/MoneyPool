// Never overwrite unreadable saved records with sample data.
export const demoKey='mp-demo-v1';
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const id=x=>typeof x==='string'&&x.length>0;
const amount=x=>Number.isSafeInteger(x)&&x>=0;
export function validDemo(d){
 return record(d)&&record(d.profile)&&id(d.profile.id)&&typeof d.profile.name==='string'&&Array.isArray(d.groups)&&d.groups.every(g=>record(g)&&id(g.id)&&typeof g.name==='string'&&Array.isArray(g.members)&&g.members.every(m=>record(m)&&id(m.id)&&typeof m.name==='string')&&Array.isArray(g.expenses)&&g.expenses.every(e=>record(e)&&id(e.id)&&typeof e.title==='string'&&id(e.payer_id)&&amount(e.amount)&&Array.isArray(e.splits)&&e.splits.every(s=>record(s)&&id(s.user_id)&&amount(s.amount)))&&Array.isArray(g.payments)&&g.payments.every(p=>record(p)&&id(p.id)&&id(p.payer_id)&&id(p.recipient_id)&&amount(p.amount)&&typeof p.status==='string'));
}
export function readDemo(storage,sample){
 try{const raw=storage.getItem(demoKey);if(raw===null)return {data:sample,blocked:false};const data=JSON.parse(raw);if(validDemo(data))return {data,blocked:false};}catch{}
 return {data:sample,blocked:true};
}
