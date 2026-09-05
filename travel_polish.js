/* Travel dossier consumer polish: contacts, status cleanup, day-pack guidance */
TRAVEL_VENDORS.edenclubtransport={
  name:'The Eden Club Concierge',
  role:'Pittormie / Fife car service contact',
  phone:'+44 (0) 1334 870 088',
  tel:'+441334870088',
  email:'concierge@theedenclub.com',
  note:'Isla & Caitlin'
};

/* Every pre-transfer-day car movement is handled through Eden Club concierge. */
TRAVEL_DAYS.filter(d=>d.key<'2026-09-08').forEach(d=>d.events.forEach(e=>{
  const carMove=e.cat==='Ground Transport'||(/^(Drive|Ride)\b/i.test(e.title||''));
  if(carMove)e.vendor='edenclubtransport';
}));

const TRAVEL_DAY_PACKS={
  '2026-09-05':{
    title:'Kingsbarns → dinner',
    text:'Plan to go to dinner in golf clothes. No change needed. Optional comfort items for the car: a clean shirt or knit, fresh socks and casual shoes.'
  },
  '2026-09-07':{
    title:'Jinner night · North Berwick → Ship Inn',
    text:'You will not be back at Pittormie before dinner. Pack the full head-to-toe denim Jinner outfit, clean underwear/socks, casual shoes and a small deodorant/grooming kit. Change at North Berwick after golf.'
  },
  '2026-09-08':{
    title:'Transfer day · Dunkeld + The Hermitage',
    text:'Wear comfortable walking shoes and travel layers from the start. Keep spare dry socks and a clean top handy. You reach Dornoch Station before dinner, so no dinner change needs to stay in the day pack.'
  },
  '2026-09-09':{
    title:'Kilt night · Castle Stuart → Hootananny',
    text:'Cabot showers are available and you go directly to Inverness afterward. Pack each person’s complete kilt/tartan-night outfit, including the planned shirt, socks/hose, shoes and accessories, plus clean underwear and a small grooming kit. Keep it together in a garment/day bag in the vehicle.'
  },
  '2026-09-10':{
    title:'Brora → Royal Marine dinner',
    text:'Plan to go to dinner in golf clothes. No change needed. Optional: pack a dry shirt/base layer, fresh socks and comfortable shoes if you want to freshen up after the round.'
  },
  '2026-09-11':{
    title:'Royal Dornoch → clubhouse dinner → Aberdeen',
    text:'Plan to go to dinner in golf clothes. No change needed. Optional: pack a dry shirt/base layer, fresh socks and comfortable shoes for the long evening drive to Aberdeen.'
  },
  '2026-09-12':{
    title:'Trump → Cock & Bull → Edinburgh',
    text:'Plan to go to dinner in golf clothes. No change needed. Optional: pack a clean shirt, fresh socks and comfortable shoes for the 2h45 transfer. Your full luggage is traveling with you.'
  }
};

function travelDayPackHtml(day){
  const p=TRAVEL_DAY_PACKS[day.key];
  if(!p)return'';
  return`<div class="card" style="margin-top:12px"><div class="eyebrow">Day pack</div><h3 style="margin-bottom:7px">${p.title}</h3><p class="muted" style="margin:0">${p.text}</p></div>`;
}

function travelMealStatusHtml(e){
  if(e.cat!=='Meals')return'';
  const labels={
    'Booked':'Reservation',
    'Flexible':'Flexible / informal',
    'Pending':'Reservation pending',
    'Not Yet Booked':'No reservation'
  };
  const label=labels[e.status];
  if(!label)return'';
  const cls=typeof travelStatusClass==='function'?travelStatusClass(e.status):'';
  return`<span class="travel-status ${cls}">${label}</span>`;
}

/* Keep vendor markup aligned with travel.css. This deliberately replaces the older
   travel-action markup so Safari does not fall back to raw blue links. */
travelVendorHtml=function(id){
  if(!id||!TRAVEL_VENDORS[id])return'';
  const v=TRAVEL_VENDORS[id];
  const actions=[];
  if(v.tel)actions.push(`<a class="travel-contact" href="tel:${v.tel}">Call</a>`);
  if(v.email)actions.push(`<a class="travel-contact" href="mailto:${v.email}">Email</a>`);
  if(v.web)actions.push(`<a class="travel-contact" href="${v.web}" target="_blank" rel="noopener">Web</a>`);
  const details=[v.phone,v.email].filter(Boolean).map(x=>`<span>${x}</span>`).join('');
  return`<div class="travel-vendor"><div class="travel-vendor-head"><div class="travel-vendor-copy"><b>${v.name}</b>${v.role?`<span>${v.role}</span>`:''}</div>${actions.length?`<div class="travel-contact-row">${actions.join('')}</div>`:''}</div>${details?`<div class="travel-vendor-detail">${details}</div>`:''}${v.note?`<div class="travel-vendor-note">${v.note}</div>`:''}</div>`;
};

/* Consumer view: hide planning-status badges except for useful meal reservation context. */
renderTravelEvent=function(e){
  const maps=typeof travelGroundDirectionsHtml==='function'?travelGroundDirectionsHtml(e):'';
  const flight=typeof travelFlightStatusHtml==='function'?travelFlightStatusHtml(e):'';
  return`<div class="travel-event"><div class="travel-time">${e.time}</div><div class="travel-event-body"><div class="travel-event-top"><span class="travel-cat">${travelCatIcon(e.cat)} ${e.cat}</span>${travelMealStatusHtml(e)}</div><h3>${e.title}</h3>${e.route?`<div class="travel-route">↗ ${e.route}</div>`:''}${e.notes?`<div class="travel-notes">${e.notes}</div>`:''}${travelVendorHtml(e.vendor)}${maps}${flight}</div></div>`;
};

renderTravel=function(){
  const key=travelSelectedDay(),day=TRAVEL_DAYS.find(d=>d.key===key);
  return`<div class="card travel-hero"><div class="eyebrow">Travel dossier</div><h2>${day.long}</h2><div class="travel-day-picker">${TRAVEL_DAYS.map(d=>`<button class="travel-day ${d.key===key?'active':''}" data-travel-day="${d.key}"><span>${d.short}</span><b>${d.day}</b><small>${d.month}</small></button>`).join('')}</div><div class="tiny travel-source">Itinerary: Time Table_v2 · contacts shown are the trip’s working service contacts.</div></div>${travelDayPackHtml(day)}<div class="travel-timeline">${day.events.map(renderTravelEvent).join('')}</div>`;
};
