export const pages=['Overview','Groups','Activity','Payments','Friends','Insights','Settings'];
export function pageFromUrl(url){const value=new URL(url).searchParams.get('view');return pages.find(p=>p.toLowerCase()===value)||'Overview';}
export function urlForPage(url,page){if(!pages.includes(page))throw Error('Unknown page');const next=new URL(url);if(page==='Overview')next.searchParams.delete('view');else next.searchParams.set('view',page.toLowerCase());return next;}
