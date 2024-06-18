
var jsPsych = initJsPsych({
  // just to see that the ID is in the data
  on_finish: function () { jsPsych.data.displayData("csv"); }
});

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
// if the response format is radio, set these values for each of the conditions:
// (note that likelihood is not included here as we are not doing binary likelihood trials) 
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
/*** Training block ***********************************************************/
/******************************************************************************/

// training trial with correct and incorrect feedback and which lets the participant loop until they get it right
/*
How this function works:
- first, there's a subtrial that puts together the trial and has some parameters set by the condition assignment
and response format assigment (as for the test trials)
- then there's a subtrial which provides the "incorrect!" feedback. This just repeats the trial but changes the prompt
to tell the participant it was incorrect
    - note: Maisy's code has some bits that checks the previous trials for choices and buttons; I may use this too, but not
      sure it needs to be that fancy
- then after that comes a conditional trial/node, which says to run the "incorrect feedback" trial only if the response in the 
previous trial (ie the test trial) was incorrect 
    - note: code says, "if last_trial_correct = "return false", then for this conditional function, return true; else if 
    last_trial_correct = "return true", for this function return false". I.e. if the previous response was false ("correct" is
    stored as "false"), then don't run this conditional function, i.e. don't give the "inccorect" feedback.
    - Maisy said that flipping it might make more sense, i.e. to have it say, if last trial correct=true, don't run this function
- then there is a looping trial, which is what will determine whether the conditional trial will run at all, because this looping
trial is put in the main timeline for this function at the end (see below). The looping trial checks the response of the test trial
in the same way the conditional node does (if response was not correct, evaulate function to true i.e. run this function). So when
a response is incorrect, the loop trial says to run the conditional trial, which says to run incorrect feedback trial, which again is
the same as the test trial but says in the prompt that the response was incorrect. This incorrect feedback trial stores the new 
response, as before, and since we are now in the loop the loop function keeps running the conditional node function which keeps running
the incorrect feedback trial until correct response.
    - at that point, the main timeline at the end of the top level function says the next element is the correct feedback trial
- after this comes the correct feedback trial, which is the same as training trial again but with "Correct" added to the prompt
    - I'll have to play around with how this shows, may well be able to use the same strategy but there is a risk of things jumping 
    around in annoying way, so may have to add some blank space to the initial training trial to prevent that
- then at the very end (as mentioned above) the main timeline is returned, which has the training trial, the loop (which will decide
whether anything happens at this point or you just move on), then the "correct feedback" trial). Then I guess there is another timeline
outwith this functiont that determines how many times to run the whole training trial building function

Potential issues:
- since I have a if/else statement deciding which trial to run, I may not be able ro repeate what Maisy has done without making a very 
long piece of code... if there is a way to return the last variable and amend it, that's great, otherwise I'll have to reapeat the entire
block of code with the if/else 
  - another idea; would there be less repition if I did a conditional timeline thing?
  - idea from Maisy: try to have the type be an argument of the function?? Most likely will be the same issue as when I tried doing
  function()if else as the parameter, but worth a try! 
  NOTE: seems to work to have type be dynamic now! So try to implement that for the training block
*/


function make_training_trial(response_format, plugin_type){

  // a subtrial that builds the test trial
  if (responseformat_assignment== "radio") {
      // make trials using custom radio button plugin
      var radio_training_trial = {
          type: jsPsychImageArrayMultiChoice,
          images: selected_scenes, // how scenes are selected will be different from the below
          preamble: instruction, // this is set, so okay as is 
          prompt: target_stim.prompt, // will also be different; want to just loop through a list, perhaps? or specify in function input
          options: response_options, // this is set, so okay as is 
          highlighted_image_index: index, // this will depend on target, like in test

          //at the start of the trial, make a note of all relevant info to be saved
          on_start: function (trial) { // NOTE: in main exp, the text in brackets matches name of the variable ("radio_training_trial")
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
          on_finish: function (data) {
              save_pragdep_data_line(data); //save the trial data
              // add code here to store the most recent response, so that can be checked and used for feedback!
          },
      };
      return radio_training_trial;
  } else { 
      // else make trials using custom slider plugin
      var slider_training_trial = {
          type: jsPsychImageArraySliderResponse,
          images: selected_scenes,
          preamble: instruction,
          prompt: target_stim.prompt,
          labels: response_options,
          highlighted_image_index: index,
         // slider_width: // can set this in pixels

          //at the start of the trial, make a note of all relevant info to be saved
          on_start: function (slider_training_trial) {
              slider_training_trial.data = {
                  condition: condition_assignment,
                  response_format: "slider",
                  target_truth_value: target_truth_value, 
                  target_content_type: target_content_type, 
                  linguistic_prompt: target_stim.prompt, 
                  target_image: target_image_filename,
                  //filler_images_truth_values: currently this info is only in the filename, so not sure how best to access this! 
                  //could be done from the csv during data processing, although tidiest if it's already saved in csv perhaps?
                  images_in_order: selected_scenes, // saves the filenames in the order they were presented in a trial, i.e. the shuffled order
                  };
              },
          on_finish: function (data) {
              save_pragdep_data_line(data); //save the trial data
          },
      };
      return slider_training_trial;
  }
}

// builds a test trial
function make_test_trial(image,prompt,buttons,correct_answer,fb_image){
 
    // a subtrial that builds the test
    var test = {type:jsPsychImageButtonResponsePromptabovestimulus,
                stimulus:'images/' + image + '.png',
                stimulus_height: 500,
                prompt: '<p style=font-size:20pt>' + prompt,
                choices: [],
                button_html: '<button class="jspsych-btn"> <img src="images/%choice%_button.png" width=100 height=auto></button>',
   
                on_start:
                function (trial) {
                  var shuffled_labels = jsPsych.randomization.shuffle(buttons);
                  trial.choices = shuffled_labels;
                  trial.data = {choices: shuffled_labels,
                    task: 'familiarisation',
                    block: '0',
                    greetee: 'na',
                    label: 'na',
                    target: correct_answer,
                    score: 'na',
                    block_score: 'na',
                    relationship: 'na'}},
   
                on_finish: function(data) {
                  choices = data.choices
                  data.target_position = choices.indexOf(correct_answer)
                  data.chosen_position = data.response
                  data.choice = choices[data.response]
                  if(data.choice === correct_answer){data.correct = true}
                  else {data.correct = false}
                  save_data_line(data)
                  }
                }
   
    // a subtrial that appears if the participant chooses the wrong character
    var incorrect_feedback = {
                    type:jsPsychImageButtonResponsePromptabovestimulus,
                    stimulus: 'images/' + image + '.png',
                    stimulus_height: 500,
                    prompt: '<p style=font-size:20pt>' + "<b style=color:red>Incorrect! Try again.</b>" + "<p style=font-size:20pt>" + prompt,
                    choices: function(){
                      var last_trial = jsPsych.data.get().last(1).values()[0]
                      var choices = last_trial.choices
                      return choices},
                    button_html: function() {
                      var last_trial = jsPsych.data.get().last(1).values()[0]
                      var button_html = []
                      for (var i=0;i<choices.length;i++) {
                        button_html.push('<button class="jspsych-btn"> <img src="images/%choice%_button.png" width=100 height=auto></button>')
                      }
                      if(last_trial.correct === false) {
                        button_html[last_trial.chosen_position] = '<button class="jspsych-btn" style = "border-color: red; border-width:5px"><img src = "images/%choice%_button.png" width=100 height=auto></button>'
                        return button_html
                      } else {
                        return button_html
                      }},
                    data: {
                      },
                    on_start: function(trial){
                      trial.data = {choices:trial.choices,
                        task: 'familiarisation-repeat',
                        block: '0',
                        greeter: 'na',
                        greetee: 'na',
                        label: 'na',
                        target: correct_answer,
                        score: 'na',
                        block_score: 'na',
                       relationship: 'na'}
                    },
                    on_finish: function(data){
                        choices = data.choices
                        data.target_position = choices.indexOf(correct_answer),
                        data.chosen_position = data.response
                        data.choice = data.choices[data.response]
                        if(data.choice === correct_answer){data.correct = true}
                        else {data.correct = false}
                        save_data_line(data)
                    }
                  }
   
    // only show incorrect feedback if the most recent trial was answered incorrectly
    var conditional_node = {
        timeline:[incorrect_feedback],
        conditional_function: function(){
            var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct // gets what data.correct was stored as 
            if(last_trial_correct){return false} else {return true} // the conditional function evaluates to TRUE if data.correct 
            // was stored as FALSE (reads: "if last_trial_correct = return false, then (for this function) return true; else if
            // last_trial_correct = return true, for this function return false")
        }}
   
    // show incorrect feedback as many times as the participant chooses the wrong answer
    var trial = {timeline: [conditional_node], // change name of this variable to make more sense to me! E.g. "loop" or "loop function"
        loop_function: function(data){
        var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
        if(last_trial_correct){return false}
        else {return true}}}
   
    // a subtrial that shows correct feedback (ie if the participant got the answer right)
    var correct_feedback = {type:jsPsychImageButtonResponsePromptabovestimulus,
            stimulus: 'images/' + fb_image + '.png',
            stimulus_height: 500,
            choices: function(){
              var last_trial = jsPsych.data.get().last(1).values()[0]
              var choices = last_trial.choices
              return choices},
            trial_duration: 3000,
            button_html: function() {
              var last_trial = jsPsych.data.get().last(1).values()[0]
              var button_html = []
              for (var i=0;i<choices.length;i++) {
                button_html.push('<button disabled class="jspsych-btn"> <img src="images/%choice%_button.png" width=100 height=auto></button>')
              }
              if(last_trial.correct) {
                button_html[last_trial.chosen_position] = '<button disabled class="jspsych-btn" style = "border-color: green; border-width:5px"><img src = "images/%choice%_button.png"; width=100; height=auto></button>'
                return button_html
              }},
            on_start: function(trial){
              trial.data = {choices: trial.choices}},
            on_finish: function(data){
              data.chosen_position = data.response
              choices = data.choices
              data.choice = choices[data.response]
              if(data.choice === correct_answer){data.correct = true}
              else {data.correct = false}
              // save_data_line(data)
            },
            prompt: '<p style=font-size:20pt>' + "<b style=color:forestgreen>Correct!"}
    var test_timeline = {timeline:[test,trial,correct_feedback]}
    return test_timeline
  }

