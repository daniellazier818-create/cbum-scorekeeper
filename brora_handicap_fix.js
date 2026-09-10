/* Brora handicap correction + clearer Wolf pop display.
   Red ladies: CR 70.3 / Slope 120 / Par 71.
   Wolf uses 75% Playing Handicap, max one stroke per hole. */
if(COURSE_DATA?.brora?.tees?.Red?.women){
  COURSE_DATA.brora.tees.Red.women[2]=71;
}

const renderPlayerScoreBeforeBroraHandicapFix=renderPlayerScore;
renderPlayerScore=function(c,p,h){
  let html=renderPlayerScoreBeforeBroraHandicapFix(c,p,h);
  if(c!=='brora')return html;
  const ch=courseHandicap(c,p);
  const ph=playingHandicap(c,p,.75);
  const old=` · CH ${ch??'?'}</div>`;
  const replacement=` · CH ${ch??'?'} · PH ${ph??'?'} (75%)</div>`;
  return html.replace(old,replacement);
};
