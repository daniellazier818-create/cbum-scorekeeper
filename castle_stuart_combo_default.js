/* Keep Emily on the Castle Stuart Green/Red Combo tee. */
(function(){
  try{
    const current=state.tees?.castlestuart?.emily;
    if(current==='Red'||current==='Blue / Combo'){
      state.tees.castlestuart.emily='Green/Red Combo';
      localStorage.setItem(STORAGE,JSON.stringify(state));
    }
  }catch(e){console.error('Castle Stuart combo tee migration failed',e)}
})();
