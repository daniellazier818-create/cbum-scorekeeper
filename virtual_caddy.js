/* Virtual Caddy — field-guide driven, phone-first hole advice */
function caddyCourses(){return (window.CADDY_COURSES||[]).slice().sort((a,b)=>a.date.localeCompare(b.date))}
function caddyDefaultCourse(){
  const courses=caddyCourses();if(!courses.length)return'';
  const now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  return courses.reduce((best,c)=>{const d=Math.abs(new Date(c.date+'T12:00:00')-new Date(today+'T12:00:00'));return !best||d<best.d?{id:c.id,d}:best},null).id;
}
function caddyEnsureState(){
  state.ui=state.ui||{};
  const courses=caddyCourses(),ids=new Set(courses.map(c=>c.id));
  if(!state.ui.caddyCourse||!ids.has(state.ui.caddyCourse))state.ui.caddyCourse=caddyDefaultCourse();
  if(!Number.isInteger(state.ui.caddyHole)||state.ui.caddyHole<1||state.ui.caddyHole>18)state.ui.caddyHole=1;
  if(state.ui.caddyMap==null)state.ui.caddyMap=false;
}
function caddyCourse(){caddyEnsureState();return caddyCourses().find(c=>c.id===state.ui.caddyCourse)||caddyCourses()[0]}
function caddyHole(){const c=caddyCourse();return c?c.holes.find(h=>h.n===state.ui.caddyHole)||c.holes[0]:null}
function caddyEscape(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function caddyAdvice(label,text,kind){if(!text)return'';return`<section class="caddy-advice ${kind}"><div class="caddy-advice-label">${label}</div><p>${caddyEscape(text)}</p></section>`}
function caddyImage(h,c){
  if(h.image)return`<figure class="caddy-image"><img src="${caddyEscape(h.image)}" alt="${caddyEscape(c.name)} hole ${h.n} plan" loading="eager" referrerpolicy="no-referrer" onerror="this.closest('figure').classList.add('image-missing');this.remove()"><figcaption>Hole ${h.n} plan · source image from the field guide</figcaption><div class="caddy-image-fallback">Hole image not yet available</div></figure>`;
  return`<div class="caddy-image-placeholder"><span>Hole image not yet added</span><small>${caddyEscape(c.id)}-${h.n}</small></div>`;
}
function caddyCourseMap(c){
  if(!c.map)return'';
  return`<div class="caddy-map-wrap"><button type="button" class="btn ghost small caddy-map-toggle" data-caddy-map>${state.ui.caddyMap?'Hide course map':'Show course map'}</button>${state.ui.caddyMap?`<figure class="caddy-course-map"><img src="${caddyEscape(c.map)}" alt="${caddyEscape(c.name)} course map" loading="lazy" referrerpolicy="no-referrer"><figcaption>Course/property map from the field guide</figcaption></figure>`:''}</div>`;
}
function renderVirtualCaddy(){
  caddyEnsureState();const courses=caddyCourses();
  if(!courses.length)return`<div class="card"><div class="eyebrow">Virtual Caddy</div><h2>Field guide unavailable</h2><p class="muted">The hole-by-hole guide did not load.</p></div>`;
  const c=caddyCourse(),h=caddyHole(),prev=h.n===1?18:h.n-1,next=h.n===18?1:h.n+1;
  return`<div class="card caddy-head"><div class="eyebrow">Virtual Caddy</div><div class="caddy-course-row"><div class="caddy-course-select"><label for="caddyCourse">Course</label><select id="caddyCourse" class="field" data-caddy-course>${courses.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${caddyEscape(x.name)}</option>`).join('')}</select></div><div class="caddy-plan"><span>Field guide planning tee</span><b>${caddyEscape(c.planning)}</b></div></div>${caddyCourseMap(c)}<div class="caddy-hole-strip" aria-label="Hole selector">${c.holes.map(x=>`<button type="button" class="caddy-hole-btn ${x.n===h.n?'active':''}" data-caddy-hole="${x.n}" aria-label="Hole ${x.n}">${x.n}</button>`).join('')}</div></div>
  <article class="card caddy-hole-card"><div class="caddy-hole-title"><div><div class="eyebrow">${caddyEscape(c.name)} · Hole ${h.n}</div><h2>${h.name?caddyEscape(h.name):`Hole ${h.n}`}</h2></div><div class="caddy-hole-meta"><b>Par ${h.par}</b><span>${h.yards} yd</span></div></div><div class="caddy-yard-note">Field-guide planning yardage. Confirm today’s tee, wind and pin with your caddie.</div>${caddyImage(h,c)}${caddyAdvice('Overview',h.overview,'overview')}${h.history?caddyAdvice('Name / history',h.history,'history'):''}<div class="caddy-strategy-grid">${caddyAdvice('SAFE',h.safe,'safe')}${caddyAdvice('ATTACK',h.attack,'attack')}</div>${caddyAdvice('GREEN',h.green,'green')}<div class="caddy-hole-nav"><button type="button" class="btn secondary" data-caddy-hole="${prev}">← Hole ${prev}</button><button type="button" class="btn" data-caddy-hole="${next}">Hole ${next} →</button></div></article>
  <div class="card caddy-course-note"><div class="eyebrow">Course strategy</div><p>${caddyEscape(c.how)}</p><div class="tiny muted">Source: Scotland Golf Trip Folio · Detailed Course Guides. Local caddie advice and the day’s conditions take precedence.</div></div>`;
}
function bindVirtualCaddy(){
  const course=document.querySelector('[data-caddy-course]');if(course)course.onchange=()=>{state.ui.caddyCourse=course.value;state.ui.caddyHole=1;state.ui.caddyMap=false;save();render();window.scrollTo({top:0,behavior:'smooth'})};
  document.querySelectorAll('[data-caddy-hole]').forEach(el=>el.onclick=()=>{state.ui.caddyHole=Math.max(1,Math.min(18,+el.dataset.caddyHole||1));save();render();window.scrollTo({top:0,behavior:'smooth'})});
  const map=document.querySelector('[data-caddy-map]');if(map)map.onclick=()=>{state.ui.caddyMap=!state.ui.caddyMap;save();render()};
}
