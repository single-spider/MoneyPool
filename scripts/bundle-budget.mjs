import {readdir,readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
export const JS_LIMIT=200000;
export function checkBudget(assets,limit=JS_LIMIT){
 const js=assets.filter(a=>a.name.endsWith('.js'));
 if(!js.length)throw Error('No JavaScript assets found');
 const bytes=js.reduce((sum,a)=>sum+gzipSync(a.content).length,0);
 if(bytes>limit)throw Error('Compressed JavaScript budget exceeded: '+bytes+' > '+limit+' bytes');
 return bytes;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const names=await readdir('dist/assets');
 const assets=await Promise.all(names.filter(n=>n.endsWith('.js')).map(async name=>({name,content:await readFile('dist/assets/'+name)})));
 console.log('Compressed JavaScript: '+checkBudget(assets)+' / '+JS_LIMIT+' bytes');
}
