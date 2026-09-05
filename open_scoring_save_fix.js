/* Open scoring persistence + sync correctness.
   Local state saves immediately. Only shared-data changes publish.
   Unsynced local edits survive reloads and are never overwritten by older remote state. */
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

  if(rawFetch){
    fetchLive=async function(){
      let pending=false;
      try{pending=localStorage.getItem(PENDING_KEY)==='1'}catch(e){}
      if(pending){
        if(navigator.onLine&&!livePublishing&&typeof scheduleLivePublish==='function')scheduleLivePublish();
        return;
      }
      await rawFetch();
      baseline=sharedSig();
    };
  }

  /* If a prior build left an edit marked dirty, push that local state before accepting remote state. */
  try{
    if(localStorage.getItem(PENDING_KEY)==='1'&&navigator.onLine&&typeof scheduleLivePublish==='function')scheduleLivePublish();
  }catch(e){}
})();
