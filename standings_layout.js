/* v3.2.1 even event-breakdown columns */
const evenBaseRenderStandings=renderStandings;
renderStandings=function(){
  const html=evenBaseRenderStandings();
  const cols='<colgroup>'+Array.from({length:8},()=>'<col style="width:12.5%">').join('')+'</colgroup>';
  return html.replace('<table class="table"><thead><tr><th>Player</th>',`<table class="table" style="table-layout:fixed;min-width:560px">${cols}<thead><tr><th>Player</th>`);
};
