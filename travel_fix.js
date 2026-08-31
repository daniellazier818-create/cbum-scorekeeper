/* v3.7.1 travel routing + day selector fix */
const renderBeforeTravelFix=render;
render=function(){
  if(state.ui.tab!=='travel')return renderBeforeTravelFix();
  const app=document.getElementById('app');if(!app)return;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='travel'));
  app.innerHTML=renderTravel();
  bind();
  if(typeof applyLiveMode==='function')applyLiveMode();
};

document.addEventListener('click',e=>{
  const day=e.target.closest?.('[data-travel-day]');
  if(!day)return;
  state.ui.travelDay=day.dataset.travelDay;
  save();
  render();
  const picker=document.querySelector('.travel-day-picker');
  if(picker)picker.scrollIntoView({block:'nearest'});
});
