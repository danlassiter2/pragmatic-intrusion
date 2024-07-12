
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
// (note again that likelihood is not included here as we are not doing binary likelihood trials) 
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
response, as before, and since we are now in the loop, the loop function keeps running the conditional node function which keeps running
the incorrect feedback trial until a correct response is given.
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
// range:
var a = {
  from: 0,
  to: 100
}; 
 */


function make_training_trial(prompt, target, filler_1, filler_2, filler_3){

  // build image file paths
  var target_filename = "pilot_scenes/training_stims/" + target + ".jpg"; 
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
  console.log(images.indexOf(target_filename)) // gets index of target image in the array of images

  // set the highlighted image index dependening on condition assignment 
  if (condition_assignment == "likelihood") {
      index = 4; // as images are 0-3, this makes there be no highlighted image for likelihood trials
  } else {
      index = images.indexOf(target_filename); // else the highlight is determined by the position of the target image
  }   

  // define what the correct answer is, which depends on response format and which of the three testing trials is running.
  // The latter will be determined by "target", which is input to the trialb building function when calling it below
  if (responseformat_assignment == "radio") {
    if (target == "target-A") {
    correct_answer = "True"; 
    } else if (target == "target-B") {
      correct_answer = "True";
    } else if (target == "target-C") {
      correct_answer = "False"; 
    }
  } else if (responseformat_assignment == "slider") { 
    // note that we specify fairly generous ranges for what counts as correct in slider trials, although we'd expect 
    // very close to exact values for these (as listed)
    if (target == "target-A") {
      correct_answer = {from: 80, to: 100}; // expect 100 or close to
      } else if (target == "target-B") {
        correct_answer = {from: 40, to: 60}; // expect 50 or close to
      } else if (target == "target-C") {
        correct_answer = {from: 0, to: 20}; // expect 0 or close to 
      }
  };
  console.log(correct_answer);
  var correct_answer = correct_answer; // seems I have to store this for the trial variable below to be able to access it. 
  // Can't tell why, as e.g. "index" seems to be accesible even when it's not stored in a variable..!

  // a subtrial that builds the training trial
  var training_trial = {
       type: plugin_type,
       images: images,
       preamble: "<br>" + instruction, // adding white space above to avoid it jumping around if "incorrect" is shown after
       prompt: prompt, // currently going with specifying this in function input
       options: response_options, 
       highlighted_image_index: index, // this will depend on target, like in test (only relevant for non-prob trials)

       //at the start of the trial, make a note of all relevant info to be saved
       on_start: function (trial) { // NOTE: in main exp, the text in brackets matches name of the variable ("training_trial")
         // but want to test whether that is necessary or can just have it sat "trial" as Maisy has had it
         // UPDATE Seems to work!
          trial.data = { // same here, this before said "training_trial.data" UPDATE seems to work
              condition: condition_assignment,
              response_format: responseformat_assignment,
              block: "training", // remember to add the equivalent for testing block!
              target_truth_value: "na", 
              target_content_type: "na", 
              linguistic_prompt: prompt, 
              target_image: target_filename,
              images_in_order: images, // saves the filenames in the order they were presented in a trial, i.e. the shuffled order
              // NOTE Not really necessary for training block, but might as well save it I guess?
              };
          },
       on_finish: function (data) {
        // save to data property whether response was correct (=true) or incorrect (=false)
        // think it needs to only check if response is in correct_answer; however, since the correct answer for slider
        // is a range, may have to do something fancier than just "equals"... i.e. smth more like "is in array?"
        if(data.response === correct_answer){data.correct = true} 
        // NOTE: === is identity (i.e. will check for match and type), == is only looking for equality (so will check for match 
        // but not in type; e.g. the following will all return true: 1 == '1', 1 == 1, 1 == true)
        else {data.correct = false}
        console.log(correct_answer); // this is where the issue lies! But don't know why.. UPDATE: stored the variable and now
        // it works. Guess it wasn't accessible in the same way the others were, though don't know why! E.g. index works fine
        // without being stored as a variable...
        console.log(data.response); // ISSUE is that response is stored as e.g. "truth", i.e. the same as condition. CHECK if that
        // is also what happens in the main exp! UPDATE Have fixed that, now it stores the actual text of the button (note; is
        // case-sensitive!)
        console.log(data.correct); // evalutes correctly! TO DO Make it work with range for the slider trials...
        //save_pragdep_data_line(data); //save the trial data -- COMMENT OUT when testing if don't want to use server!
       },
    };
    console.log(training_trial);
  //return training_trial;

  // a subtrial that appears if the participant chooses the wrong response
  var incorrect_feedback = {
    type: plugin_type,
    images: images,
    preamble: "<b style=color:red>Incorrect! Try again.</b><br>" + instruction, 
    prompt: prompt,
    options: response_options, 
    highlighted_image_index: index, 

    on_start: function (trial) { 
      trial.data = {
      condition: condition_assignment,
      response_format: responseformat_assignment,
      block: "training",
      target_truth_value: "na", 
      target_content_type: "na", 
      linguistic_prompt: prompt, 
      target_image: target_filename,
      images_in_order: images, 
      };
    },
    on_finish: function (data) {
      // save to data property whether response was correct (=true) or incorrect (=false)
      // think it needs to only check if response is in correct_answer; however, since the correct answer for slider
      // is a range, may have to do something fancier than just "equals"... i.e. smth more like "is in array?"
      // FOR NOW just seeing if I can make it work in general
      if(data.response === correct_answer){data.correct = true} 
      else {data.correct = false}
      console.log(correct_answer); 
      console.log(data.response); 
      console.log(data.correct); // evalutes correctly! TO DO Make it work with range for the slider trials...
      //save_pragdep_data_line(data); //save the trial data -- COMMENT OUT when testing if don't want to use server!
      console.log(images);
    },
  };

  // a conditional node that tells to only show incorrect feedback if the most recent trial was answered incorrectly
  var conditional_node = {
    timeline: [incorrect_feedback],
    conditional_function: function () {
        var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct // gets what data.correct was stored as 
        console.log(last_trial_correct);
        if(last_trial_correct == false) { // if response in most recent trial was stored as false, i.e. incorrect, then
          return true; // means we *will* run the incorrect_feedback timeline
        } else {
          return false; // means we will not
        } 
    }
  };

  // a loop that says to show incorrect feedback every time the participant chooses the wrong answer
  var retry_loop = {
    timeline: [conditional_node],
        loop_function: function () { // NOTE Removed "data" from brackets (Maisy had that) but seems to work anyway!
          var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
          if(last_trial_correct == false) { // may have to put "false" in quotes
            return true; // means we *will* run the conditional_node timeline
          } else {
            return false; // means we will not 
          } 
        },
    };

  // a subtrial that appears if the participant chooses the correct response
  // NOTE this currently doesn' store any of the data - CHECK if we need that (don't see why we would, only relevant
  // thing to keep track of I'd guess is how many attempts a participant needs)
  var correct_feedback = { // CHECK if it works for likelihood; worsk fine for binary truth
    type: jsPsychHtmlButtonResponse, 
    stimulus: function () {
      // if the trial was a likelihood trial, show all four images in feedback
      if (condition_assignment == "likelihood") {
        return prompt + "<p><b style=color:forestgreen>Correct! The answer was " + correct_answer + ".<p>" +
        "<img src=" + images[0] + " style='border:3px solid lightgray; width:200px'>" + "&nbsp; &nbsp;" +
        "<img src=" + images[1] + " style='border:3px solid lightgray; width:200px'>" +
        "</br>" + // need to get this horizontal space to match the width of the vertical one! But CHECK w Dan whether we need to
        // show the images again at all before spending more time on this
        "<img src=" + images[2] + " style='border:3px solid lightgray; width:200px'>" + "&nbsp; &nbsp;" + 
        "<img src=" + images[3] + " style='border:3px solid lightgray; width:200px'>";
      }
      // otherwise, show only the target image
      else {
        return prompt + "<p><b style=color:forestgreen>Correct! The answer was " + correct_answer + ".<p>" + 
        "<img src=" + target_filename + " style='border:3px solid lightgray; width:200px'>";
      }
    },
    choices: ['Continue'],
};

  // alternative correct feedback thing that would need work if we want to use!
  /*var correct_feedback = {
    type: plugin_type,
    images: images,
    preamble: instruction, 
    prompt: '<p style=font-size:20pt>' + "<b style=color:forestgreen>Correct!", // may still want to include prompt
    options: function(){
      var last_trial = jsPsych.data.get().last(1).values()[0]
      var response = last_trial.response
      return response},
    highlighted_image_index: index, 

    on_start: function (trial) { 
      trial.data = {
      condition: condition_assignment,
      response_format: responseformat_assignment,
      block: "training",
      target_truth_value: "na", 
      target_content_type: "na", 
      linguistic_prompt: prompt, 
      target_image: target_filename,
      images_in_order: images, 
      };
    },
    on_finish: function (data) {
      // save to data property whether response was correct (=true) or incorrect (=false)
      // think it needs to only check if response is in correct_answer; however, since the correct answer for slider
      // is a range, may have to do something fancier than just "equals"... i.e. smth more like "is in array?"
      // FOR NOW just seeing if I can make it work in general
      if(data.response === correct_answer){data.correct = true} 
      else {data.correct = false}
      console.log(correct_answer); 
      console.log(data.response); 
      console.log(data.correct); // evalutes correctly! TO DO Make it work with range for the slider trials...
      //save_pragdep_data_line(data);
    },
  };*/

  // this ties together all of the subtrials and hence is the final output of the training trial building function:
  var full_training_trial = { timeline: [training_trial, retry_loop, correct_feedback] }; 

  return full_training_trial;
}

// call the function to build the 3 training trials and store in a variable to be run in the final timeline
var training_trials = [
  make_training_trial("The triangle is blue.", "target-A", "filler-A1", "filler-A2", "filler-A3"),
  make_training_trial("The square that is next to the triangle is green.", "target-B", "filler-B1", "filler-B2", "filler-B3"),
  make_training_trial("The circle is blue and is right of the triangle.", "target-C", "filler-C1", "filler-C2", "filler-C3")
];

jsPsych.run(training_trials);

/*
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
  }*/