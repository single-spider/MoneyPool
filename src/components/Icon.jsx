import React from 'react';
const paths={
 Overview:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
 Groups:<><path d="M3 7h18v14H3zM3 7l3-4h12l3 4M8 12h8"/></>,
 Friends:<><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/></>,
 Activity:<><path d="M4 3h16v18H4zM8 8h8M8 12h8M8 16h5"/></>,
 Payments:<><path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/></>,
 Insights:<><path d="M3 3v18h18M8 16v-4m5 4V8m5 8V4"/></>,
 Settings:<><circle cx="12" cy="12" r="3"/><path d="m10 3-1 3-3 1-3 3 2 2-2 2 3 3 3 1 1 3h4l1-3 3-1 3-3-2-2 2-2-3-3-3-1-1-3z"/></>,
 More:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
 Sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></>,
 Moon:<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z"/>,
 Plus:<path d="M12 5v14M5 12h14"/>,
 Close:<path d="m6 6 12 12M18 6 6 18"/>,
 Receipt:<><path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8m-8 4h8m-8 4h4"/></>,
};
export default function Icon({name}){return <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>}
