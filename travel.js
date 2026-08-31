/* v3.7 travel dossier — Time Table_v2 snapshot 2026-08-31 */
const TRAVEL_VENDORS={
  united:{name:'United Airlines',role:'Airline',phone:'+1 800 864 8331',tel:'+18008648331',web:'https://www.united.com/'},
  pittormie:{name:'Pittormie Castle',role:'Hotel / concierge',phone:'+44 1334 870088',tel:'+441334870088',email:'concierge@theedenclub.com',web:'https://www.pittormiecastle.com/',address:'Dairsie, St Andrews, Fife KY15 4SW'},
  jigger:{name:'Jigger Inn · Old Course Hotel',role:'Restaurant / pub',phone:'+44 1334 474371',tel:'+441334474371',web:'https://www.oldcoursehotel.co.uk/'},
  dunvegan:{name:'The Dunvegan',role:'Pub / hotel',phone:'+44 1334 473105',tel:'+441334473105',email:'info@dunveganhotel.com',web:'https://www.dunvegan-hotel.com/'},
  kingsbarns:{name:'Kingsbarns Golf Links',role:'Golf / clubhouse',phone:'+44 1334 460860',tel:'+441334460860',email:'info@kingsbarns.com',web:'https://www.kingsbarns.com/'},
  innkingsbarns:{name:'The Inn at Kingsbarns',role:'Restaurant / inn',phone:'+44 1334 880778',tel:'+441334880778',email:'info@theinnatkingsbarns.co.uk',web:'https://www.theinnatkingsbarns.co.uk/'},
  elie:{name:'Elie Golf House Club',role:'Golf / clubhouse',phone:'+44 1333 330301',tel:'+441333330301',web:'https://www.golfhouseclub.co.uk/'},
  grange:{name:'The Grange Inn',role:'Restaurant',phone:'+44 1334 472675',tel:'+441334472675',email:'grangestandrews@gmail.com',web:'https://thegrangeinn.com/'},
  rocketeer:{name:'The Rocketeer',role:'Restaurant',phone:'+44 1620 895577',tel:'+441620895577',web:'https://rocketeerrestaurant.co.uk/'},
  northberwick:{name:'North Berwick Golf Club',role:'Golf / clubhouse',phone:'+44 1620 895040',tel:'+441620895040',email:'bookings@northberwickgolfclub.com',web:'https://www.northberwickgolfclub.com/',note:'Visitor starter / late-arrival line: +44 1620 897143.'},
  shipinn:{name:'The Ship Inn · North Berwick',role:'Restaurant / pub',phone:'+44 1620 890699',tel:'+441620890699',address:'7–9 Quality St, North Berwick EH39 4HJ'},
  venture:{name:'Venture Highland',role:'Executive car service',phone:'+44 1463 262820',tel:'+441463262820',email:'hello@venturehighland.com',web:'https://www.venturehighland.com/',note:'Booking paid. Driver details are expected shortly before service.'},
  taybank:{name:'The Taybank',role:'Restaurant',phone:'+44 1350 677123',tel:'+441350677123',email:'info@thetaybank.co.uk',web:'https://www.thetaybank.co.uk/',address:'Tay Terrace, Dunkeld PH8 0AQ'},
  dornochstation:{name:'Dornoch Station',role:'Hotel / concierge',phone:'+44 1862 730333',tel:'+441862730333',email:'info@dornochstation.co.uk',web:'https://marineandlawn.com/dornochstation/',address:'Grange Rd, Dornoch IV25 3LF'},
  dornochcastle:{name:'Dornoch Castle Hotel',role:'Restaurant / hotel',phone:'+44 1862 810216',tel:'+441862810216',email:'enquiries@dornochcastlehotel.com',web:'https://dornochcastlehotel.com/'},
  luxuryhighland:{name:'Luxury Highland Chauffeur',role:'Mercedes V-Class car service',email:'luxuryhighlandchauffeur@gmail.com',web:'https://www.luxuryhighlandchauffeur.com/',note:'Booked for Sept. 9–10. Vendor advises driver details are supplied about 24 hours before service.'},
  cabot:{name:'Cabot Highlands · Castle Stuart',role:'Golf / clubhouse',phone:'+44 1463 796111',tel:'+441463796111',email:'ch.bookings@cabot.com',web:'https://cabot.com/highlands/'},
  hootananny:{name:'Hootananny Inverness',role:'Restaurant / live music',phone:'+44 1463 233651',tel:'+441463233651',email:'inverness@hootananny.co.uk',web:'https://hootanannyinverness.co.uk/'},
  glenmorangie:{name:'Glenmorangie Distillery',role:'Distillery / visitor centre',phone:'+44 1862 892477',tel:'+441862892477',email:'tshop@glenmorangie.co.uk',web:'https://www.glenmorangie.com/'},
  brora:{name:'Brora Golf Club',role:'Golf / clubhouse',phone:'+44 1408 621417',tel:'+441408621417',email:'reservations@broragolfclub.co.uk',web:'https://www.broragolfclub.co.uk/'},
  royalmarine:{name:'Royal Marine Hotel · Brora',role:'Restaurant / hotel',phone:'+44 1408 621252',tel:'+441408621252',email:'info@royalmarinebrora.com',web:'https://www.highlandcoasthotels.com/royal-marine-brora/'},
  dunrobin:{name:'Dunrobin Castle',role:'Attraction',phone:'+44 1408 633177',tel:'+441408633177',email:'info@dunrobincastle.co.uk',web:'https://www.dunrobincastle.co.uk/'},
  royaldornoch:{name:'Royal Dornoch Golf Club',role:'Golf / clubhouse',phone:'+44 1862 810219',tel:'+441862810219',email:'bookings@royaldornoch.com',web:'https://royaldornoch.com/'},
  trump:{name:'Trump International Scotland',role:'Hotel / golf / clubhouse',phone:'+44 1358 743300',tel:'+441358743300',email:'bookings@trumpgolfscotland.com',web:'https://www.trumphotels.com/scotland'},
  cockbull:{name:'The Cock & Bull · Balmedie',role:'Restaurant / pub',phone:'+44 1358 743249',tel:'+441358743249'},
  doubletree:{name:'DoubleTree by Hilton Edinburgh Airport',role:'Hotel / airport shuttle',phone:'+44 131 519 4400',tel:'+441315194400',email:'reception@doubletreeedinburghairport.com',web:'https://www.hilton.com/en/hotels/ediapdi-doubletree-edinburgh-airport/'},
  localtransport:{name:'Local ground transport',role:'Car / transfer',note:'Provider is not named in Time Table_v2. Confirm the day-of contact before departure.'}
};

const TRAVEL_DAYS=[
 {key:'2026-09-04',short:'Fri',day:'4',month:'Sep',long:'Friday, September 4',events:[
  {time:'8:25 AM',title:'All arrive on UA118',status:'Booked',cat:'Travel',vendor:'united'},
  {time:'9:45 AM',title:'Drive to Pittormie Castle',status:'Booked',cat:'Ground Transport',vendor:'localtransport'},
  {time:'10:30 AM',title:'Check in to Pittormie Castle',status:'Booked',cat:'Lodging',route:'45m drive',notes:'Tony to contact EE for cancellation of 1 night.',vendor:'pittormie'},
  {time:'5:30 PM',title:'Drive to St. Andrews',status:'Booked',cat:'Ground Transport',route:'10m drive from hotel',vendor:'localtransport'},
  {time:'6:00 PM',title:'Dinner at Jigger Inn · Old Course Hotel',status:'Booked',cat:'Meals',notes:'Block away from the Old Course; pub food.',vendor:'jigger'},
  {time:'8:00 PM',title:'Drinks at The Dunvegan',status:'Flexible',cat:'Sightseeing',vendor:'dunvegan'}
 ]},
 {key:'2026-09-05',short:'Sat',day:'5',month:'Sep',long:'Saturday, September 5',events:[
  {time:'Morning',title:'Breakfast at hotel / sightseeing in St. Andrews',status:'Flexible',cat:'Sightseeing',vendor:'pittormie'},
  {time:'11:30 AM',title:'Drive to Kingsbarns',status:'Booked',cat:'Ground Transport',vendor:'localtransport'},
  {time:'12:00 PM',title:'Lunch at Kingsbarns',status:'Flexible',cat:'Meals',route:'30m drive',vendor:'kingsbarns'},
  {time:'2:10 PM',title:'Tee time at Kingsbarns',status:'Booked',cat:'Golf',notes:'Planned duration 5h. Caddies added.',vendor:'kingsbarns'},
  {time:'7:30 PM',title:'Dinner at The Inn at Kingsbarns',status:'Booked',cat:'Meals',route:'3m drive',notes:'Cozy pub; slightly more upscale.',vendor:'innkingsbarns'},
  {time:'9:00 PM',title:'Drive back to Pittormie',status:'Booked',cat:'Ground Transport',vendor:'localtransport'}
 ]},
 {key:'2026-09-06',short:'Sun',day:'6',month:'Sep',long:'Sunday, September 6',events:[
  {time:'Morning',title:'Breakfast at hotel / chill morning',status:'Flexible',cat:'Meals',vendor:'pittormie'},
  {time:'11:00 AM',title:'Drive to Elie',status:'Booked',cat:'Ground Transport',route:'30m drive',vendor:'localtransport'},
  {time:'12:10 PM',title:'Tee time at Elie',status:'Booked',cat:'Golf',notes:'Planned duration under 4h.',vendor:'elie'},
  {time:'4:00 PM',title:'Bop around Elie / East Neuk',status:'Flexible',cat:'Sightseeing'},
  {time:'5:30 PM',title:'Drive back to Pittormie',status:'Flexible',cat:'Travel',route:'30m drive',vendor:'localtransport'},
  {time:'7:00 PM',title:'Ride to St. Andrews',status:'Booked',cat:'Ground Transport',vendor:'localtransport'},
  {time:'7:30 PM',title:'Dinner at The Grange Inn',status:'Booked',cat:'Meals',route:'15m drive',notes:'£240 cancellation fee.',vendor:'grange'},
  {time:'8:00 PM',title:'Drinks at The Dunvegan',status:'Flexible',cat:'Sightseeing',vendor:'dunvegan'},
  {time:'9:00 PM',title:'Ride back to Pittormie',status:'Flexible',cat:'Ground Transport',vendor:'localtransport'}
 ]},
 {key:'2026-09-07',short:'Mon',day:'7',month:'Sep',long:'Monday, September 7',events:[
  {time:'Morning',title:'Breakfast / St. Andrews sightseeing',status:'Flexible',cat:'Sightseeing',notes:'St Rule’s Tower and St Andrews Castle. Sheet notes timing may be tight before the North Berwick lunch departure.',vendor:'pittormie'},
  {time:'10:30 AM',title:'Drive to North Berwick',status:'Flexible',cat:'Ground Transport',route:'1h 45m from hotel',vendor:'localtransport'},
  {time:'12:15 PM',title:'Lunch at The Rocketeer',status:'Not Yet Booked',cat:'Meals',vendor:'rocketeer'},
  {time:'2:50 PM',title:'Tee time at North Berwick',status:'Booked',cat:'Golf',notes:'Planned duration 3h 45m. Caddies added.',vendor:'northberwick'},
  {time:'7:30 PM',title:'Dinner at The Ship Inn',status:'Booked',cat:'Meals',route:'5m from North Berwick',notes:'Vibey seaside pub; burgers and seafood.',vendor:'shipinn'},
  {time:'9:00 PM',title:'Ride back to Pittormie',status:'Booked',cat:'Ground Transport',route:'1h 45m',vendor:'localtransport'}
 ]},
 {key:'2026-09-08',short:'Tue',day:'8',month:'Sep',long:'Tuesday, September 8',events:[
  {time:'8:00 AM',title:'Breakfast at Pittormie',status:'Flexible',cat:'Meals',vendor:'pittormie'},
  {time:'9:00 AM',title:'Massages at hotel',status:'Not Yet Booked',cat:'Lodging',notes:'Time Table_v2 note: 8:15 and 9:30.',vendor:'pittormie'},
  {time:'11:00 AM',title:'Depart Pittormie for Dunkeld',status:'Booked',cat:'Ground Transport',route:'~1h',notes:'Booked executive transfer.',vendor:'venture'},
  {time:'12:00 PM',title:'Lunch at The Taybank',status:'Pending',cat:'Meals',notes:'Comes highly recommended.',vendor:'taybank'},
  {time:'1:00 PM',title:'Dunkeld + The Hermitage',status:'Flexible',cat:'Sightseeing',route:'10m from lunch',notes:'Very scenic; about 1h 30m to walk around.'},
  {time:'2:30 PM',title:'Continue to Dornoch Station',status:'Pending',cat:'Ground Transport',route:'2h 45m drive',notes:'This movement is part of the Venture Highland Pittormie-to-Dornoch service.',vendor:'venture'},
  {time:'6:30 PM',title:'Check in to Dornoch Station',status:'Booked',cat:'Lodging',vendor:'dornochstation'},
  {time:'7:00 PM',title:'Dinner at Dornoch Castle Restaurant',status:'Booked',cat:'Meals',route:'7m walk',notes:'Pub with awesome atmosphere.',vendor:'dornochcastle'}
 ]},
 {key:'2026-09-09',short:'Wed',day:'9',month:'Sep',long:'Wednesday, September 9',events:[
  {time:'9:30 AM',title:'Drive to Castle Stuart',status:'Booked',cat:'Ground Transport',route:'1h 5m drive',vendor:'luxuryhighland'},
  {time:'11:48 AM',title:'Cabot Highlands · Castle Stuart',status:'Booked',cat:'Golf',notes:'Planned duration 4h 20m. Caddies added. Showers confirmed.',vendor:'cabot'},
  {time:'5:40 PM',title:'Drive to Hootananny Inverness',status:'Booked',cat:'Ground Transport',route:'15m drive',notes:'Keep golf clubs secured in the vehicle / arranged storage.',vendor:'luxuryhighland'},
  {time:'6:00 PM',title:'Dinner at Hootananny Inverness',status:'Booked',cat:'Meals',notes:'Live music. Cancellation under 24h: £15 per person.',vendor:'hootananny'},
  {time:'9:30 PM',title:'Return to Dornoch Station',status:'Booked',cat:'Ground Transport',route:'~1h drive',vendor:'luxuryhighland'}
 ]},
 {key:'2026-09-10',short:'Thu',day:'10',month:'Sep',long:'Thursday, September 10',events:[
  {time:'9:30 AM',title:'Drive to Glenmorangie',status:'Booked',cat:'Ground Transport',route:'13m from hotel',vendor:'luxuryhighland'},
  {time:'10:00 AM',title:'Glenmorangie Distillery tour',status:'Booked',cat:'Sightseeing',notes:'Planned duration 1h.',vendor:'glenmorangie'},
  {time:'11:30 AM',title:'Drive to Brora',status:'Booked',cat:'Ground Transport',route:'30m drive',vendor:'luxuryhighland'},
  {time:'12:50 PM',title:'Tee time at Brora',status:'Booked',cat:'Golf',notes:'Planned duration 3h 50m.',vendor:'brora'},
  {time:'6:30 PM',title:'Dinner at Royal Marine Hotel',status:'Booked',cat:'Meals',route:'Short walk from golf',notes:'Cozy pub; global cuisine.',vendor:'royalmarine'}
 ]},
 {key:'2026-09-11',short:'Fri',day:'11',month:'Sep',long:'Friday, September 11',events:[
  {time:'Morning',title:'TBD brunch',status:'Flexible',cat:'Meals',vendor:'dornochstation'},
  {time:'Morning',title:'Drive to Dunrobin Castle',status:'Not Yet Booked',cat:'Travel',route:'22m drive',notes:'Dunrobin does not open until 10:00 AM.',vendor:'localtransport'},
  {time:'Morning',title:'Visit Dunrobin Castle',status:'Not Yet Booked',cat:'Sightseeing',vendor:'dunrobin'},
  {time:'12:00 PM',title:'Drive back to Dornoch',status:'Not Yet Booked',cat:'Travel',route:'22m drive',vendor:'localtransport'},
  {time:'2:30 PM',title:'Tee time at Royal Dornoch',status:'Booked',cat:'Golf',route:'4m walk',notes:'Planned duration 4h 15m. Caddies added.',vendor:'royaldornoch'},
  {time:'7:15 PM',title:'Dinner at Royal Dornoch Clubhouse',status:'Booked',cat:'Meals',notes:'Classic golf clubhouse.',vendor:'royaldornoch'},
  {time:'8:15 PM',title:'Drive to Aberdeen',status:'Booked',cat:'Ground Transport',route:'3h 12m drive',vendor:'venture'},
  {time:'Late Night',title:'Check in to Trump Aberdeen Hotel',status:'Booked',cat:'Lodging',vendor:'trump'}
 ]},
 {key:'2026-09-12',short:'Sat',day:'12',month:'Sep',long:'Saturday, September 12',events:[
  {time:'10:00 AM',title:'Breakfast at Trump Aberdeen',status:'Booked',cat:'Meals',vendor:'trump'},
  {time:'12:12 PM',title:'Tee time at Trump Aberdeen',status:'Booked',cat:'Golf',notes:'Planned duration 4h 45m. Time Table_v2 notes Tony to reach out about caddies.',vendor:'trump'},
  {time:'5:45 PM',title:'Drive to The Cock & Bull',status:'Pending',cat:'Ground Transport',route:'6m drive',vendor:'localtransport'},
  {time:'6:00 PM',title:'Early dinner at The Cock & Bull',status:'Booked',cat:'Meals',vendor:'cockbull'},
  {time:'7:15 PM',title:'Drive to Edinburgh',status:'Booked',cat:'Ground Transport',route:'2h 45m drive',vendor:'venture'},
  {time:'10:00 PM',title:'Check in to DoubleTree Edinburgh Airport',status:'Booked',cat:'Lodging',vendor:'doubletree'}
 ]},
 {key:'2026-09-13',short:'Sun',day:'13',month:'Sep',long:'Sunday, September 13',events:[
  {time:'9:30 AM',title:'Airport shuttle to EDI',status:'Booked',cat:'Ground Transport',vendor:'doubletree'},
  {time:'11:30 AM',title:'Depart on UA119',status:'Booked',cat:'Travel',vendor:'united'}
 ]}
];

function travelDefaultDay(){
  const now=new Date(),mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  const exact=TRAVEL_DAYS.find(d=>{const x=new Date(d.key+'T12:00:00');return x.getFullYear()===now.getFullYear()&&x.getMonth()===now.getMonth()&&x.getDate()===now.getDate()});
  if(exact)return exact.key;
  return TRAVEL_DAYS.reduce((best,d)=>{
    const t=new Date(d.key+'T12:00:00').getTime(),delta=Math.abs(t-mid);
    return !best||delta<best.delta?{key:d.key,delta}:best;
  },null).key;
}
function travelSelectedDay(){return TRAVEL_DAYS.some(d=>d.key===state.ui.travelDay)?state.ui.travelDay:travelDefaultDay()}
function travelStatusClass(s){return s==='Booked'?'booked':s==='Pending'?'pending':s==='Flexible'?'flexible':'unbooked'}
function travelCatIcon(c){return({Travel:'✈️','Ground Transport':'🚐',Lodging:'🛏️',Meals:'🍴',Golf:'⛳',Sightseeing:'🏰'})[c]||'•'}
function travelContactButton(label,href){return`<a class="travel-contact" href="${href}" ${href.startsWith('http')?'target="_blank" rel="noopener"':''}>${label}</a>`}
function travelVendorHtml(id){
  if(!id)return'';const v=TRAVEL_VENDORS[id];if(!v)return'';
  const links=[v.tel?travelContactButton('Call','tel:'+v.tel):'',v.email?travelContactButton('Email','mailto:'+v.email):'',v.web?travelContactButton('Web',v.web):''].filter(Boolean).join('');
  return`<div class="travel-vendor"><div class="travel-vendor-head"><div><b>${v.name}</b><span>${v.role}</span></div>${links?`<div class="travel-contact-row">${links}</div>`:''}</div>${v.phone||v.email?`<div class="travel-vendor-detail">${[v.phone,v.email].filter(Boolean).join(' · ')}</div>`:''}${v.address?`<div class="travel-vendor-detail">${v.address}</div>`:''}${v.note?`<div class="travel-vendor-note">${v.note}</div>`:''}</div>`;
}
function renderTravelEvent(e){return`<div class="travel-event"><div class="travel-time">${e.time}</div><div class="travel-event-body"><div class="travel-event-top"><span class="travel-cat">${travelCatIcon(e.cat)} ${e.cat}</span><span class="travel-status ${travelStatusClass(e.status)}">${e.status}</span></div><h3>${e.title}</h3>${e.route?`<div class="travel-route">↗ ${e.route}</div>`:''}${e.notes?`<div class="travel-notes">${e.notes}</div>`:''}${travelVendorHtml(e.vendor)}</div></div>`}
function renderTravel(){
  const key=travelSelectedDay(),day=TRAVEL_DAYS.find(d=>d.key===key);
  const booked=day.events.filter(e=>e.status==='Booked').length,open=day.events.length-booked;
  return`<div class="card travel-hero"><div class="eyebrow">Travel dossier</div><h2>${day.long}</h2><div class="travel-summary"><b>${day.events.length}</b> itinerary items · <b>${booked}</b> booked${open?` · <b>${open}</b> flexible / open`:''}</div><div class="travel-day-picker">${TRAVEL_DAYS.map(d=>`<button class="travel-day ${d.key===key?'active':''}" data-travel-day="${d.key}"><span>${d.short}</span><b>${d.day}</b><small>${d.month}</small></button>`).join('')}</div><div class="tiny travel-source">Itinerary: Time Table_v2 · vendor contacts are public office contacts unless noted.</div></div><div class="travel-timeline">${day.events.map(renderTravelEvent).join('')}</div>`;
}

const renderBeforeTravel=render;
render=function(){
  if(state.ui.tab!=='travel')return renderBeforeTravel();
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='travel'));
  document.getElementById('app').innerHTML=renderTravel();
  bind();
};
