/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
If doing read from csv, add info about this, e.g. mention what the structure of 
the csv is and what the structure of the read-in data is (i.e. when imported)

For pilot, as it is fairly manual with current approach, we are doing only 
one prompt per content type and one scene (i.e. image) for now

TO DO:
- integrate with Prolific so get their Prolific ID? Or generate random ID/ask for
their participant id at the start of the experiment
- add code to save data trial by trial and check that it saves everything we need
    - prompt (i.e. linguistic stimuli)
    - target truth value
    - images filenames?
    - response option name of button (rahter than just index)? Order is static atm
    so doesn't make a difference but may be good to have anyway
    - particpant id? If randomly generated, see conf.priming OELS
- figure out how to do between participant allocation (type of dependent measure)
- decide how many trials of each content type (within-pp)
- modify plugin to have response required
...
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

// NOTE: currently doing preloading as is done in conferedate_priming.js, but if
// we change to load stims from csv, see conferedate_priming_readfromcsv.js to 
// see how it was done there 

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

function save_data(name, data_in) {
    var url = "save_data.php";
    var data_to_send = { filename: name, filedata: data_in };
    fetch(url, {
      method: "POST",
      body: JSON.stringify(data_to_send),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  }

// ADD CODE HERE for saving line by line, model off W9 confederate priming but 
// need to decide what structure we want for the data first. 
// Note, conf prim has two types of tasks, we don't so won't need the if/else 
// (see e.g. W8 which has a simpler save data linewise function)
// Note2, conditional exp uses Prolific ID in saving, can probs do the same

/******************************************************************************/
/*** Generate a random participant ID *****************************************/
/******************************************************************************/

//var participant_id = jsPsych.randomization.randomID(10);
// If using; see confederate priming for how to use when saving data etc.
// other option: use Prolific ID fetching from cond code on server (pasted
// code for this in version on the server)

/******************************************************************************/
/*** Condition assignment (between ppts) **************************************/
/******************************************************************************/

// pick a random condition for the participant at start of experiment
var condition_assignment = jsPsych.randomization.sampleWithoutReplacement(
    ['truth', 'acceptability', 'likelihood'], 1)[0];
console.log(condition_assignment);

// draft code to use for setting the response format when building trials. 
// May move to just before trial building function
// use the condition to determine the response options in the trial building function
/*if (condition_assignment == 'likelihood') {
    response_format = slider; // will have to add this parameter to the plugin, if even possible (ask Alisdair)
  } else {
    response_format = radio_buttons;
  }
// based on setting response options below, seems this can be referred to as is and does 
not need to be assigned to a variable 

// also add some code that will specify that if condition_assignment == 'likelihood', then
there should not be any highlighting (ideally will be else, change nothing, i.e. just be 
selected_scenes.indexOf(target_image_filename) as it is set to currently)
   // NOTE: if you set highlighted_image_index number outside the range of 0-3, it won't give you an error message,
    // but just run the trial without a green square - apparently. But NEEDS TESTING
*/

// Set the text and names for the response options in a trial based on condition assignment

if (condition_assignment == 'truth') {
    response_options = [  
        {name: "true", text: "True"},
        {name: "false", text: "False"}
        ];
    } else if (condition_assignment == 'acceptability') {
    response_options = [  
        {name: "acceptable", text: "Acceptable"},
        {name: "unacceptable", text: "Unacceptable"}
        ];
    } else if (condition_assignment == 'likelihood') {
    response_options = [  
        {name: "likely", text: "Likely"},
        {name: "unlikely", text: "Unlikely"}
        ];
    }
console.log(response_options);

/* one way to record the condition assignment in the jsPsych data, see https://www.jspsych.org/7.3/overview/data/
// this adds a property called 'participant' and a property called 'condition' to every trial 
jsPsych.data.addProperties({   
    participant: participant_id,   
    condition: condition_assignment 
});
*/

/******************************************************************************/
/*** Creating the trials ******************************************************/
/******************************************************************************/

/* Steps:
1. select a random number of trials to make of each content type (ps existence, ps uniqueness, appositive, etc)
2. make the total number of trials always add up to e.g. 10?
3. select status combination for secondary and primary content (T+T, T+F, F+T, or F+F)  
    .. can this be completely random or do we need to make sure this adds up to an equal number in the end?
4. select images based on content status 
*/

// pretend the stim_list csv has been read in 
test_csv_stims = [
    { 
        content_type: "con", 
        prompt: "The square is orange and is left of the circle.", 
        prompt_name: "con", 
    },
    { 
        content_type: "arc", 
        prompt: "The circle, which is blue, is right of the triangle.", 
        prompt_name: "arc", 
    },
    { 
        content_type: "ana", 
        prompt: "The triangle is yellow too.", 
        prompt_name: "ana", 
    },
    { 
        content_type: "def_ex", 
        prompt: "The blue circle is next to the triangle.", 
        prompt_name: "def_ex", 
    },
    { 
        content_type: "def_un", 
        prompt: "The circle is left of the triangle.", 
        prompt_name: "def_un", 
    },
    { 
        content_type: "only", 
        prompt: "Only the square is orange.", 
        prompt_name: "only", 
    },
]

// to simulate the target content type selection. As this is happening outside the trial building function, it is of course
// atm just static, so every time the function is called it will set target_content_type to be whatever was picked here. So 
// need to figure out how to make this dynamic (loop?). But at least shows that the function is working as intended!
// Idea: make it pick 10 (with replacement), then when calling the trial building function, make it run until this array is empty
var target_content_type = jsPsych.randomization.sampleWithReplacement(["con", "arc", "ana", "def_ex", "def_un", "only"], 1);
console.log(target_content_type);


function make_trial(target_content_type) {
    // make array with all possible truth value combinations
    var truth_values = ["tt","tf","ft","ff"];
    // randomly select one of them to be the target truth value in a trial
    var target_truth_value = 
    jsPsych.randomization.sampleWithoutReplacement(truth_values, 1);
    console.log(target_truth_value);
    // NOTE May need to use on_finish here to access the selected truth value later, when specifying data to save 

    /* CURRENT APPROACH: start by randomly selecting all the stimuli to be used in a given trial, then out of those pick the first 
    element as the target, and use the three remaining ones to select the images/scenes for fillers. Reduces the risk of having the 
    target image being used as a filler, BUT as it is selecting completely at random there is still a chance that one of the filler
    images might end up being identical to the target, or that filler images end up being identical to each other (since images are 
    now not unique for each content type and truth value combination).

    OBS New method currently being worked on: want trial building function to take content_type as argument. Does atm, but this is
    set outside the function so is currently static and we need it to be dynamic. See Dan's suggestion for how to make it so. 
    Currently have just set filler images to be randomly selected from all of the stims, so does mean there's a decent chance
    one (or more, since images are not unique) of the fillers will be the same as target. Think this chance can be reduced with
    Dan's method of "shaving off" an array - then at least won't have it do exactly the same as target stim?
    */

    // set trial stims to be determined by what is fed in as the target content type in allocation (allocation currently just 
    // simulated, tbc)
    var trial_stims_pool = test_csv_stims.filter(function(row) {return row.content_type == target_content_type;});
    console.log(trial_stims_pool);
    
    // out of this pool of stims that all have the target content type, randomly choose 4 with replacement to populate a trial
    var trial_stims = 
    jsPsych.randomization.sampleWithReplacement(trial_stims_pool, 4); 
    console.log(trial_stims);
    
    // of these, pick first element to be the target (relevant for non-probability trials)
    var target_stim = trial_stims[0]; 

    var target_prompt_name = target_stim.prompt_name;
    // MAY REMOVE THIS variable assignment --- UNLESS it's needed for saving that data on finish
    console.log(target_prompt_name);

    // build target scene/image filename
    var target_image_filename = "pilot_scenes/".concat(target_prompt_name,"-",target_truth_value,".jpeg");
    console.log(target_image_filename);
    // NOTE target_prompt_name could just be target_stim.prompt_name, if no need to store in a variable (see above)

    // add filename to the list of images to preload
    images_to_preload.push(target_image_filename);
    
    // build filler scenes filenames from the remaining stims in trial stims (i.e. with the same content type as target)
    var filler_image_filenames = []
    for (var i=1; i<4; i++) { 
        filler_stim = trial_stims[i];
        filler_image_filename = "pilot_scenes/".concat(filler_stim.prompt_name,"-",jsPsych.randomization.sampleWithoutReplacement(truth_values, 1),".jpeg"); 
        // samples truth value randomly
        filler_image_filenames.push(filler_image_filename);
        // also add to list of images to preload
        images_to_preload.push(filler_image_filename);
    }
    console.log(filler_image_filenames)

    // put all the scenes together 
    var selected_scenes_unshuffled = [].concat(target_image_filename, filler_image_filenames) 
    console.log(selected_scenes_unshuffled)
    // shuffle the selected scenes before passing to the trial plugin 
    var selected_scenes = jsPsych.randomization.shuffle(selected_scenes_unshuffled);
    console.log(selected_scenes)
    console.log(selected_scenes.indexOf(target_image_filename)) // gets index of target image in the array of selected scenes

    // put trial together using the custom plugin
    var trial = {
        type: jsPsychImageArrayMultiChoice,
        images: selected_scenes, 
        preamble: "", // use this as reminder that it is only the image in the green box ppts should evaluate? (only for non-prob trials)
        prompt: target_stim.prompt,
        options: response_options,
        highlighted_image_index: selected_scenes.indexOf(target_image_filename) 
    };
    return trial; 
}

var trials_unshuffled = [
    make_trial(target_content_type),
    make_trial(target_content_type),
    make_trial(target_content_type),
    make_trial(target_content_type),
];

/* 
var trials_unshuffled = []
for 
// may be better as a loop?
if (target_content_type.length == 0) {
    endExperiment(); // or however you're making this happen 
 } else {
    nextStimType = stims.shift();
    nextTrial = trialBuildingFunction(nextStimType);
    .... 

// OR can try the approach from w10, with adding loop_function into the trial building function
 OR as discussed in meeting (and probably simpler than shift method):
 array = [....] (array generated with n content types, totalling to e.g. 30) (and want equal number of each, i.e. 5 in this case)
embed within a loop:
counter = a.length (trial counter is length of array that we have generated
if (counter = 0)[endExperiment]
	else (counter = -1, ... ) (i.e. do the rest of the trial building)
	
	on each trial check if counter = 0, if it does, end exp
otherwise, sample w/o replacement from the array and decrement the counter
)and keep doing that until counter = 0)
*/
var trials_shuffled = jsPsych.randomization.shuffle(trials_unshuffled); 
console.log(trials_shuffled);

/*
Current method (wip): have the trial building function take a parameter that will specify the target content type (i.e. linguistic manipulation)
Make it loop through/conditional until the array at start with target content types is empty, so would be called like 
var arc_trials = make_trial("arc");
var con_trials = make_trial("con");
var def_ex_trials = make_trial("def_ex");
etc
until we tell it to stop

the number of times to call it could be determined by this random array that samples e.g. 10 with replacement, 
or by some pre-defined allocation (perhaps using a method like what Alisdair gave me example of) that says how 
many of each trial type should be made.
or, FOR PILOT, just have it be the same number of trials for each content type and sum to a total of 30 trials 

*/

var next_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 'Im the next trial!',
    choices: ["Correct answer", "Wrong answer"]
}

/******************************************************************************/
/*** Preload ******************************************************************/
/******************************************************************************/

console.log(images_to_preload);

var preload = {
    type: jsPsychPreload,
    auto_preload: true,
    images: images_to_preload,
};

console.log(preload);

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

var consent_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<h3>Welcome to the experiment</h3> \
    <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant \
    what they will be doing, how their data will be used, and how they will be \
    remunerated.</p> \
    <p style='text-align:left'>This is a placeholder for that information.</p>",
    choices: ["Yes, I consent to participate"],
};
  
var instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Instructions for experiment</h3>\
    <p style='text-align:left'>In this task, we will show you series of a sentence and a set of 4 cards.</p> \
    <p style='text-align:left'> One of the cards will be highlighted by a green box. Your task is to decide whether \
    the sentence you see is true or false for <u>the card highlighted in the green box</u> only. \
    <p style='text-align:left'>When you feel ready to start the experiment, click Continue below.</p>",
    choices: ["Continue"],
};
  
var final_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Finished!</h3>\
    <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
    code so the participant can claim their payment.</p>\
    <p style='text-align:left'>Click Continue to finish the experiment and see your raw data.</p>",
    choices: ["Continue"],
};

/******************************************************************************/
/*** Demographics survey ******************************************************/
/******************************************************************************/

var demographics_survey = {
    type: jsPsychSurveyHtmlForm,
    preamble:
      "<p style='text-align:left'> <b>Demographics survey</b></p>\
                <p style='text-align:left'> Finally, we would like to \
                gather some background information about you. This will not be \
                associated with any information that might identify you.</p>", 
    html: "<p style='text-align:left'>What is your date of birth? <br> \
                <input required name='dob' type='date'></p> \
           <p style='text-align:left'>What is your first language?<br> \
                <input required name='first_lang' type='text'></p> \
            <p style='text-align:left'>Was any other language spoken \
             in the home before the age of 6?<br>\
                <input required name='bilingual' type='radio'><label>Yes</label> \
                <input required name='bilingual' type='radio'><label>No</label></p> \
            <p style='text-align:left'>If you responded yes above, \
           which language(s)?<br>\
              <input name='other_lang' type='text'></p>",
  };

// might want to add a check of if "Yes" to bilingual, require final question

/******************************************************************************/
/*** Build the full timeline **************************************************/
/******************************************************************************/

var full_timeline = [].concat(
    //consent_screen,
    //instructions,
    //write_headers, -- for saving data, will add later 
    preload,
    trials_shuffled,
    next_trial,
    demographics_survey,
    final_screen
);

/******************************************************************************/
/*** Run the timeline *********************************************************/
/******************************************************************************/

// this will change if reading from csv, see confederate_priming_readfromcsv.js
// but currently using this method 

jsPsych.run(full_timeline);