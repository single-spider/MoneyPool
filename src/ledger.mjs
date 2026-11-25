export function parseMoney(value) {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(String(value))) throw Error("Enter a valid amount with up to two decimals.");
  const [whole, fraction=""] = String(value).split(".");
  const amount = Number(whole)*100+Number(fraction.padEnd(2,"0"));
  if (!amount) throw Error("Amount must be positive.");
  return amount;
}
export function splitAmount(total, members, method, values={}) {
  if (!Number.isSafeInteger(total)||total<=0||!members.length||new Set(members).size!==members.length) throw Error("Invalid expense or participants.");
  if(!["equal","exact","percentage","shares"].includes(method))throw Error("Invalid split method.");
  if(method==="exact") {
    const rows=members.map(id=>({user_id:id,amount: String(values[id]??"0")==="0"||/^0\.0{1,2}$/.test(String(values[id]))?0:parseMoney(values[id])}));
    if(rows.reduce((s,r)=>s+r.amount,0)!==total) throw Error("Exact amounts must add up to the expense.");
    return rows;
  }
  const weights=members.map(id=>{
    if(method==="equal")return 1;
    const raw=String(values[id]??"0");
    if(!/^\d{1,5}(\.\d{1,2})?$/.test(raw))throw Error("Invalid split weight.");
    const [a,b=""]=raw.split(".");return Number(a)*100+Number(b.padEnd(2,"0"));
  });
  const sum=weights.reduce((s,w)=>s+w,0);
  if(!sum||(method==="percentage"&&sum!==10000))throw Error("Percentages must total 100; shares must be positive.");
  const rows=members.map((id,i)=>({user_id:id,amount:Number(BigInt(total)*BigInt(weights[i])/BigInt(sum)),remainder:BigInt(total)*BigInt(weights[i])%BigInt(sum),i}));
  const left=total-rows.reduce((s,r)=>s+r.amount,0);
  [...rows].sort((a,b)=>a.remainder===b.remainder?a.i-b.i:a.remainder>b.remainder?-1:1).slice(0,left).forEach(r=>r.amount++);
  return rows.map(({user_id,amount})=>({user_id,amount}));
}
export function balances(expenses,payments,me) {
  const result={};
  const add=(a,b,amount)=>{if(a===me&&b!==me)result[b]=(result[b]||0)+amount;if(b===me&&a!==me)result[a]=(result[a]||0)-amount};
  for(const e of expenses)if(!e.voided_at)for(const s of e.splits)add(s.user_id,e.payer_id,s.amount);
  for(const p of payments)if(p.status==="confirmed")add(p.payer_id,p.recipient_id,-p.amount);
  return result;
}
export function upiUri(p) {
  if(!/^[a-zA-Z0-9._+-]{2,100}@[a-zA-Z0-9.-]{2,64}$/.test(p.upi))throw Error("Recipient needs a valid UPI ID.");
  return "upi://pay?"+new URLSearchParams({pa:p.upi,pn:p.recipient_name,am:(p.amount/100).toFixed(2),cu:"INR",tn:"MoneyPool settlement",tr:p.id.replaceAll("-","").slice(0,32)}).toString().replaceAll("+","%20");
}

export function demoQrPayload(p) {return "MoneyPool DEMO - NO PAYMENT\n"+JSON.stringify({reference:p.id,recipient:p.recipient_name,amount:(p.amount/100).toFixed(2),currency:"INR"});}
export function reservedAmount(payments,payer,recipient){return payments.filter(p=>p.payer_id===payer&&p.recipient_id===recipient&&["created","reported"].includes(p.status)).reduce((s,p)=>s+p.amount,0)}
export function categoryTotals(expenses,me){const totals={};for(const e of expenses){if(e.voided_at)continue;const c=e.category||"Other";totals[c]=(totals[c]||0)+(e.splits.find(s=>s.user_id===me)?.amount||0)}return Object.entries(totals).sort((a,b)=>b[1]-a[1]);}

export function workspaceTotals(groups,me) {
 const result={owe:0,owed:0,pending:0,groups:0};
 for(const g of groups){if(!g.members.some(m=>m.id===me))continue;result.groups++;for(const v of Object.values(balances(g.expenses,g.payments,me))){result.owe+=Math.max(0,v);result.owed+=Math.max(0,-v)}result.pending+=g.payments.filter(p=>p.recipient_id===me&&p.status==="reported").length;}
 return result;
}
export function paymentInbox(groups,me){
 return groups.filter(g=>g.members.some(m=>m.id===me)).flatMap(g=>g.payments.filter(p=>p.recipient_id===me&&p.status==="reported").map(p=>({id:p.id,groupId:g.id,groupName:g.name,payerName:g.members.find(m=>m.id===p.payer_id)?.name||"Member",amount:p.amount,created_at:p.created_at}))).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
}
export function csvCell(value){let s=String(value??"");if(/^[\s]*[=+\-@]|^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function expenseCsv(group,me){const rows=[["Description","Category","Paid by","Date","Total (INR)","Your share (INR)","Status"]];for(const e of group.expenses){rows.push([e.title,e.category||"Other",group.members.find(m=>m.id===e.payer_id)?.name||"Member",e.created_at,(e.amount/100).toFixed(2),((e.splits.find(s=>s.user_id===me)?.amount||0)/100).toFixed(2),e.voided_at?"Reversed":"Active"])}return rows.map(r=>r.map(csvCell).join(",")).join("\r\n")+"\r\n";}
