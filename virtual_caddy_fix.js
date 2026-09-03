/* Final Virtual Caddy route wrapper. Loaded after live.js + travel_fix.js. */
const renderBeforeVirtualCaddy=render;
render=function(){
  if(state.ui.tab!=='caddy')return renderBeforeVirtualCaddy();
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='caddy'));
  app.innerHTML=renderVirtualCaddy();
  bind();
  bindVirtualCaddy();
  if(typeof applyLiveMode==='function')applyLiveMode();
};
