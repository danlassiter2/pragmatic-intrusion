var stims = [
  { 
    content_type: "con", 
    prompt: "The square is pink and is left of the circle.",
    prompt_name: "con1",
    qud1: "What color is the square?", 
    qud2: "Where is the square?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "con", 
    prompt: "The circle is green and the square is next to the triangle.",
    prompt_name: "con2",
    qud1: "What color is the triangle?", 
    qud2: "Where is the circle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "con", 
    prompt: "The square is pink and is left of the circle.",
    prompt_name: "con3",
    qud1: "What color is the square?", 
    qud2: "Where is the square?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  // ana items:
  // tt = primary, something else too
  // tf = primary, nothing else
  // ft = primary false, something else true
  // ff = primary false, nothing else true
  { 
    content_type: "ana", 
    prompt: "The triangle is pink too.",
    prompt_name: "ana1",
    qud1: "What color is the triangle?", 
    qud2: "Besides the triangle, is any other shape pink?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "ana", 
    prompt: "The square is blue too.",
    prompt_name: "ana2",
    qud1: "What color is the square?", 
    qud2: "Besides the square, is any other shape blue?", 
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "ana", 
    prompt: "The circle is green too.",
    prompt_name: "ana3",
    qud1: "What color is the circle?", 
    qud2: "Besides the circle, is any other shape green?", 
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  // only A is B items:
  // tt = nothing else is B, A is B
  // tf = nothing is B
  // ft = something else is B, A is B
  // ff = something else is B, A is not B
  { 
    content_type: "only", 
    prompt: "Only the square is green.",
    prompt_name: "only1",
    qud1: "What color is the square?", 
    qud2: "Besides the square, is any other shape green?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "only", 
    prompt: "Only the triangle is blue.",
    prompt_name: "only2",
    qud1: "What color is the triangle?", 
    qud2: "Besides the triangle, is any other shape blue?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "only", 
    prompt: "Only the circle is pink.",
    prompt_name: "only3",
    qud1: "What color is the circle?",  
    qud2: "Besides the circle, is any other shape pink?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  // arc items: like con 
  // REMEMBER: primary = main clause, 2ndary = ARC
  // not corresponding to linear order!
  { 
    content_type: "arc", 
    prompt: "The circle, which is blue, is right of the triangle.",
    prompt_name: "arc1",
    qud1: "Where is the circle?", 
    qud2: "What color is the circle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "arc", 
    prompt: "The square, which is left of the circle, is pink.",
    prompt_name: "arc2",
    qud1: "Where is the circle?", 
    qud2: "What color is the circle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "arc", 
    prompt: "The triangle, which is green, is left of the square.",
    prompt_name: "arc3",
    qud1: "Where is the circle?", 
    qud2: "What color is the circle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },

  // def_ex items:
  // tt = primary true of (unique) thing that satisfies descr
  // tf = primary true of (unique) noun referent, but nothing satisfies descr bc of color adj
  // ft = primary false of unique thing that satisfies descr
  // ff = primary false of (unique) noun referent, but nothing satisfies descr bc of color adj
  { 
    content_type: "def_ex", 
    prompt: "The blue circle is next to the triangle.",
    prompt_name: "def_ex1",
    qud1: "Where is the blue circle?", 
    qud2: "Is there a blue circle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "def_ex", 
    prompt: "The pink triangle is right of the square.",
    prompt_name: "def_ex2",
    qud1: "Where is the pink triangle?", 
    qud2: "What color is the triangle?",
    qud3: "Is there a blue circle?", 
    qud4: ""
  },
  { 
    content_type: "def_ex", 
    prompt: "The green square is left of the circle.",
    prompt_name: "def_ex3",
    qud1: "Where is the green square?", 
    qud2: "What color is the square?",
    qud3: "Is there a blue circle?", 
    qud4: ""
  },
   // def_un items:
  // tt = primary true, nothing else satisfies descr
  // tf = primary true, something else satisfies descr
  // ft = primary false, nothing else satisfies descr
  // ff = primary false, something else satisfies descr
  { 
    content_type: "def_un", 
    prompt: "The circle is left of the triangle.",
    prompt_name: "def_un1",
    qud1: "Where is the circle?", 
    qud2: "Is there more than one circle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "def_un", 
    prompt: "The triangle is pink.",
    prompt_name: "def_un2",
    qud1: "What color is the triangle?", 
    qud2: "Is there more than one triangle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
  { 
    content_type: "def_un", 
    prompt: "The blue square is right of the circle.",
    prompt_name:  "def_un3",
    qud1: "Where is the blue square?", 
    qud2: "Is there more than one square?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
   // scalar items:
  // tt = some, not all
  // tf = some & all = all
    // uniquely here, images for scalar1-tf are identical bc only one way to instantiate
  // ft = not some and not all = none
  // ff = not some & all - IMPOSSIBLE
  { 
    content_type: "scalar", 
    prompt: "Some of the circles are green.",
    prompt_name: "scalar1",
    qud1: "Are any of the circles green?", 
    qud2: "Are all of the circles green?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
    { 
    content_type: "scalar", 
    prompt: "Some of the shapes are blue.",
    prompt_name: "scalar2",
    qud1: "Are any of the shapes blue?", 
    qud2: "Are all of the shapes blue?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
    { 
    content_type: "scalar", 
    prompt: "Some of the shapes are squares.",
    prompt_name: "scalar3",
    qud1: "Is at least one the shapes squares?", 
    qud2: "Are all of the shapes squares?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
   // numeral items: one -> exactly one
  // tt = exactly one
  // tf = two items satisfy 
  // ft = IMPOSSIBLE - if 'at least one' is false, then 'exactly one' also false
  // ff = zero items satisfy
    { 
    content_type: "numeral", 
    prompt: "One of the shapes is a triangle.",
    prompt_name: "numeral1",
    qud1: "Is at least one of the shapes a triangle?", 
    qud2: "Is exactly one of the shapes a triangle?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
    { 
    content_type: "numeral", 
    prompt: "One of the circles is pink.",
    prompt_name: "numeral2",
    qud1: "Is at least one of the circles pink?", 
    qud2: "Is exactly one of the circles pink?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  },
    { 
    content_type: "numeral", 
    prompt: "One of the squares is green.",
    prompt_name: "numeral3",
    qud1: "Is at least one of the squares green?", 
    qud2: "Is exactly one of the squares green?",
    qud3: "What can you tell me about the shapes?", 
    qud4: ""
  }
];