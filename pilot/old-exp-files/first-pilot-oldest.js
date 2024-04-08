/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
TEXT FROM W9 on confederate priming:
-------------------------
This is a version of the code that reads the trial list from a CSV file.

Everything is the same as confederate_priming.js, except towards the end where 
we introduce some code to read from CSV.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

var jsPsych = initJsPsych({
    // just to see that the ID is in the data
    on_finish: function () { jsPsych.data.displayData("csv"); }
});

/******************************************************************************/
/*** Maintaining a list of images to preload **********************************/
/******************************************************************************/

var images_to_preload = [];
// starting with an empty list

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

//ADD CODE HERE, likely from W9 confederate priming

/******************************************************************************/
/*** Example code from Alisdair for filtering *********************************/
/******************************************************************************/

test_data = [
    { a: 1, b: "carrot", c: "veg" },
    { a: 2, b: "apple", c: "fruit" } 
    ]
    Array [ {…}, {…} ] // think this was just showing what test_data would look like?
    test_data.filter(function (row) { return row.c == "veg"; })

// old attempt at using this (works, but not the best I think so went with another method)

// filters for all stims that are of content type arc, then can pick one of those randomly
test = test_csv_stims.filter(function (row) { return row.content_type == "arc"; }) //this needs to be an exact match (i.e. won't choose anything containing that string)
console.log(test)

var target_prompt = 
jsPsych.randomization.sampleWithoutReplacement(test, 1);
console.log(target_prompt)

// ofc, this now needs to specify the content type when filtering, which ideally we wouldn't - that would also be random... 
//instead went with method 2, which is completely random (including no control of even number of trials, I suppose)

/******************************************************************************/
/*** Old code for generating a number 0-3 as a function ************************/
/******************************************************************************/

// not sure it's useful, but keeping here in case it's better to do it like this in the trial making function (would call
// this function inside trial making function, like in W9 make_picture_description_trial function)

// function that randomly picks a number 1-3 so can randomly select a scene index (since these are uniquely named)
function random_scene() {
    return 1+(Math.floor(Math.random() * 3)) // start with 1, add generated random number between 0 (inclusive) and 1 (exclusive), 
    // multiply by 3, and round up to whole number
  } 

var target_scene_index = random_scene();
console.log(target_scene_index) 

/******************************************************************************/
/*** Trials to demonstrate how the plugin works *******************************/
/******************************************************************************/

var true_false = {
    type: jsPsychImageArrayMultiChoice,
    images: ["pilot_arc_scenes/arc-1-ft-1.jpeg","pilot_arc_scenes/arc-2-tf-3.jpeg","pilot_arc_scenes/arc-3-tt-1.jpeg","pilot_arc_scenes/arc-1-ff-2.jpeg"],
    preamble: "What can you tell me about the shapes?",  // leaving this empty will not put anything there, so the prompt "jumps up" to fill this line instead
    prompt: "The circle, which is blue, is right of the triangle",
    options: [
        {name: "true", text: "True"},
        {name: "false", text: "False"}
    ],
    highlighted_image_index: 0 
    // the green box around the image is done in the css file (edit the appearance there if needed)
    // NOTE: if you put a number outside the range of 0-3, it won't give you an error message,
    // but just run the trial without a green square
    // leaving blank leads to an error, putting "" defaults to 0, so need to be commented out or removed
}

// impl_scalar 
var probability1 = {
    type: jsPsychImageArrayMultiChoice,
    images: ["Cat2.jpg","Cat1.jpg","Dog3.jpg","Dog1.jpg"],
    preamble: "<em>One card is picked at random.</em>", // emphasis tags add italics, may want a space between 
    prompt: "Some of the squares are purple", // <p></p> would put this with a blank line above and under
    options: [
        {name: "0", text: "No chance at all"},
        {name: "25", text: "1 out of 4"},
        {name: "50", text: "2 out of 4"},
        {name: "100", text: "100% chance (certainty)"}
    ],
}

/******************************************************************************/
/*** True/false trials; some ideas and tests ********************************************************/
/******************************************************************************/

/* Steps:
1. select a random number of trials to make of each content type (ps existence, ps uniqueness, appositive)
2. make the total number of trials always add up to e.g. 10 (for now, can change)
3. select status combination for secondary and primary content (T+T, T+F, F+T, or F+F)  
    .. can this be completely random or do we need to make sure this adds up to an equal number in the end?
    .. and would this be what conditions the highlighted image, or are we making each trial so any of the four images would 
    satisfy the status? Not sure that would make sense to do - surely we just want the remaining 3 images to be random
4. select images based on content status 
*/

// when building trials, idea would be to shuffle the images outside of the trial
// and also randomly pick a number from 0-3 to input to the highlighted image index for relevant conditions (i.e. not prob)
// OBS: currently response is not required, will have to change that

// Random selection of target content status 
/* if I make it a function, would that mean I can call that inside the trial making function so it will be generated
// anew every time a trial is made?
function random_content_status() {
    return 1800 + Math.floor(Math.random() * 1200);
  }
*/

// NOTE this content status only applies to true/false trials
// make array with all possible content statuses
var content_statuses = ["tt","tf","ft","ff"];
// randomly select one of them to be the target content status in a trial
var target_content_status = 
jsPsych.randomization.sampleWithoutReplacement(content_statuses, 1);
console.log(target_content_status)

// OLD TEST SCENES
// these will be read from csv, only doing this here for now while working on the trial building function
var scenes = [
    "arc-1-tt-1", "arc-1-tt-2", "arc-1-tt-3",
    "arc-1-tf-1", "arc-1-tf-2", "arc-1-tf-3",
    "arc-1-ft-1", "arc-1-ft-2", "arc-1-ft-3",
    "arc-1-ff-1", "arc-1-ff-2", "arc-1-ff-3",
    "arc-2-tt-1", "arc-2-tt-2", "arc-2-tt-3",
    "arc-2-tf-1", "arc-2-tf-2", "arc-2-tf-3",
    "arc-2-ft-1", "arc-2-ft-2", "arc-2-ft-3",
    "arc-2-ff-1", "arc-2-ff-2", "arc-2-ff-3",
    "arc-3-tt-1", "arc-3-tt-2", "arc-3-tt-3",
    "arc-3-tf-1", "arc-3-tf-2", "arc-3-tf-3",
    "arc-3-ft-1", "arc-3-ft-2", "arc-3-ft-3",
    "arc-3-ff-1", "arc-3-ff-2", "arc-3-ff-3"
]

// select target scene
var target_scene = ["pilot_arc_scenes/arc-1-ft-1.jpeg"] // this will be conditoned by target_content_status
/* try:
1. make an array that will select from only those images that are tagged with the target content status
2. then randomly select one of those image files as the target scene 
*/

// one method:
//var textToSearch = 'bedroom';
/*var target_scene = scenes.filter((str)=>{
  return indexOf(target_content_status) >= 0; 
});
console.log(target_scene)
Didn't work: indexOf not defined */

// alternative method:
/*var PATTERN = target_content_status,
    filtered = scenes.filter(function (str) { return PATTERN.test(str); });
console.log(PATTERN)*/

// select filler scenes
var filler_scenes = ["pilot_arc_scenes/arc-2-tf-3.jpeg","pilot_arc_scenes/arc-3-tt-1.jpeg","pilot_arc_scenes/arc-1-ff-2.jpeg"]
// may want this to not have the same content status as the target scene

var selected_scenes = [].concat(target_scene, filler_scenes)
console.log(selected_scenes)
// storing the selected images which is conditioned by additional content status 
// may want to shuffle them here before passing to the trial function

/// starting to play with a function to build the trials
function make_truefalse_trial(scenes, QUD, prompt, highlighted_image_index){ // not sure what to set as parameteres it takes
    // may need to do something here to split them into individual strings again before pushing them to preload list?
    // adapted code from w6 that might do that (not tested)
   /* var scenes_as_list = selected_scenes.split(","); //split the list of images at spaces or commas? currently commas
    var scenes_as_stimulus_sequence = []; //empty stimulus sequence to start
    for (var scene of scenes_as_list) {
      //for each image in images_as_list
      scenes_as_stimulus_sequence.push({ stimulus: scene }); //add that image to images_as_stimulus_sequence in the required format
    } 
    // in week 6 images_as_stimulus_sequence (equivalent) is then used as the timeline inside the self-paced reading trial..
    //add images to the preload list
    images_to_preload.push(scenes_as_stimulus_sequence);

// NOTE may be better to shuffle when choosing the images outside of the trial?

// alternative method
    var shuffled_images = jsPsych.randomization.shuffle([
        image1, 
        image2, 
        image3, 
        image4,
    ])*/

// the actual trial creation
    var truefalse_trial = {
        type: jsPsychImageArrayMultiChoice,
        images: selected_scenes, // this works! though ofc not automatically selected yet
        preamble: "QUD", 
        prompt: "The triangle is green too",
        options: [
            {name: "true", text: "True"},
            {name: "false", text: "False"}
        ],
        highlighted_image_index: 1 
    }

   // var full_trial = { timeline: [waiting_for_partner, selection_trial] };
    return truefalse_trial;
}; // end of function

var truefalse1 = make_truefalse_trial(
    "Which events was the reporter describing with great haste?",
    "Did the reporter see what happened?"
  );

var next_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 'Im the next trial!',
    choices: ["Correct answer", "Wrong answer"]
}

jsPsych.run([true_false, truefalse1, next_trial]);

//probability1,