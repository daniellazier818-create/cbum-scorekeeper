/* v3.7.1 travel routing fix */
const renderBeforeTravelFix=render;
render=function(){
  if(state.ui.tab!=='travel')return renderBeforeTravelFix();
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='travel'));
  app.innerHTML=renderTravel();
  bind();
  if(typeof applyLiveMode==='function')applyLiveMode();
};
