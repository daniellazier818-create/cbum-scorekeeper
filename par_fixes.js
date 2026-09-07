/* Gender-specific par corrections for tees where women's par differs from men's par. */
(function(){
  const nb=COURSE_DATA.northberwick.tees;

  // North Berwick Blue is par 71 for men, par 74 for women.
  // Correct the men's H8 par (5) and provide the women's hole-by-hole par explicitly.
  nb.Blue.par=[4,4,4,3,4,3,4,5,5,3,5,4,4,4,3,4,4,4];
  nb.Blue.womenPar=[4,5,5,3,4,3,4,5,5,3,5,4,4,4,3,4,5,4];

  // Ladies tee is already the women's par-74 layout; make that explicit so holePar never falls back ambiguously.
  nb.Ladies.womenPar=[...nb.Ladies.par];
})();
