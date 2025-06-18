var jsPsych = initJsPsych({
    on_finish: function () { jsPsych.data.displayData("csv"); }
});

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
  // if the response format is radio, set these values for each of the conditions:
  // (note that likelihood is not included here as we are not doing binary likelihood trials) 
  if (responseformat_assignment == "radio") { 
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

if (responseformat_assignment == "radio") {
    plugin_type = jsPsychImageArrayMultiChoice; } 
else { 
    plugin_type = jsPsychImageArraySliderResponse; }
console.log(plugin_type);  

if (responseformat_assignment == "radio") {
    if (target == "target-A") {
    correct_answer = "true"; 
    } else if (target == "target-B") {
      correct_answer = "true";
    } else if (target == "target-C") {
      correct_answer = "false"; 
    }
  } else if (responseformat_assignment == "slider") { 
    if (target == "target-A") {
      correct_answer = {from: 80, to: 100};  
      } else if (target == "target-B") {
        correct_answer = {from: 40, to: 60};
      } else if (target == "target-C") {
        correct_answer = {from: 0, to: 20};
      }
  }
console.log(correct_answer);

function make_training_trial(correct_answer){
    var trial = {
        type: plugin_type,
        images: jsPsych.randomization.shuffle(
            ["pilot_scenes/training_stims/blue-triangle-1.jpg",
            "pilot_scenes/training_stims/blue-triangle-2.jpg", 
            "pilot_scenes/training_stims/blue-triangle-3.jpg", 
            "pilot_scenes/training_stims/blue-triangle-4.jpg"]), 
        preamble: instruction, // this is set, so okay as is 
        prompt: "Pick a card. Any card", // will also be different; want to just loop through a list, perhaps? or specify in function input
        options: response_options, // this is set, so okay as is 
        highlighted_image_index: jsPsych.randomization.randomInt(0,4) // this will depend on target, like in test

        //at the start of the trial, make a note of all relevant info to be saved
      /*  on_start: function (trial) { // NOTE: in main exp, the text in brackets matches name of the variable ("radio_training_trial")
        // but want to test whether that is necessary or can just have it sat "trial" as Maisy has had it
            trial.data = { // same here, this before said "radio_training_trial.data"
                condition: condition_assignment,
                response_format: "radio",
                target_truth_value: target_truth_value, 
                target_content_type: target_content_type, 
                linguistic_prompt: target_stim.prompt, 
                target_image: target_image_filename,
                //filler_images_truth_values: currently this info is only in the filename, so not sure how best to access this! 
                //could be done from the csv in data processing, although tidiest if it's already saved in csv perhaps?
                images_in_order: selected_scenes, // saves the filenames in the order they were presented in a trial, i.e. the shuffled order
                };
            },
      //  on_finish: function (data) {
        //    save_pragdep_data_line(data); //save the trial data
            // add code here to store the most recent response, so that can be checked and used for feedback!*/
        };
console.log(trial);
return trial;
};

var target = "target-B"

// FAILED attempt at looping; doesn't like the "filler_'" on line 99
var filler_filenames = []
var fillers = [filler_1, filler_2, filler_3];
for (var filler of fillers) { 
    filler_filename = "pilot_scenes/".concat(filler,".jpg"); 
    filler_filenames.push(filler_filename);
}

console.log(filler_filenames);

var test_trial = make_training_trial("target-B");
var test_trial2 = make_training_trial("target-A");
var test_trial3 = make_training_trial("target-C");

var full_timeline = [].concat(test_trial, test_trial2, test_trial3);

jsPsych.run(full_timeline);