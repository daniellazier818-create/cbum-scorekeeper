/* Castle Stuart Green/Red combination tee for Emily. */
const CASTLE_STUART_GREEN_RED_COMBO={
  yards:[330,486,266,161,332,411,359,192,330,341,115,504,303,347,314,310,133,490],
  par:[4,5,4,3,4,5,4,3,4,4,3,5,4,4,4,4,3,5],
  si:[9,5,13,17,7,3,1,15,11,14,16,2,4,10,8,18,6,12],
  women:[74.4,134,72]
};
COURSE_DATA.castlestuart.tees['Green/Red Combo']=CASTLE_STUART_GREEN_RED_COMBO;
/* Backward compatibility for devices that previously stored the old internal name. */
Object.defineProperty(COURSE_DATA.castlestuart.tees,'Blue / Combo',{value:CASTLE_STUART_GREEN_RED_COMBO,enumerable:false,configurable:true});
