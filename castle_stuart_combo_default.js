/* Move Emily to the Castle Stuart Blue / Combo tee before scoring begins. */
(function(){
  try{
    const hasScores=PLAYER_ORDER.some(p=>(state.scores?.castlestuart?.[p]||[]).some(v=>v!=null));
    if(!hasScores&&state.tees?.castlestuart?.emily==='Red'){
      state.tees.castlestuart.emily='Blue / Combo';
      localStorage.setItem(STORAGE,JSON.stringify(state));
    }
  }catch(e){console.error('Castle Stuart combo tee migration failed',e)}
})();
