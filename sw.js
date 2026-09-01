const CACHE='cbum-cup-flight-status-links';
const ASSETS=['./','./index.html','./styles.css','./heritage.css','./ux.css','./v3patch.css?v=3.6.1','./live_detail.css','./reset_match.css','./v33.css','./v34.css?v=3.7.2-status2','./travel.css?v=3.7','./data.js','./core1.js','./core2.js','./core3.js','./render1.js','./render2.js','./render3.js?v=3.7.2','./standings_layout.js','./ux.js','./rounds_summary.js','./v3patch.js?v=3.6.1','./live_detail.js','./reset_match.js','./travel.js?v=3.7','./flight_status.js?v=1','./live.js','./sync_status_fix.js?v=2','./travel_fix.js?v=3.7.1','./bind.js?v=3.7.2','./manifest.webmanifest?v=3.7.2-companion','./icon.svg?v=3.5'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isNav=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/cbum-scorekeeper/');
  const isAppCode=u.origin===self.location.origin&&/\.(?:js|css|webmanifest|svg)$/.test(u.pathname);
  if(isNav||isAppCode){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(resp=>{
      const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match('./index.html'))));
});