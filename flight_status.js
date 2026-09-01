/* Travel dossier FlightAware + Google Maps actions */
const TRAVEL_FLIGHT_STATUS={
  UA118:'https://www.flightaware.com/live/flight/UAL118',
  UA119:'https://www.flightaware.com/live/flight/UAL119'
};

const TRAVEL_GROUND_ROUTES={
  'Drive to Pittormie Castle':{origin:'Edinburgh Airport, Edinburgh, Scotland',destination:'Pittormie Castle, Dairsie, St Andrews, Scotland'},
  'Drive to St. Andrews':{origin:'Pittormie Castle, Dairsie, St Andrews, Scotland',destination:'Jigger Inn, Old Station Road, St Andrews, Scotland'},
  'Drive to Kingsbarns':{origin:'Pittormie Castle, Dairsie, St Andrews, Scotland',destination:'Kingsbarns Golf Links, Kingsbarns, St Andrews, Scotland'},
  'Drive back to Pittormie':{destination:'Pittormie Castle, Dairsie, St Andrews, Scotland'},
  'Drive to Elie':{origin:'Pittormie Castle, Dairsie, St Andrews, Scotland',destination:'Elie Golf House Club, Elie, Fife, Scotland'},
  'Ride to St. Andrews':{origin:'Pittormie Castle, Dairsie, St Andrews, Scotland',destination:'The Grange Inn, St Andrews, Scotland'},
  'Ride back to Pittormie':{destination:'Pittormie Castle, Dairsie, St Andrews, Scotland'},
  'Drive to North Berwick':{origin:'Pittormie Castle, Dairsie, St Andrews, Scotland',destination:'The Rocketeer Restaurant, North Berwick, Scotland'},
  'Depart Pittormie for Dunkeld':{origin:'Pittormie Castle, Dairsie, St Andrews, Scotland',destination:'The Taybank, Dunkeld, Scotland'},
  'Continue to Dornoch Station':{origin:'The Hermitage, Dunkeld, Scotland',destination:'Dornoch Station, Dornoch, Scotland'},
  'Drive to Castle Stuart':{origin:'Dornoch Station, Dornoch, Scotland',destination:'Cabot Highlands Castle Stuart, Inverness, Scotland'},
  'Drive to Hootananny Inverness':{origin:'Cabot Highlands Castle Stuart, Inverness, Scotland',destination:'Hootananny, Church Street, Inverness, Scotland'},
  'Return to Dornoch Station':{origin:'Hootananny, Church Street, Inverness, Scotland',destination:'Dornoch Station, Dornoch, Scotland'},
  'Drive to Glenmorangie':{origin:'Dornoch Station, Dornoch, Scotland',destination:'Glenmorangie Distillery, Tain, Scotland'},
  'Drive to Brora':{origin:'Glenmorangie Distillery, Tain, Scotland',destination:'Brora Golf Club, Brora, Scotland'},
  'Drive to Dunrobin Castle':{origin:'Dornoch Station, Dornoch, Scotland',destination:'Dunrobin Castle, Golspie, Scotland'},
  'Drive back to Dornoch':{origin:'Dunrobin Castle, Golspie, Scotland',destination:'Royal Dornoch Golf Club, Dornoch, Scotland'},
  'Drive to Aberdeen':{origin:'Royal Dornoch Golf Club, Dornoch, Scotland',destination:'Trump International Golf Links Scotland, Balmedie, Aberdeen, Scotland'},
  'Drive to The Cock & Bull':{origin:'Trump International Golf Links Scotland, Balmedie, Aberdeen, Scotland',destination:'The Cock & Bull, Balmedie, Aberdeen, Scotland'},
  'Drive to Edinburgh':{origin:'The Cock & Bull, Balmedie, Aberdeen, Scotland',destination:'DoubleTree by Hilton Edinburgh Airport, Ingliston, Edinburgh, Scotland'},
  'Airport shuttle to EDI':{origin:'DoubleTree by Hilton Edinburgh Airport, Ingliston, Edinburgh, Scotland',destination:'Edinburgh Airport, Edinburgh, Scotland'}
};

function travelFlightStatusHtml(e){
  const match=(e.title||'').match(/\bUA\s?(\d{1,4})\b/i);
  if(!match)return'';
  const flight='UA'+match[1],url=TRAVEL_FLIGHT_STATUS[flight];
  if(!url)return'';
  return`<div class="travel-contact-row" style="margin-top:10px"><a class="travel-contact" href="${url}" target="_blank" rel="noopener">FlightAware ↗</a></div>`;
}

function travelGroundDirectionsHtml(e){
  const r=TRAVEL_GROUND_ROUTES[e.title];
  if(!r)return'';
  const q=new URLSearchParams({api:'1',destination:r.destination,travelmode:'driving'});
  if(r.origin)q.set('origin',r.origin);
  const url=`https://www.google.com/maps/dir/?${q.toString()}`;
  return`<div class="travel-contact-row" style="margin-top:10px"><a class="travel-contact" href="${url}" target="_blank" rel="noopener">Google Maps ↗</a></div>`;
}

renderTravelEvent=function(e){
  return`<div class="travel-event"><div class="travel-time">${e.time}</div><div class="travel-event-body"><div class="travel-event-top"><span class="travel-cat">${travelCatIcon(e.cat)} ${e.cat}</span><span class="travel-status ${travelStatusClass(e.status)}">${e.status}</span></div><h3>${e.title}</h3>${e.route?`<div class="travel-route">↗ ${e.route}</div>`:''}${e.notes?`<div class="travel-notes">${e.notes}</div>`:''}${travelVendorHtml(e.vendor)}${travelGroundDirectionsHtml(e)}${travelFlightStatusHtml(e)}</div></div>`;
};
