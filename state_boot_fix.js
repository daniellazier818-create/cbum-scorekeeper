/* Boot compatibility shim: core1's legacy loader accepts v1/v2 only, while the app currently persists schema v3. Downgrade the version marker before core1 loads; ux.js restores schema v3 after merging, preserving scores, roundLocks and all other state. */
(function(){
  const key='cbum-scorekeeper-v1';
  try{
    const raw=localStorage.getItem(key);
    if(!raw)return;
    const saved=JSON.parse(raw);
    if(saved&&Number(saved.version)>=3){
      saved.version=2;
      localStorage.setItem(key,JSON.stringify(saved));
    }
  }catch(e){console.error('State boot compatibility check failed',e)}
})();
