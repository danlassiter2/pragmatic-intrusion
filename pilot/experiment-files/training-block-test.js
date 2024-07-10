
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
// or else the response format is slider, and these values are chosen:
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

// store response format as a variable to use dynamically in the trial building function
if (responseformat_assignment == "radio") {
  plugin_type = jsPsychImageArrayMultiChoice; } 
else { 
  plugin_type = jsPsychImageArraySliderResponse; }
console.log(plugin_type); 

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
- since I have a if/else statement deciding which trial to run, I may not be able ro repeat what Maisy has done without making a very 
long piece of code... if there is a way to return the last variable and amend it, that's great, otherwise I'll have to reapeat the entire
block of code with the if/else 
  - another idea; would there be less repition if I did a conditional timeline thing?
  - idea from Maisy: try to have the type be an argument of the function?? Most likely will be the same issue as when I tried doing
  function()if else as the parameter, but worth a try! 
  NOTE: seems to work to have type be dynamic now! So try to implement that for the training block

How to call the function
- will have the same 4 images for each of the 3 training trials, and the order of the trials will be static
- images in a single trial will be shuffled, so can do that in the trial building function
- so just have it loop through the 3 sets of images?
- or call the function 3 times and input a different image set each time?
  -- if so can build the image names in the function
- note that need to keep track of which one is the target image for the binary ones, as this will be the one
that needs to be highlighted for those trials

How to let the function know what the correct answer is...
- will depend on the individual trial and on the response format.
Idea: have if else before function that will determine correct_answer?

// Idea 1: Specify correct answers for both slider and radio in one. Then could check if last response is in correct_answer...?
// Unsure it'll work... 
if (target == "target-A") {
  correct_answer = ["true", 80:100]; // the semicolon is an attempt at defining a range, but looks like it won't work like this
  } else if (target == "target-B") {
    correct_answer = ["true", 40:60];
  } else if (target == "target-C") {
    correct_answer = ["false", 0:20]; 
  }

  // Idea 2: split them up, so depends on response format (longer code but easier to make work?)
if (responseformat_assignment == "radio") {
  if (target == "target-A") {
  correct_answer = "true"; 
  } else if (target == "target-B") {
    correct_answer = "true";
  } else if (target == "target-C") {
    correct_answer = "false"; 
  }
} else (responseformat_assignment == "slider") { 
  if (target == "target-A") {
    correct_answer = 80:100;  // the semicolon is an attempt at defining a range, but looks like it won't work like this
    } else if (target == "target-B") {
      correct_answer = 40:60;
    } else if (target == "target-C") {
      correct_answer = 0:20;
    }
*/

function make_training_trial(prompt, target, filler_1, filler_2, filler_3, correct_answer){

  // build image file paths
  var target_filename = "pilot_scenes/" + target + ".jpg"; 
  var filler_1_filename = "pilot_scenes/training_stims/" + filler_1 + ".jpg";
  var filler_2_filename = "pilot_scenes/training_stims/" + filler_2 + ".jpg";
  var filler_3_filename = "pilot_scenes/training_stims/" + filler_3 + ".jpg";
  // NOTE Probably a neater way to do this, at least for filler images! Just no brain power to see it rn

  // put all the images together 
  var images_unshuffled = [].concat(target_filename, filler_1_filename, filler_2_filename, filler_3_filename); 
  console.log(images_unshuffled)
  // shuffle the images before passing to the trial plugin 
  var images = jsPsych.randomization.shuffle(images_unshuffled);
  console.log(images)
  console.log(images.indexOf(target_filename)) // gets index of target image in the array of selected scenes

  // set the highlighted image index dependening on condition assignment 
  if (condition_assignment == "likelihood") {
      index = 4; // as images are 0-3, this makes there be no highlighted image for likelihood trials
  } else {
      index = images.indexOf(target_filename); // else the highlight is determined by the position of the target image
  }   

  // a subtrial that builds the test trial
  var training_trial = {
       type: plugin_type,
       images: images,
       preamble: instruction, // this is set, so okay as is 
       prompt: prompt, // currently going with specifying this in function input
       options: response_options, // this is set, so okay as is 
       highlighted_image_index: index, // this will depend on target, like in test

       //at the start of the trial, make a note of all relevant info to be saved
       on_start: function (trial) { // NOTE: in main exp, the text in brackets matches name of the variable ("training_trial")
         // but want to test whether that is necessary or can just have it sat "trial" as Maisy has had it
          trial.data = { // same here, this before said "training_trial.data"
              condition: condition_assignment,
              response_format: plugin_type,
              block: "training", // remember to add the equivalent for testing block!
              target_truth_value: "na", 
              target_content_type: "na", 
              linguistic_prompt: prompt, 
              target_image: target_filename,
              //filler_images_truth_values: currently this info is only in the filename, so not sure how best to access this! 
              //could be done from the csv in data processing, although tidiest if it's already saved in csv perhaps?
              images_in_order: images, // saves the filenames in the order they were presented in a trial, i.e. the shuffled order
              // NOTE Not really necessary for training block, but might as well save it I guess?
              };
          },
       on_finish: function (data) {
        // add code here to store the most recent response, so that can be checked and used for feedback!
        // NOTE apart from save_pragdep_data_line, the following bits here are not modified for this function, just
        // copied from Maisy's code for now
        choices = data.choices
        data.target_position = choices.indexOf(correct_answer)
        data.chosen_position = data.response
        data.choice = choices[data.response]
        if(data.choice === correct_answer){data.correct = true} // think this will be where I make it dependent on slider or radio
        else {data.correct = false}
        save_pragdep_data_line(data); //save the trial data -- COMMENT OUT when testing if don't want to use server!
       },
  };

  // a subtrial that appears if the participant chooses the wrong response


   console.log(training_trial);
   return training_trial;

   /*
   // This will be the bit that ties together all of the subtrials and hence the final output of the training trial building function:
   var full_training_trial = {timeline:[training_trial,feedback_loop,correct_feedback]} // change name to "full_training_trial" oslt, makes more sense to me
   // (even though it is a timeline - but that's how Kenny did it in W9)
   console.log(full_training_trial);
   return full_training_trial;*/
}

var training_trials = [
  make_training_trial("The triangle is blue.", "target-A", "filler-A1", "filler-A2", "filler-A3", "true"),
  make_training_trial("The square that is next to the triangle is green.", "target-B", "filler-B1", "filler-B2", "filler-B3", "true"),
  make_training_trial("The circle is blue and is right of the triangle.", "target-C", "filler-C1", "filler-C2", "filler-C3", "false")
];

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
    var test_timeline = {timeline:[test,trial,correct_feedback]} // change name to "full_training_trial" oslt, makes more sense to me
    // (even though it is a timeline - but that's how Kenny did it in W9)
    return test_timeline
  }

