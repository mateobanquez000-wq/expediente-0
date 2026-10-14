const V='ac-v1',SHELL=['./','index.html','styles.css','app.js','levels.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/logo.png'];
const put=(r,res)=>{if(res.ok||res.type=='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x.startsWith('ac-')).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;const same=new URL(r.url).origin==location.origin;
 e.respondWith(same?fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))):caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res))))});
