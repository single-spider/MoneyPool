export function parseMoney(value) {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(String(value))) throw Error("Enter a valid amount with up to two decimals.");
  const [whole, fraction=""] = String(value).split(".");
  const amount = Number(whole)*100+Number(fraction.padEnd(2,"0"));
  if (!amount) throw Error("Amount must be positive.");
  return amount;
}
export function splitAmount(total, members, method, values={}) {
  if (!Number.isSafeInteger(total)||total<=0||!members.length||new Set(members).size!==members.length) throw Error("Invalid expense or participants.");
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
  for(const e of expenses)for(const s of e.splits)add(s.user_id,e.payer_id,s.amount);
  for(const p of payments)if(p.status==="confirmed")add(p.payer_id,p.recipient_id,-p.amount);
  return result;
}
export function upiUri(p) {
  if(!/^[a-zA-Z0-9._+-]{2,100}@[a-zA-Z0-9.-]{2,64}$/.test(p.upi))throw Error("Recipient needs a valid UPI ID.");
  return "upi://pay?"+new URLSearchParams({pa:p.upi,pn:p.recipient_name,am:(p.amount/100).toFixed(2),cu:"INR",tn:"MoneyPool settlement",tr:p.id.replaceAll("-","").slice(0,32)}).toString().replaceAll("+","%20");
}
