/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
If doing read from csv, add info about this, e.g. mention what the structure of 
the csv is and what the structure of the read-in data is (i.e. when imported)

For pilot, as it is fairly manual with current approach, we are doing only 
one prompt per content type and two scenes (i.e. images) for now

TO DO:
- integrate with Prolific so get their Prolific ID? Or generate random ID/ask for
their participant id at the start of the experiment
- add code to save data trial by trial and check that it saves everything we need
    - prompt (i.e. linguistic stimuli)
    - target truth value
    - images filenames?
    - response option name of button (rather than just index)? Order is static atm
    so doesn't make a difference but may be good to have anyway
    - particpant id? If randomly generated, see conf.priming OELS
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
// we change to load stims from csv, this needs editing; see 
// conferedate_priming_readfromcsv.js to for how it was done there 

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

/*
This is the save_data function provided in Alisdair's tutorial, section 06.
*/

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

/*
This code will save data from critical trials line by line. 

Note that data is saved to a file named pragdep_ID.csv, where pragdep stands for 
Pragmatics of dependent measures and ID is the randomly-generated participant ID 
NOTE Last part will change if doing Prolific IDs!
*/
function save_pragdep_data_line(data) {
    // choose the data we want to save - this will also determine the order of the columns (so write_header should match this)
    var data_to_save = [
        participant_id,
        data.condition,
        data.response_format, // slider or radio buttons (this will also be clear from response, ofc)
        data.trial_index,
        data.target_truth_value,
        data.target_content_type,
        data.linguistic_prompt,
        data.target_image,
        ...data.images_in_order, // saves all images in the presented order (0-3). The ... is called spread, is applied within another 
        // array to make them into elements in the top level array (instead of a nested array). Ex: [...[1,2],3]=[1,2,3]. Avoids issue
        // with the quotation loop below, as would otherwise apply "" around the whole array images_in_order (and we want this array 
        // to be split for readability in the csv file later)
        data.response,
        data.time_elapsed,
        data.rt,
        //add lines for demo survey data etc!
    ];

    // add quotation marks around each element that is saved to avoid splitting prompts that have commas
    for (i in data_to_save) {
        data_to_save[i] = "\"" + data_to_save[i] + "\"";
    }

    // join each element in the array with commas and add a new line
    var line = data_to_save.join(",") + "\n"; 
    var this_participant_filename = "pragdep_" + participant_id + ".csv";
    save_data(this_participant_filename, line);
  }

/******************************************************************************/
/*** Fetch the Prolific ID to use in data filename ****************************/
/******************************************************************************/

// just creating random ID for now
var participant_id = jsPsych.randomization.randomID(10);

// Will change to use Prolific ID, see code for this in cond exp on server 

/******************************************************************************/
/*** Condition assignment (between ppts) **************************************/
/******************************************************************************/

// randomly select response format (radio buttons or slider) at start of experiment
var responseformat_assignment = jsPsych.randomization.sampleWithoutReplacement(
    ["radio", "slider"], 1)[0];
console.log(responseformat_assignment);

// pick a random condition
// Note that if radio is chosen above, it only chooses between acceptability and truth 
// (not likelihood, as that's too unnatural and likely won't provide interesting data)
if (responseformat_assignment== "radio") { 
    var condition_assignment = 
        jsPsych.randomization.sampleWithoutReplacement(["truth", "acceptability"], 1)[0];
} else {
    var condition_assignment = 
        jsPsych.randomization.sampleWithoutReplacement(["truth", "acceptability", "likelihood"], 1)[0];
}
console.log(condition_assignment);

// Set the text and names for the response options and the instructions in a trial based on
// response format and condition assignment determined above (to pass to trial building function).
// if the response format is radio, set these values: 
if (responseformat_assignment== "radio") { 
    if (condition_assignment == "truth") {
        response_options = [  
            {name: "truth", text: "True"}, 
            {name: "truth", text: "False"}
            ];
        instruction = "<p><em>For the highlighted card, is the following description true?</em></p>";
        } else {
        response_options = [  
            {name: "acceptability", text: "Acceptable"},
            {name: "acceptability", text: "Unacceptable"}
            ];
        instruction = "<p><em>For the highlighted card, is the following description acceptable?</em></p>";
        }
// or else, the response format is slider, and these values are chosen:
} else { 
    if (condition_assignment == "truth") {
        response_options = ["Completely false", "Completely true"];
        instruction = "<p><em>For the highlighted card, how true is the following description?</em></p>";
        } else if (condition_assignment == "acceptability") {
        response_options = ["Completely unacceptable", "Completely acceptable"];
        instruction = "<p><em>For the highlighted card, how acceptable is the following description?</em></p>";
        } else if (condition_assignment == "likelihood") {
        response_options = ["Completely impossible", "Completely certain"];
        instruction = "<p><em>One card is picked at random. How likely is the following description to be true?</em></p>";
        }
}
console.log(response_options);

/******************************************************************************/
/*** Creating the trials ******************************************************/
/******************************************************************************/

/* Steps:
ADD LIST HERE to explain what the code does (short summary), or have this in the preamble
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

/*
CURRENT METHOD (15 Apr): since we want 5 of each content type and 30 trials in total, we first make an array of the 6 content 
types and repeat 5 times with shuffling. Then we create the trial building function, then loop through the content types array 
to input each of those content types in turn and thereby build the individual trials. Since the content types array is shuffled 
when created, we don't need to randomise the order of the trials when the loop is finished, we can simply send that list 
of trials to the timeline as is. 

The trial building function chooses the set of images to be used in any one trial to be of the same content type. This is so
that we have control of the truth value for each of the filler images (relevant for probability trials) and not just the target
image, as it means that the image names for fillers will indeed be correct for that combination of content type and prompt (it 
also means that there is a decent chance some of the images will be the same in any given trial). 

Note: at current there is only one prompt per content type, so may need to make some edits if adding more later. Note also that
the current approach for fillers where they are chosen from the pool of images that have the same content type as
the target, in practice means that it is chosing from all images with that content type at since there are only 4 images per 
content type + prompt at the moment. However, the code is written so that it can choose from a larger pool, if we decide to add
more images per contcontent type + prompt combination later.
*/

// create array with n repetitions of each of the 6 content types in random order - this will determine the order in which 
// the trials will be built and thereby presented (i.e. the ranomdisation of trial order happens already here)
// this way can easily adjust number of total trials up or down (and keep number of each content type the same across types)
var target_content_types = jsPsych.randomization.repeat(["con", "arc", "ana", "def_ex", "def_un", "only"], 2); // only doing 2 now while testing the save function
console.log(target_content_types);

// function to create the trials
function make_trial(target_content_type) {
    // make array with all possible truth value combinations
    var truth_values = ["tt","tf","ft","ff"];
    // randomly select one of them to be the target truth value in a trial
    var target_truth_value = 
    jsPsych.randomization.sampleWithoutReplacement(truth_values, 1);
    console.log(target_truth_value);
    // NOTE May need to use on_finish here to access the selected truth value later, when specifying data to save 

    // set trial stims to be determined by what is input as the target content type when trial building function
    // is called below 
    var trial_stims_pool = test_csv_stims.filter(function(row) {return row.content_type == target_content_type;});
    console.log(trial_stims_pool);
    
    // out of this pool of stims that all have the target content type, randomly choose 4 with replacement to 
    // populate a trial
    // NOTE At current (23 May), there are 8 images per prompt and content type (i.e. 2 unique images per prompt, 
    // repeated 4 times for each of the possible truth status combinations)
    var trial_stims = jsPsych.randomization.sampleWithReplacement(trial_stims_pool, 4); 
    console.log(trial_stims);
    
    // of these, pick first element to be the target (relevant for non-probability trials, makes no difference for rest)
    var target_stim = trial_stims[0]; 

    // build target scene/image filename
    var target_prompt_name = target_stim.prompt_name;
    // MAY REMOVE THIS variable assignment --- UNLESS it's needed for saving that data on finish
    console.log(target_prompt_name);

    // NOTE: since there are two possible (uniquely named) scenes that can satisfy a 
    // given truth value and prompt combination, the image filename is set to
    // randomly pick a number 1-2 for the scene index and include that n the filename
    // var target_scene_index = 1+(Math.floor(Math.random() * 2));
    // start with 1, add generated random number between 0 (inclusive) and 2 (exclusive), multiply by 3, round up to whole number

    var target_image_filename = "pilot_scenes/".concat(target_prompt_name,"-",target_truth_value,"-",1+(Math.floor(Math.random() * 2)),".jpg");
    console.log(target_image_filename);
    // NOTE target_prompt_name could just be target_stim.prompt_name, if no need to store in a variable (see above)

    // add filename to the list of images to preload
    images_to_preload.push(target_image_filename);
    
    // build filler scenes filenames from the remaining stims in trial stims (i.e. that have the same content type as target)
    var filler_image_filenames = []
    for (var i=1; i<4; i++) { 
        filler_stim = trial_stims[i];
        filler_image_filename = "pilot_scenes/".concat(
            filler_stim.prompt_name,
            "-",
            jsPsych.randomization.sampleWithoutReplacement(truth_values, 1), // randomly samples truth value 
            "-",
            1+(Math.floor(Math.random() * 2)), // randomly selects scene index (1 or 2)
            ".jpg"
        ); 
        // IDEA if need to store filler image truth values, may be able to log it here? Can use console log and store in an object, or 
        // do the randomisation and store in an object before putting together the filename
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

    // set the highlighted image index and preamble dependening on condition assignment 
    if (condition_assignment == "likelihood") {
        index = 4; // as images are 0-3, this makes there be no highlighted image for likelihood trials
       // instruction = "<p><em>One card is picked at random. How likely is the following description to be true?</em></p>"; // reminder to evaluate the sentence with respect to all the images 
    } else {
        index = selected_scenes.indexOf(target_image_filename); // else the highlight is determined by the target image
       // instruction = "<p><em>For the highlighted card, evaluate the following sentence:</em></p>"; // use as reminder to only look at the highlighted image
    } 
 
    // put trial together using either the custom radio button plugin or the custom slider plugin, dependent on response format assignment
    // IDEA can this be even neater by having if/else statement in type? May have to be a function. See W7 if so. Would maybe have to do: 
    /*
    type: [], //(dummy choices initially)
    on_start: function (trial) {
        var shuffled_labels = jsPsych.randomization.shuffle(["buv", "cal"]);
        trial.choices = shuffled_labels;
      }, 
      
      OR can maybe just do
    type: function(){
        if(responseformat_assignment== "radio")){
        return jsPsychImageArrayMultiChoice; // the parameter value has to be returned from the function
        } else {
        return jsPsychImageArraySliderResponse; // the parameter value has to be returned from the function
        }
    }
    UPDATE 12 May: tried the latter, doesn't work and seems it may not be possible to have type be dynamic. Keeping 
    the current method for now, but can keep in mind to look into this later if time (not crucial)
     */ 
    if (responseformat_assignment== "radio") {
        // make trials using custom radio button plugin
        var trial = {
            type: jsPsychImageArrayMultiChoice,
            images: selected_scenes, 
            preamble: instruction, 
            prompt: target_stim.prompt,
            options: response_options,
            highlighted_image_index: index,

            //at the start of the trial, make a note of all relevant info to be saved
            on_start: function (trial) {
                trial.data = {
                    condition: condition_assignment,
                    response_format: "radio",
                    target_truth_value: target_truth_value, // seems to work even when name is the same for both
                    target_content_type: target_content_type, // seems to work even when name is the same for both
                    linguistic_prompt: target_stim.prompt, // this works! Means can remove unnecessary variable assignments above if desired
                    target_image: target_image_filename,
                    //filler_images_truth_values: currently this info is only in the filename, so not sure how best to access this! 
                    //could be done from the csv in data processing, although tidiest if it's already saved in csv perhaps?
                    images_in_order: selected_scenes, // saves the filenames in the order they were presented in a trial, i.e. the shuffled order
                    };
                },
            on_finish: function (data) {
                save_pragdep_data_line(data); //save the trial data
            },
        };
        return trial;
    } else { 
        // else make trials using custom slider plugin
        var slider_trial = {
            type: jsPsychImageArraySliderResponse,
            images: selected_scenes,
            preamble: instruction,
            prompt: target_stim.prompt,
            labels: response_options,
            highlighted_image_index: index,
           // slider_width: // can set this in pixels

            //at the start of the trial, make a note of all relevant info to be saved
            on_start: function (slider_trial) {
                slider_trial.data = {
                    condition: condition_assignment,
                    response_format: "slider",
                    target_truth_value: target_truth_value, // seems to work even when name is the same for both
                    target_content_type: target_content_type, // seems to work even when name is the same for both
                    linguistic_prompt: target_stim.prompt, // this works! Means can remove unnecessary variable assignments above if desired
                    target_image: target_image_filename,
                    //filler_images_truth_values: currently this info is only in the filename, so not sure how best to access this! 
                    //could be done from the csv in data processing, although tidiest if it's already saved in csv perhaps?
                    images_in_order: selected_scenes, // saves the filenames in the order they were presented in a trial, i.e. the shuffled order
                    };
                },
            on_finish: function (data) {
                save_pragdep_data_line(data); //save the trial data
            },
        };
        console.log(slider_trial);
        return slider_trial;
    } 
}

// build the trials according to the array of content types made at start of experiment.
// As this array was randomly shuffled, the randomisation has already happened so this 
// code only loops through that array and pushes each trial into all_trials, which then
// goes in the timeline at the end 
var all_trials = []
for (target_content_type of target_content_types) {
        single_trial = make_trial(target_content_type);
        all_trials.push(single_trial);
}
console.log(all_trials);

// just for having a reference point to check all trials are being shown as expected - REMOVE LATER
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
/*** Write headers for data file **********************************************/
/******************************************************************************/

var write_headers = {
    type: jsPsychCallFunction,
    func: function () {
      var this_participant_filename = "pragdep_" + participant_id + ".csv"; // NOTE May CHANGE participant_id if doing the prolific thing
      //write column headers to pragdep_pilot_data.csv, with quotes around to match code saving line by line 
      save_data(
        this_participant_filename,
        "\"participant_id\",\
        \"condition\",\
        \"response_format\",\
        \"trial_index\",\
        \"target_truth_value\",\
        \"target_content_type\",\
        \"linguistic_prompt\",\
        \"target_image\",\
        \"images_in_presentation_order_0\",\
        \"images_in_presentation_order_1\",\
        \"images_in_presentation_order_2\",\
        \"images_in_presentation_order_3\",\
        \"response\",\
        \"time_elapsed\",\
        \"rt\"\n" 
      );
    },
  };

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
// This text needs to be updated! Will be whatever consent form we have ethics for, I assume
  
var instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Instructions for experiment</h3>\
    <p style='text-align:left'>In this task, we will show you series of a sentence and a set of 4 cards.</p> \
    <p style='text-align:left'> One of the cards will be highlighted with a red dashed line. Your task is to decide whether \
    the sentence you see is true or false for <u>the highlighted card</u> only. \
    <p style='text-align:left'>When you feel ready to start the experiment, click Continue below.</p>",
    choices: ["Continue"],
};

/*
Will need the instruction screen to vary depending on the assigned condition and response format. Can this be done simply 
by adding a dynamic variable in the html? Might have to add some async function though, as I'm not sure the instructions variable
will be able to access the relevant info before the trials are made... Although the relevant info is set early on, so if 
everything is run in order then that may already be available.. test it and see!
 */
  
var final_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Finished!</h3>\
    <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
    code so the participant can claim their payment.</p>\
    <p style='text-align:left'>Click Continue to finish the experiment and see your raw data.</p>",
    choices: ["Finish"],
};

/******************************************************************************/
/*** Feedback and demographics ******************************************************/
/******************************************************************************/

var feedback = {
    type: jsPsychSurveyText,
    preamble: "<p style='text-align:left'> <b>Feedback</b></p>",
    questions: [
      {prompt: 'Do you have any comments about this experiment?', rows: 5, name: 'feedback'}
    ]
  }

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
// Also, may need to make it save the radio buttons in a different way, currently the 
// data just says "On" which is not helpful

/******************************************************************************/
/*** Build the full timeline **************************************************/
/******************************************************************************/

var full_timeline = [].concat(
   // consent_screen,
   // instructions,
    write_headers,
    preload,
    all_trials,
    next_trial,
    feedback,
    demographics_survey,
    final_screen
);

/******************************************************************************/
/*** Run the timeline *********************************************************/
/******************************************************************************/

// this will change if reading from csv, see confederate_priming_readfromcsv.js
// but currently using this method 

jsPsych.run(full_timeline);