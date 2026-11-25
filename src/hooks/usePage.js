import {useState,useEffect} from 'react';
import {pageFromUrl,urlForPage} from '../navigation.mjs';
export function usePage(){
 const [page,setValue]=useState(()=>pageFromUrl(window.location.href));
 useEffect(()=>{const onPop=()=>setValue(pageFromUrl(window.location.href));window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[]);
 function setPage(next){const url=urlForPage(window.location.href,next);if(url.href!==window.location.href)window.history.pushState(null,'',url);setValue(next);}
 return [page,setPage];
}
