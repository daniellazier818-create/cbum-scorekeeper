/* Robust Handicap Index persistence for iPhone + active-round corrections. */
(function(){
  const baseBind=bind;

  function activeRoundForHI(){
    const rows=Object.entries(state.roundLocks||{})
      .filter(([c,l])=>l&&typeof progress==='function'&&progress(c)<18)
      .sort((a,b)=>new Date(b[1].startedAt||0)-new Date(a[1].startedAt||0));
    return rows[0]?.[0]||null;
  }

  function commitHI(el,final=false){
    const p=el.dataset.hi;
    const raw=String(el.value??'').trim();
    const v=Number.parseFloat(raw);
    if(!Number.isFinite(v)||v<0||v>54){
      if(final){
        el.value=(+state.players[p].hi).toFixed(1);
        if(typeof toast==='function')toast('Enter a Handicap Index from 0.0 to 54.0');
      }
      return false;
    }

    const hi=Math.round(v*10)/10;
    state.players[p].hi=hi;

    /* An explicit edit should correct the currently active round's frozen HI,
       while completed historical rounds remain untouched. */
    const active=activeRoundForHI();
    if(active&&state.roundLocks?.[active]){
      state.roundLocks[active].his=state.roundLocks[active].his||{};
      state.roundLocks[active].his[p]=hi;
    }

    /* save() is overridden by open_scoring_save_fix.js to write localStorage
       synchronously and queue live sync, so this is safe on every keystroke. */
    save();

    if(final){
      el.value=hi.toFixed(1);
      if(typeof toast==='function')toast(`${playerLabel(p)} HI ${hi.toFixed(1)} saved${active?' · current round updated':''}`);
    }
    return true;
  }

  bind=function(){
    baseBind();
    document.querySelectorAll('[data-hi]').forEach(el=>{
      el.setAttribute('inputmode','decimal');
      el.setAttribute('autocomplete','off');
      el.oninput=()=>commitHI(el,false);
      el.onchange=()=>commitHI(el,false);
      el.onblur=()=>commitHI(el,true);
    });
  };

  /* bind.js renders before this patch loads, so attach the improved handlers
     to the current screen immediately as well as all future renders. */
  bind();
})();
