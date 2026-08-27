const CACHE='cbum-cup-v3-4-peach-branding';
const ASSETS=['./','./index.html','./styles.css','./heritage.css','./ux.css','./v3patch.css','./live_detail.css','./reset_match.css','./v33.css','./v34.css','./data.js','./core1.js','./core2.js','./core3.js','./render1.js','./render2.js','./render3.js','./standings_layout.js','./ux.js','./rounds_summary.js','./v3patch.js','./live_detail.js','./reset_match.js','./live.js','./bind.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url),isNav=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/cbum-scorekeeper/');
  if(isNav){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return resp}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match('./index.html'))));
});