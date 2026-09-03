/* Elie hole-plan renderer. Each local image sheet contains two consecutive holes. */
function caddyElieImage(h,c){
  const pair=Math.ceil(h.n/2), side=(h.n-1)%2;
  const src=`assets/elie/pair-${String(pair).padStart(2,'0')}.jpg`;
  return `<figure class="caddy-image caddy-elie-image"><div class="elie-hole-crop"><img src="${src}" alt="Elie hole ${h.n} plan" style="left:${side?-100:0}%" loading="eager" draggable="false"></div><figcaption>Elie hole ${h.n} plan</figcaption><div class="caddy-image-fallback">Hole image not available</div></figure>`;
}
const caddyImageBeforeElie=caddyImage;
caddyImage=function(h,c){return c.id==='elie'?caddyElieImage(h,c):caddyImageBeforeElie(h,c)};
