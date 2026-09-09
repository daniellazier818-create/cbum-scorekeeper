/* Castle Stuart Bumstead handicap correction: low unrounded CH plays scratch; others receive 90% of the difference. */
function bumsteadPlayingHandicap(p){
  const vals=PLAYER_ORDER.map(x=>unroundedCourseHandicap('castlestuart',x));
  if(vals.some(x=>x==null))return null;
  const low=Math.min(...vals),x=unroundedCourseHandicap('castlestuart',p);
  return Math.round((x-low)*.9);
}

const regularStrokesBeforeCastleFix=regularStrokes;
regularStrokes=function(c,p,h){
  if(c==='castlestuart')return strokesFromPH(bumsteadPlayingHandicap(p),holeSI(c,p,h));
  return regularStrokesBeforeCastleFix(c,p,h);
};

if(typeof playingHandicapPreview==='function'){
  const playingHandicapPreviewBeforeCastleFix=playingHandicapPreview;
  playingHandicapPreview=function(c,p){
    if(c==='castlestuart')return bumsteadPlayingHandicap(p);
    return playingHandicapPreviewBeforeCastleFix(c,p);
  };
}
