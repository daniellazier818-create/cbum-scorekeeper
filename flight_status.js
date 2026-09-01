/* Travel dossier flight-status actions */
const TRAVEL_FLIGHT_STATUS={
  UA118:'https://www.united.com/en/us/flightstatus/details/118/2026-09-03/ORD/EDI/UA',
  UA119:'https://www.united.com/en/us/flightstatus/details/119/2026-09-13/EDI/ORD/UA'
};

function travelFlightStatusHtml(e){
  const match=(e.title||'').match(/\bUA\s?(\d{1,4})\b/i);
  if(!match)return'';
  const flight='UA'+match[1],url=TRAVEL_FLIGHT_STATUS[flight];
  if(!url)return'';
  return`<div class="travel-contact-row" style="margin-top:10px"><a class="travel-contact" href="${url}" target="_blank" rel="noopener">Flight status ↗</a></div>`;
}

renderTravelEvent=function(e){
  return`<div class="travel-event"><div class="travel-time">${e.time}</div><div class="travel-event-body"><div class="travel-event-top"><span class="travel-cat">${travelCatIcon(e.cat)} ${e.cat}</span><span class="travel-status ${travelStatusClass(e.status)}">${e.status}</span></div><h3>${e.title}</h3>${e.route?`<div class="travel-route">↗ ${e.route}</div>`:''}${e.notes?`<div class="travel-notes">${e.notes}</div>`:''}${travelVendorHtml(e.vendor)}${travelFlightStatusHtml(e)}</div></div>`;
};
