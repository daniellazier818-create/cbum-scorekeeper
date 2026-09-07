/* C-Bum Cup points: award match-play results when the match is resolved, not only when every score cell is filled. */
eventPointsMap=function(c){
  const m=Object.fromEntries(PLAYER_ORDER.map(p=>[p,0]));

  if(c==='elie'){
    const r=resolveFourball(),teams=fourballTeams();
    if(r.winner!=null)teams.forEach((t,i)=>t.forEach(p=>m[p]+=i===r.winner?5:2));
  }

  if(c==='northberwick'){
    semifinalResults().forEach(r=>{if(r&&r.winner){m[r.winner]+=5;m[r.loser]+=2;}});
  }

  if(c==='castlestuart'){
    const r=resolveBumstead(),teams=bumsteadTeams();
    if(r.winner!=null)teams.forEach((t,i)=>t.forEach(p=>m[p]+=i===r.winner?5:2));
  }

  if(c==='brora'&&roundComplete(c)){
    const rows=wolfRanks(),base=[5,3,2,1];let i=0;
    while(i<rows.length){let j=i+1;while(j<rows.length&&rows[j].pts===rows[i].pts)j++;const avg=base.slice(i,j).reduce((a,b)=>a+b,0)/(j-i);for(let k=i;k<j;k++)m[rows[k].p]+=avg;i=j;}
  }

  if(c==='royaldornoch'){
    const fm=finalMatches();
    if(fm){
      const a=fullSinglesResult(c,...fm.champ),b=fullSinglesResult(c,...fm.consolation);
      if(a&&a.winner){m[a.winner]+=5;m[a.loser]+=3;}
      if(b&&b.winner){m[b.winner]+=2;m[b.loser]+=1;}
    }
  }

  if(c==='trump'&&roundComplete(c)){
    const rows=stablefordRows(c),pts=[7,4,2,1];rows.forEach((r,i)=>m[r.p]+=pts[i]);
  }

  if(c!=='kingsbarns')PLAYER_ORDER.forEach(p=>{if(grossBirdie(c,p))m[p]+=1;});
  return m;
};

cbumStandings=function(include=['elie','northberwick','castlestuart','brora','royaldornoch','trump']){
  const rows=PLAYER_ORDER.map(p=>({p,pts:0,wins:0,birdies:0,by:{}}));
  const byP=Object.fromEntries(rows.map(r=>[r.p,r]));

  include.forEach(c=>{
    const e=eventPointsMap(c);
    PLAYER_ORDER.forEach(p=>{byP[p].pts+=e[p];byP[p].by[c]=e[p];if(grossBirdie(c,p))byP[p].birdies++;});

    let winners=[];
    if(c==='elie'){
      const r=resolveFourball();if(r.winner!=null)winners=fourballTeams()[r.winner];
    }else if(c==='northberwick'){
      winners=semifinalResults().filter(x=>x&&x.winner).map(x=>x.winner);
    }else if(c==='castlestuart'){
      const r=resolveBumstead();if(r.winner!=null)winners=bumsteadTeams()[r.winner];
    }else if(c==='brora'&&roundComplete(c)){
      const w=wolfRanks()[0];if(w)winners=[w.p];
    }else if(c==='royaldornoch'){
      const fm=finalMatches();if(fm){const r=fullSinglesResult(c,...fm.champ);if(r&&r.winner)winners=[r.winner];}
    }else if(c==='trump'&&roundComplete(c)){
      winners=[stablefordRows(c)[0].p];
    }
    winners.forEach(p=>byP[p].wins++);
  });

  const trumpRank=roundComplete('trump')?Object.fromEntries(stablefordRows('trump').map((r,i)=>[r.p,i])):Object.fromEntries(PLAYER_ORDER.map(p=>[p,0]));
  rows.sort((a,b)=>b.pts-a.pts||b.wins-a.wins||(trumpRank[a.p]??0)-(trumpRank[b.p]??0)||b.birdies-a.birdies||PLAYER_ORDER.indexOf(a.p)-PLAYER_ORDER.indexOf(b.p));
  return rows;
};
