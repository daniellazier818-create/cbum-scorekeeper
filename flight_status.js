/* Travel dossier flight-status actions */
const TRAVEL_FLIGHT_STATUS={
  UA118:'https://www.united.com/en/us/flightstatus/details/118/2026-09-03/ORD/EDI/UA',
  UA119:'https://www.united.com/en/us/flightstatus/details/119/2026-09-13/EDI/ORD/UA'
};

const baseRenderTravelEventWithFlightStatus=renderTravelEvent;
renderTravelEvent=function(e){
  const html=baseRenderTravelEventWithFlightStatus(e);
  const match=(e.title||'').match(/\bUA\s?(\d{1,4})\b/i);
  if(!match)return html;
  const flight='UA'+match[1],url=TRAVEL_FLIGHT_STATUS[flight];
  if(!url)return html;
  const action=`<div class="travel-contact-row" style="margin-top:10px"><a class="travel-contact" href="${url}" target="_blank" rel="noopener">Flight status ↗</a></div>`;
  const closing='</div></div>',i=html.lastIndexOf(closing);
  return i<0?html:html.slice(0,i)+action+html.slice(i);
};
