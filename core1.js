const PLAYER_ORDER=['daniel','emily','tony','allison'];
const DEFAULTS={
 players:{daniel:{name:'Daniel',hi:12.2,gender:'men'},emily:{name:'Emily',hi:14.0,gender:'women'},tony:{name:'Tony',hi:14.6,gender:'men'},allison:{name:'Allison',hi:21.9,gender:'women'}},
 tees:{kingsbarns:{daniel:'Green',tony:'Green',emily:'Red',allison:'Red'},elie:{daniel:'Yellow',tony:'Yellow',emily:'Green',allison:'Green'},northberwick:{daniel:'Blue',tony:'Blue',emily:'Ladies',allison:'Ladies'},castlestuart:{daniel:'Green',tony:'Green',emily:'Red',allison:'Red'},brora:{daniel:'Yellow',tony:'Yellow',emily:'Red',allison:'Red'},royaldornoch:{daniel:'Orange',tony:'Orange',emily:'Grey',allison:'Blue'},trump:{daniel:'White',tony:'White',emily:'Green',allison:'Red'}},
 wolfOrder:['daniel','emily','tony','allison']
};
const STORAGE='cbum-scorekeeper-v1';
function freshState(){let scores={},wolfCalls={};Object.keys(COURSE_DATA).forEach(c=>{scores[c]={};PLAYER_ORDER.forEach(p=>scores[c][p]=Array(18).fill(null));});return{version:2,players:JSON.parse(JSON.stringify(DEFAULTS.players)),tees:JSON.parse(JSON.stringify(DEFAULTS.tees)),scores,wolfOrder:[...DEFAULTS.wolfOrder],wolfCalls,ui:{tab:'rounds',round:null,hole:0,autoAdvance:true,compact:true},manual:{coin:{}},locks:{seeds:null,bumstead:null,finals:null}}}
let state=loadState();
function loadState(){try{const x=JSON.parse(localStorage.getItem(STORAGE));if(x&&(x.version===1||x.version===2)){const m=mergeState(freshState(),x);m.version=2;if(m.ui.autoAdvance==null)m.ui.autoAdvance=true;if(m.ui.compact==null)m.ui.compact=true;return m}}catch(e){}return freshState()}
function mergeState(base,x){Object.assign(base,x);base.players={...base.players,...(x.players||{})};base.tees={...base.tees,...(x.tees||{})};Object.keys(base.scores).forEach(c=>{base.scores[c]={...base.scores[c],...((x.scores||{})[c]||{})};PLAYER_ORDER.forEach(p=>{if(!Array.isArray(base.scores[c][p]))base.scores[c][p]=Array(18).fill(null);});});base.ui={...base.ui,...(x.ui||{})};base.manual={...base.manual,...(x.manual||{})};base.locks={...base.locks,...(x.locks||{})};return base}
let saveTimer;function save(){document.getElementById('saveState').textContent='Saving';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{localStorage.setItem(STORAGE,JSON.stringify(state));document.getElementById('saveState').textContent='Saved'},120)}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1100)}
function courseTee(c,p){return COURSE_DATA[c].tees[state.tees[c][p]]}
function ratingTuple(c,p){const t=courseTee(c,p);const g=state.players[p].gender;return t[g]||null}
function holePar(c,p,h){const t=courseTee(c,p),g=state.players[p].gender;return (g==='women'&&t.womenPar?t.womenPar[h]:g==='men'&&t.menPar?t.menPar[h]:t.par[h])}
function holeSI(c,p,h){const t=courseTee(c,p),g=state.players[p].gender;return (g==='women'&&t.womenSI?t.womenSI[h]:g==='men'&&t.menSI?t.menSI[h]:t.si[h])}
function yards(c,p,h){return courseTee(c,p).yards[h]}
function unroundedCourseHandicap(c,p){const r=ratingTuple(c,p);if(!r)return null;return state.players[p].hi*r[1]/113+(r[0]-r[2])}
function courseHandicap(c,p){const x=unroundedCourseHandicap(c,p);return x==null?null:Math.round(x)}
function playingHandicap(c,p,allow=1){const ch=courseHandicap(c,p);return ch==null?null:Math.round(ch*allow)}
function strokesFromPH(ph,si,capOne=false){if(ph==null)return 0;if(capOne)return ph>=si?1:0;if(ph>=0)return Math.floor(ph/18)+(si<=ph%18?1:0);const a=Math.abs(ph);return -(Math.floor(a/18)+(si<=a%18?1:0))}
function eventAllowance(c){return({qualifier:1,fourball:.9,semis:1,bumstead:.9,wolf:.75,finals:1,finale:1})[COURSE_DATA[c].event]}
function fourballPlayingHandicap(p){const vals=PLAYER_ORDER.map(x=>unroundedCourseHandicap('elie',x));if(vals.some(x=>x==null))return null;const low=Math.min(...vals),x=unroundedCourseHandicap('elie',p);return Math.round((x-low)*.9)}
function regularStrokes(c,p,h){if(c==='elie')return strokesFromPH(fourballPlayingHandicap(p),holeSI(c,p,h));return strokesFromPH(playingHandicap(c,p,eventAllowance(c)),holeSI(c,p,h),COURSE_DATA[c].event==='wolf')}
function singlesPairForPlayer(c,p){let matches=c==='northberwick'?semis():(c==='royaldornoch'&&finalMatches()?Object.values(finalMatches()):[]);return matches.find(m=>m.includes(p))||null}
function displayStrokes(c,p,h){if(COURSE_DATA[c].event==='semis'||COURSE_DATA[c].event==='finals'){const pair=singlesPairForPlayer(c,p);if(!pair)return 0;const chs=pair.map(x=>courseHandicap(c,x));if(chs.some(x=>x==null))return 0;const low=Math.min(...chs),ph=courseHandicap(c,p)-low;return strokesFromPH(ph,holeSI(c,p,h))}return regularStrokes(c,p,h)}
function gross(c,p,h){return state.scores[c][p][h]}
function net(c,p,h,mode='event'){const g=gross(c,p,h);if(g==null)return null;let st;if(mode==='skins')st=strokesFromPH(playingHandicap(c,p,.5),holeSI(c,p,h),true);else st=regularStrokes(c,p,h);return g-st}
function stableford(c,p,h){const n=net(c,p,h);if(n==null)return null;const d=n-holePar(c,p,h);return d<=-3?5:d===-2?4:d===-1?3:d===0?2:d===1?1:0}
function completedHole(c,h){return PLAYER_ORDER.every(p=>gross(c,p,h)!=null)}
function holeReady(c,h){return completedHole(c,h)&&(c!=='brora'||!!state.wolfCalls[h])}