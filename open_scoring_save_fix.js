/* Open scoring persistence + sync correctness.
   Local state saves immediately. Only shared-data changes publish.
   Unsynced local edits survive reloads and stale remote blanks can never erase entered gross scores. */
(function(){
  const PENDING_KEY='cbum-live-pending-v1';
  const sharedClone=()=>{const copy=JSON.parse(JSON.stringify(state));delete copy.ui;return copy};
  const sharedSig=()=>JSON.stringify(sharedClone());
  let baseline=sharedSig();

  const rawSchedule=typeof scheduleLivePublish==='function'?scheduleLivePublish:null;
  const rawPublish=typeof publishPayload==='function'?publishPayload:null;
  const rawFetch=typeof fetchLive==='function'?fetchLive:null;

  if(rawPublish){
    publishPayload=async function(payload){
      const result=await rawPublish(payload);
      try{localStorage.removeItem(PENDING_KEY)}catch(e){}
      baseline=JSON.stringify(payload);
      return result;
    };
  }

  if(rawSchedule){
    scheduleLivePublish=function(){
      let pending=false;
      try{pending=localStorage.getItem(PENDING_KEY)==='1'}catch(e){}
      if(!pending)return;
      return rawSchedule();
    };
  }

  save=function(){
    clearTimeout(saveTimer);
    try{
      localStorage.setItem(STORAGE,JSON.stringify(state));
    }catch(e){
      console.error('Local save failed',e);
      if(typeof toast==='function')toast('Could not save locally');
      return;
    }

    const sig=sharedSig();
    if(sig!==baseline){
      baseline=sig;
      try{localStorage.setItem(PENDING_KEY,'1')}catch(e){}
      if(typeof scheduleLivePublish==='function')scheduleLivePublish();
    }
  };

  function restoreEnteredScores(before){
    let restored=0;
    if(!before?.scores||!state?.scores)return restored;
    Object.keys(before.scores).forEach(c=>{
      if(!state.scores[c])state.scores[c]={};
      Object.keys(before.scores[c]||{}).forEach(p=>{
        const prior=before.scores[c]?.[p];
        if(!Array.isArray(prior))return;
        if(!Array.isArray(state.scores[c][p]))state.scores[c][p]=Array(18).fill(null);
        for(let h=0;h<18;h++){
          if(prior[h]!=null&&state.scores[c][p][h]==null){
            state.scores[c][p][h]=prior[h];
            restored++;
          }
        }
      });
    });
    return restored;
  }

  if(rawFetch){
    fetchLive=async function(){
      let pending=false;
      try{pending=localStorage.getItem(PENDING_KEY)==='1'}catch(e){}
      if(pending){
        if(navigator.onLine&&!livePublishing&&typeof scheduleLivePublish==='function')scheduleLivePublish();
        return;
      }

      /* Keep a local copy before hydration. The server may contain an older whole-card
         snapshot from another editor. It is allowed to update existing non-null scores,
         but it may never turn an already-entered score back into null. */
      const before=sharedClone();
      await rawFetch();
      const restored=restoreEnteredScores(before);

      if(restored){
        try{
          localStorage.setItem(STORAGE,JSON.stringify(state));
          localStorage.setItem(PENDING_KEY,'1');
        }catch(e){}
        baseline=sharedSig();
        if(typeof render==='function')render();
        if(navigator.onLine&&!livePublishing&&typeof scheduleLivePublish==='function')scheduleLivePublish();
        console.warn(`Protected ${restored} entered score${restored===1?'':'s'} from a stale live snapshot.`);
        return;
      }

      baseline=sharedSig();
    };
  }

  /* If a prior build left an edit marked dirty, push that local state before accepting remote state. */
  try{
    if(localStorage.getItem(PENDING_KEY)==='1'&&navigator.onLine&&typeof scheduleLivePublish==='function')scheduleLivePublish();
  }catch(e){}
})();
