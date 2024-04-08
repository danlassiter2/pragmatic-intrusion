/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
- reads from csv, mention what the csv looks like and what the structure is 
when imported?
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
/*** True/false trials ********************************************************/
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

// make array with all possible content statuses
var truth_values = ["tt","tf","ft","ff"];
// randomly select one of them to be the target content status in a trial
var target_truth_value = 
jsPsych.randomization.sampleWithoutReplacement(truth_values, 1); // sample without replacement not strictly needed but same length for the alternative anyway
console.log(target_truth_value)
// NOTE Will we need to use on_finish here to access the selected content status later, when specifying data to save?

// pretend relevant csv info about stims has been read in 
test_csv_stims = [
    { 
        content_type: "arc", 
        prompt: "The circle, which is blue, is right of the triangle", 
        prompt_name: "arc-1", 
    },
    { 
        content_type: "arc", 
        prompt: "The square, which is orange, is left of the circle", 
        prompt_name: "arc-2", 
    },
    { 
        content_type: "arc", 
        prompt: "The triangle, which is left of the square, is yellow", 
        prompt_name: "arc-3", 
    },
]

// randomly select a target prompt
var target_stim = 
jsPsych.randomization.sampleWithoutReplacement(test_csv_stims, 1)[0]; 
// sample returns a list (in this case of length 1), so the [0] just picks the first element in the list so it's not a list later,  
// making it easier to refer to, e.g. below when using target_stim.prompt_name (i.e. no need to use [0] there)
console.log(target_stim);

// access the prompt name to be used for filename
console.log(target_stim.prompt_name); 
// returns e.g. "arc-3", so works!
var target_prompt_name = target_stim.prompt_name;
// NOTE! only assign to a variable (i.e. give it a name) if I need to refer to it more than once or twice. otherwise no point
// so MAY REMOVE THIS variable assignment --- UNLESS we need to have it stored for saving that data on finish

// randomly pick a number 1-3 to use as target scene index (since scenes are uniquely named)
var target_scene_index = 1+(Math.floor(Math.random() * 3));
// start with 1, add generated random number between 0 (inclusive) and 1 (exclusive), multiply by 3, round up to whole number

// build target scene/image filename
// note: when concatenating, the first thing you concatenate has to be a string, otherwise doesn't work. Shouldn't be an issue for 
// building the scene fil name, since the first thing is e.g. "pilot_arc_scenes/", but keep in mind 
// ex: text1.toString().concat(text1, text2, text3);
var target_image_filename = "pilot_arc_scenes/".concat(target_prompt_name,"-",target_truth_value,"-",target_scene_index,".jpeg");
console.log(target_image_filename)
// NOTE target_prompt_name could just be target_stim.prompt_name, if no need to store in a variable (but may need to for accessing and 
// saving data on finish, so HAVE A THINK)
// IDEA: use on_finish to add some marker that this is the target, which can then be accessed later to tell the plugin which scene to
// highlight?

/* ALTERNATIVE METHOD 
Would be to use the same random number between 1 and 3 to also generate the prompt name.
(see also notes on ONeNote, this combined with tuples might be easier code)
CHALLENGE: don't know how to keep track of what the prompt is with this method. May be that there is a way. Have a think.

*/ 
// TO DO: randomise filler scene selection (done in newer version)
// select filler scenes
var filler_scenes = ["pilot_arc_scenes/arc-2-tf-3.jpeg","pilot_arc_scenes/arc-3-tt-1.jpeg","pilot_arc_scenes/arc-1-ff-2.jpeg"]
// may want this to not have the same content status as the target scene?

// put all the scenes together 
var selected_scenes_unshuffled = [].concat(target_image_filename, filler_scenes) 
console.log(selected_scenes_unshuffled)
// shuffle the selected scenes before passing to the trial plugin 
var selected_scenes = jsPsych.randomization.shuffle(selected_scenes_unshuffled);
console.log(selected_scenes)
console.log(selected_scenes.indexOf(target_image_filename)) // gets index of target image in the array of selected scenes:

/******************************************************************************/
/*** Testing that all these variables can be passed to plugin *****************/
/******************************************************************************/
var truefalse_trial = {
    type: jsPsychImageArrayMultiChoice,
    images: selected_scenes, // this works -- just need to randomise selection of filler scenes 
    preamble: "", 
    prompt: target_stim.prompt,
    options: [  
        {name: "true", text: "True"},
        {name: "false", text: "False"}
    ],
    highlighted_image_index: selected_scenes.indexOf(target_image_filename) 
}
// NOTE: response options are currently manually specified. Ideally, we'd have a trial building function that gets the labels (t/f,
// acceptable/unacceptable, likely/unlikey etc) from the stim list and dynamically changes depending on condition (highest level of ppt
// assignment))

// QUD: Not sure how to represent this in the stim list. Might need to build dynamically, like the target scene filename, or would have to 
// write out the full text for the three possible QUDs conditioned on the prompt, then choose randomly between them

/// starting to play with a function to build the trials

//function make_truefalse_trial(scenes, QUD, prompt, highlighted_image_index){ // not sure what to set as parameters it takes
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

/*
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
*/

var next_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 'Im the next trial!',
    choices: ["Correct answer", "Wrong answer"]
}

jsPsych.run([truefalse_trial, true_false, next_trial]);
//probability1,