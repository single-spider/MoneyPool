export function basePath(value=process.env.MP_BASE_PATH||'/'){
 if(!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(value)||value.split('/').some(p=>p==='.'||p==='..'))throw Error('MP_BASE_PATH must be a slash-terminated absolute path');
 return value;
}
