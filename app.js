'use strict';
const $=(s,e=document)=>e.querySelector(s), KEY='ac_v1', RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const H=(a,b,c)=>[a,b,c], COST=[2,3,5], DR={};
// Niveles y desafíos: ver levels.js
const M=[
{n:'Sustitución numérica',c:'Sustitución',d:'Baja',lv:'1–10',def:'Cada letra se reemplaza por un número.',ex:'1-12-1-19 (A=1) → ALAS',err:'Contar mal desde A.',pr:'3-1-19-1 (A=1)',a:'CASA'},
{n:'Cifrado César',c:'Sustitución',d:'Baja',lv:'2–40',def:'Cada letra se desplaza un número fijo.',ex:'OODYH (−3) → LLAVE',err:'Desplazar en sentido contrario.',pr:'KDOFRQ (−3)',a:'HALCON'},
{n:'Anagramas',c:'Lingüísticos',d:'Media',lv:'1–50',def:'Reordenar letras para formar otra palabra.',ex:'JUALA → JAULA',err:'Quedarse con la primera idea.',pr:'CHIARVO',a:'ARCHIVO'},
{n:'Acrósticos',c:'Lingüísticos',d:'Media',lv:'1–30',def:'Las iniciales de cada línea forman un mensaje.',ex:'Oso / Luz / Ala → OLA',err:'Leer también las letras intermedias.',pr:'Ojo / Luz / Ave',a:'OLA'},
{n:'Atbash y transposición',c:'Transposición',d:'Alta',lv:'21–50',def:'Invertir el alfabeto o el orden del texto.',ex:'ZNLI → AMOR',err:'Mezclar ambos métodos.',pr:'ZNLI',a:'AMOR'},
{n:'Vigenère',c:'Sustitución',d:'Alta',lv:'31–50',def:'César con una clave que cambia el desplazamiento.',ex:'Clave BC: ALAS → BNBU',err:'Olvidar repetir la clave.',pr:'Clave BC: BNBU',a:'ALAS'}];
const def=()=>({v:1,pts:6,done:{},solved:{},reward:{},hints:{},cur:{},log:[{t:Date.now(),m:'Bonus inicial',d:6}],snd:false});
let S;try{S=JSON.parse(localStorage.getItem(KEY));if(!S||S.v!==1)S=def()}catch(e){S=def()}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const add=(d,m)=>{S.pts+=d;S.log.unshift({t:Date.now(),m,d});save()};
const open_=n=>n===1||!!S.done[n-1];
const state=n=>S.done[n]?'completado':S.cur[n]!==undefined?'curso':open_(n)?'disponible':'bloqueado';
const LBL={completado:'COMPLETADO',curso:'EN CURSO',disponible:'DISPONIBLE',bloqueado:'BLOQUEADO'};
let ac;const beep=(f=520,d=.12)=>{if(!S.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}};
const EYE=`<svg class="eye" viewBox="0 0 220 340" role="img" aria-label="Ojo con una mancha naranja que cae"><path class="drip" filter="url(#paint)" fill="#E94B1B" d="M80 70H140V250Q134 264 128 250V200Q122 232 114 200V320Q106 336 98 320V240Q90 262 80 240Z"/><path fill="#D8D1C2" d="M10 60Q110 -20 210 60Q110 125 10 60Z"/><circle cx="110" cy="58" r="34" fill="#171715"/><circle cx="99" cy="47" r="7" fill="#D8D1C2"/><path d="M10 60Q110 -20 210 60" fill="none" stroke="#171715" stroke-width="7"/></svg>`;
const fmt=t=>new Date(t).toLocaleString('es');
const cid=n=>n+'-'+(S.cur[n]||0);
function title(){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.r===route().r));$('#pts').textContent=S.pts+' PTS';$('#snd').textContent='Sonido: '+(S.snd?'sí':'no');$('#snd').setAttribute('aria-pressed',S.snd)}
const route=()=>{const p=(location.hash||'#/').slice(2).split('/');return{r:p[0]||'home',n:+p[1]||0}};
function home(){
 const done=Object.keys(S.done).length;
 return `<section class="cover"><div class="hero">${EYE}<span class="t m">Expediente confidencial · Acceso 1</span>
 <h1 aria-label="Archivo Cero">${[...'ARCHIVO'].map((c,i)=>`<span style="animation-delay:${.15*i}s">${c}</span>`).join('')}<br><i>${[...'CERO'].map((c,i)=>`<span style="animation-delay:${1+.15*i}s">${c}</span>`).join('')}</i></h1>
 <p style="max-width:440px">Un archivo sin remitente. Fotografías deterioradas, una jaula abierta y un mensaje que no debería existir. Solo el primer expediente está a tu alcance.</p>
 <div class="row"><button id="go">ABRIR EL ARCHIVO</button><button class="ghost" onclick="location.hash='#/manual'">CÓMO FUNCIONA</button></div>
 <span class="m t">Progreso ${done}/${L.length} · ${S.pts} pts</span></div>
 <div id="levels" role="list">${L.map((l,i)=>{const n=i+1,s=state(n);return `<button class="lv" role="listitem" data-n="${n}" data-s="${s}" aria-disabled="${s=='bloqueado'}"><span class="n">${String(n).padStart(2,'0')}</span><span><b class="s">${l.t}</b><br><span class="t">${l.c} · ${l.d}</span></span><span class="st">+${l.p} · ${LBL[s]}</span></button>`}).join('')}</div></section>
 ${done==L.length?`<div class="k msg ok" style="margin-top:30px"><h2>Desenlace</h2><p>Inés Valdivia escondió el final en el primer expediente. Lía no huyó: fue la primera lectora. El archivo se reescribe con cada lector, y tú acabas de añadir tu página. El archivo cero eres tú: quien observa, quien lee, quien abre la jaula.</p></div>`:''}`}
function level(n){
 if(!n||n>L.length||!open_(n)){location.hash='#/';return''}
 const l=L[n-1];if(S.cur[n]===undefined){S.cur[n]=Math.floor(Math.random()*l.ch.length);save()}const i=S.cur[n],c=l.ch[i],id=n+'-'+i;
 const hs=S.hints[id]||[];
 return `<div class="lvl"><section class="k" style="margin-top:20px"><a href="#/" class="t">← Expedientes</a><h2 style="font-size:clamp(28px,5.5vw,40px);margin:.2em 0">${String(n).padStart(2,'0')} · ${l.t}</h2>
 <p class="t m">${l.c} · ${l.d} · Recompensa ${l.p} · Desafío ${id}${S.done[n]?' · Práctica (sin recompensa principal)':''}</p>
 <div class="puz" id="q">${c.q}</div>
 <label class="t" for="ans">Tu respuesta</label><input id="ans" autocomplete="off" value="${(DR[id]||'').replace(/"/g,'&quot;')}">
 <div class="row"><button id="chk">COMPROBAR</button><button class="ghost" id="insb">INSPECCIONAR</button><button class="ghost" id="swap" ${l.ch.length<2?'disabled':''}>CAMBIAR DESAFÍO</button><a class="m" href="#/pistas" style="align-self:center">Pistas →</a></div>
 <div id="fb" aria-live="polite"></div></section><aside class="k" style="margin-top:20px"><span class="t">Pistas obtenidas</span>${hs.length?hs.map((h,k)=>`<div class="msg"><span class="t m">Pista ${k+1}</span><br>${(c.h||l.h)[k]}</div>`).join(''):'<p>Ninguna todavía. Consúltalas en la Cámara de pistas.</p>'}</aside></div>`}
function manual(q=''){
 q=q.toLowerCase();
 const list=M.filter(m=>(m.n+m.c+m.def).toLowerCase().includes(q));
 return `<h2 style="font-size:clamp(30px,6vw,44px)">Manual del descifrador</h2><label class="t" for="srch">Buscar método</label><input id="srch" value="${q}" placeholder="césar, anagrama…"><div id="ml" class="two" style="margin-top:18px">${mlist(list)}</div>`}
const mlist=list=>list.length?list.map((m,i)=>`<article class="k"><span class="t m">${m.c} · ${m.d} · Niveles ${m.lv}</span><h3 style="margin:.2em 0">${m.n}</h3><p>${m.def}</p><p class="m">Ejemplo: ${m.ex}</p><p class="t">Error frecuente: ${m.err}</p><div class="m">Práctica: ${m.pr}</div><input aria-label="Respuesta de ${m.n}" data-a="${m.a}" style="margin-top:8px"><div class="msg" hidden></div></article>`).join(''):'<p>Sin resultados.</p>';
function pistas(n){
 const op=L.map((_,i)=>i+1).filter(open_),sel=op.includes(n)?n:op[op.length-1],i=S.cur[sel]||0,id=sel+'-'+i,hs=S.hints[id]||[];
 return `<h2 style="font-size:clamp(30px,6vw,44px)">Cámara de pistas</h2><div class="two"><div><label class="t" for="lsel">Desafío</label><select id="lsel" style="width:100%;min-height:44px;background:var(--s);color:var(--m)">${op.map(k=>`<option value="${k}" ${k==sel?'selected':''}>Nivel ${k} · ${L[k-1].t}</option>`).join('')}</select>
 <p class="t m">Desafío ${id}</p>${[0,1,2].map(k=>hs[k]?`<div class="k msg"><span class="m t">PISTA ${k+1} · COMPRADA</span><p>${(L[sel-1].ch[i].h||L[sel-1].h)[k]}</p></div>`:`<div class="k row" style="justify-content:space-between;align-items:center"><span class="m">PISTA ${k+1}</span><button data-buy="${k}" data-id="${id}" ${(k>hs.length||S.pts<COST[k])?'disabled':''}>DESBLOQUEAR · ${COST[k]} PTS</button></div>`).join('')}</div>
 <div><div class="k"><span class="t">Saldo</span><div class="m" style="font-size:clamp(40px,8vw,56px);color:var(--or)">${S.pts}</div></div>${hist(8)}</div></div>`}
const hist=n=>`<div class="k m" style="margin-top:12px;font-size:13px"><span class="t">Historial</span>${S.log.slice(0,n).map(e=>`<div>${e.d>0?'+':''}${e.d} ${e.m}</div>`).join('')}</div>`;
function archivo(){
 const dn=Object.keys(S.done).map(Number).sort((a,b)=>a-b),hn=Object.values(S.hints).reduce((a,h)=>a+h.length,0);
 return `<h2 style="font-size:clamp(30px,6vw,44px)">Archivo de evidencias</h2><div class="three"><div class="k"><span class="t">Puntos</span><div class="m" style="font-size:34px;color:var(--or)">${S.pts}</div></div><div class="k"><span class="t">Niveles</span><div class="m" style="font-size:34px">${dn.length}/${L.length}</div></div><div class="k"><span class="t">Pistas usadas</span><div class="m" style="font-size:34px">${hn}</div></div></div>
 <div class="two" style="margin-top:20px"><div><span class="t">Fragmentos descubiertos</span>${L.map((l,i)=>S.done[i+1]?`<div class="k" style="margin-top:8px"><span class="m" style="color:var(--or)">FRAG. ${String(i+1).padStart(2,'0')}</span><p class="frag">${l.f}</p></div>`:`<div class="k" style="margin-top:8px;border-style:dashed"><span class="m t">FRAG. ${String(i+1).padStart(2,'0')}</span><div class="bar"></div></div>`).join('')}</div>
 <div><div class="k"><span class="t">Insignias</span><p class="m">${dn.length?'◉ Primera señal':'○ Primera señal'} · ${dn.length>=25?'◉':'○'} Mitad del camino · ${dn.length==L.length?'◉':'○'} Archivo cero · ${hn==0&&dn.length?'◉':'○'} Sin pistas</p></div>${hist(12)}<div class="row"><button class="danger" id="reset">REINICIAR PROGRESO…</button></div></div></div>`}
function render(){
 const {r,n}=route(),app=$('#app');
 app.innerHTML=r=='nivel'?level(n):r=='manual'?manual():r=='pistas'?pistas(n):r=='archivo'?archivo():home();
 app.style.animation='none';app.offsetWidth;app.style.animation='';title();
}
// Eventos
document.addEventListener('click',e=>{
 const t=e.target.closest('button');if(!t)return;
 if(t.id=='go')location.hash='#/nivel/'+((L.findIndex((_,i)=>open_(i+1)&&!S.done[i+1])+1||L.length));
 else if(t.classList.contains('lv')){const n=+t.dataset.n;if(open_(n)){beep(440);location.hash='#/nivel/'+n}else{beep(180);t.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'none'}],{duration:250})}}
 else if(t.id=='snd'){S.snd=!S.snd;save();title();beep(600)}
 else if(t.id=='insb'){$('#ib').textContent=$('#q').textContent;$('#ib').style.fontSize='clamp(22px,5vw,34px)';$('#insp').showModal()}
 else if(t.dataset.z){const b=$('#ib');b.style.fontSize=parseFloat(getComputedStyle(b).fontSize)*(t.dataset.z>0?1.25:.8)+'px'}
 else if(t.id=='iclose')$('#insp').close()
 else if(t.id=='chk')check();
 else if(t.id=='swap'){const n=route().n;if(confirm('Cambiar de desafío puede hacerte perder el intento actual. ¿Continuar?')){S.cur[n]=((S.cur[n]||0)+1)%L[n-1].ch.length;save();render()}}
 else if(t.dataset.buy!==undefined){const k=+t.dataset.buy,id=t.dataset.id,hs=S.hints[id]=S.hints[id]||[];
  if(k==hs.length&&S.pts>=COST[k]&&confirm('Gastar '+COST[k]+' puntos en esta pista?')){hs.push(1);add(-COST[k],'Pista '+(k+1)+' ('+id+')');beep(300);render()}}
 else if(t.id=='reset'){if(confirm('Se borrará todo tu progreso. ¿Seguro?')){S=def();save();location.hash='#/';render()}}
 else if(t.id=='next'){const n=route().n;location.hash=n<L.length?'#/nivel/'+(n+1):'#/'}
 else if(t.id=='rev'){render()}
});
document.addEventListener('input',e=>{
 if(e.target.id=='ans'){const n=route().n;DR[n+'-'+(S.cur[n]||0)]=e.target.value}
 if(e.target.id=='srch'){const q=e.target.value.toLowerCase();$('#ml').innerHTML=mlist(M.filter(m=>(m.n+m.c+m.def).toLowerCase().includes(q)))}
 else if(e.target.dataset.a){const ok=norm(e.target.value)==e.target.dataset.a,b=e.target.nextElementSibling;b.hidden=!norm(e.target.value);b.className='msg '+(ok?'ok':'err');b.textContent=ok?'Correcto.':'Aún no.'}
});
document.addEventListener('change',e=>{if(e.target.id=='lsel'){location.hash='#/pistas/'+e.target.value}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='ans')check()});
function check(){
 const n=route().n,l=L[n-1],i=S.cur[n]||0,c=l.ch[i],v=norm($('#ans').value),fb=$('#fb');
 if(!v){fb.innerHTML='<div class="msg err">Escribe una respuesta.</div>';return}
 if(c.a.map(norm).includes(v)){
  const id=n+'-'+i;let m='';
  if(!S.done[n]){S.done[n]=1;S.solved[id]=1;if(!S.reward[n]){S.reward[n]=1;add(l.p,'Nivel '+n+' completado')}m='+'+l.p+' puntos. '+(n<L.length?'Se desbloquea el expediente '+(n+1)+'.':'Has completado la campaña.')}
  else{const fresh=!S.solved[id];S.solved[id]=1;S.pr=S.pr||{};if(fresh&&(S.pr[n]||0)<3){S.pr[n]=(S.pr[n]||0)+1;add(2,'Práctica '+id);m='+2 puntos de práctica.'}else m='Sin puntos adicionales (ya resuelto o límite de práctica del nivel).'}
  save();title();beep(660,.25);
  fb.innerHTML=`<div class="msg ok"><b>CORRECTO.</b> ${m}<p>${c.x}</p><p class="frag">${l.f}</p><div class="row"><button id="next">CONTINUAR</button><button class="ghost" id="rev">REVISAR</button></div></div>`;
 }else{
  S.log.unshift({t:Date.now(),m:'Intento fallido '+n+'-'+i,d:0});S.cur[n]=(i+1)%l.ch.length;save();beep(160,.2);
  fb.innerHTML='<div class="msg err">Respuesta incorrecta. No se otorgan puntos. Se ha cambiado el desafío.</div>';
  setTimeout(()=>{render();$('#fb').innerHTML='<div class="msg err">Respuesta incorrecta. Nuevo desafío de la misma categoría.</div>'},900);
 }
}
// Parallax sutil del ojo (escritorio, respeta movimiento reducido)
if(!RM&&matchMedia('(hover:hover) and (pointer:fine)').matches)document.addEventListener('mousemove',e=>{const s=$('.eye');if(s){s.style.setProperty('--px',(e.clientX/innerWidth-.5)*16+'px');s.style.setProperty('--py',(e.clientY/innerHeight-.5)*12+'px')}});
addEventListener('hashchange',render);render();

// App instalable (PWA)
let dip;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#inst').hidden=false});
$('#inst').onclick=async()=>{if(dip){dip.prompt();await dip.userChoice;dip=null;$('#inst').hidden=true}};
addEventListener('appinstalled',()=>{$('#inst').hidden=true});
if('serviceWorker' in navigator&&location.protocol!='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
