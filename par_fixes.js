/* Gender-specific hole-data corrections where women's par/SI differs from men's. */
(function(){
  const elie=COURSE_DATA.elie.tees;
  const elieWomenParLong=[5,4,3,4,4,4,4,4,5,4,3,5,4,4,4,4,5,4];
  const elieWomenParGreen=[5,4,3,4,4,4,3,4,5,4,3,5,4,4,4,4,5,4];
  const elieWomenSILong=[3,9,13,1,15,7,17,5,11,18,6,16,8,2,12,4,14,10];
  const elieWomenSIGreen=[11,7,17,1,15,9,13,3,6,16,18,5,2,8,14,4,12,10];

  elie.White.womenPar=[...elieWomenParLong];
  elie.Yellow.womenPar=[...elieWomenParLong];
  elie.Green.womenPar=[...elieWomenParGreen];
  elie.White.womenSI=[...elieWomenSILong];
  elie.Yellow.womenSI=[...elieWomenSILong];
  elie.Green.womenSI=[...elieWomenSIGreen];

  const nb=COURSE_DATA.northberwick.tees;

  // North Berwick Blue is par 71 for men, par 74 for women.
  // Correct the men's H8 par (5) and provide the women's hole-by-hole par explicitly.
  nb.Blue.par=[4,4,4,3,4,3,4,5,5,3,5,4,4,4,3,4,4,4];
  nb.Blue.womenPar=[4,5,5,3,4,3,4,5,5,3,5,4,4,4,3,4,5,4];

  // Ladies tee is already the women's par-74 layout; make that explicit so holePar never falls back ambiguously.
  nb.Ladies.womenPar=[...nb.Ladies.par];
})();
