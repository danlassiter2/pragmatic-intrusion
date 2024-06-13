// Example 1: training trial with correct and incorrect feedback and which lets the participant loop until they get it right
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
            var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
            if(last_trial_correct){return false} else {return true}
        }}
   
    // show incorrect feedback as many times as the participant chooses the wrong answer
    var trial = {timeline: [conditional_node],
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



  // Example 2: gives correct/incorrect feedback and then moves on to the next trial. This one is a nested timeline,
  // unlike the first example. Maisy says no reason she did it this way, and either method can be used with either approach

  // a function to build a production + feedback trial
function make_production_trial(greeter,greetee,choices,target,block,relationship) {
    var trial = {
      type: jsPsychCanvasButtonResponsePromptabovestimulus,
      stimulus: function(c){build_greeting_canvas(c,greeter,greetee, 'Luha, ______ !')},
      canvas_size: [450,770],
      prompt: '<p style=font-size:20pt>' + 'How should this person be greeted?<br><br>',
      choices: choices,
      rows: 1,
      columns: choices.length,
      data: {
        task: 'production',
        block: block,
        choices: choices,
        greeter: greeter,
        greetee: greetee,
        label: 'na',
        target: target,
        target_position: choices.indexOf(target),
        relationship: relationship,
      block_score: function() {
        var last_trial = jsPsych.data.get().last(1).values()[0]
        if(last_trial.block === block) {var block_score = last_trial.block_score}
        else {var block_score = 0}
        return block_score
        },
      score: function() {
        var last_trial = jsPsych.data.get().last(1).values()[0]
        if(last_trial.score) {var score = last_trial.score}
        else {var score = 0}
        return score
        }
      },
    timeline: [
      {on_finish: function(data) {
          data.chosen_position = data.response
          data.choice = choices[data.response]
          if(data.choice === target){data.correct = true; data.score += 1, data.block_score += 1}
          else {data.correct = false}
          save_data_line(data)
        }
      },
      {
   
      stimulus: function(c){
        var last_trial = jsPsych.data.get().last(1).values()[0]
        build_greeting_canvas(c,greeter,greetee,'Luha, ' + target + '!',true,last_trial.correct)},
      canvas_size: [450,770],
      choices:choices,
      button_html: function() {
        var last_trial = jsPsych.data.get().last(1).values()[0]
        var button_html = []
        for (var i=0; i<choices.length; i++) {
          button_html.push('<button disabled class="jspsych-btn" style = "border-color: #ccc; border-width:2px">%choice%</button>')
        }
        button_html[last_trial.target_position] = '<button disabled class="jspsych-btn" style = "border-color: forestgreen; border-width:5px; color: black">%choice%</button>'
        if(last_trial.correct) {
          return button_html
        } else {
          button_html[last_trial.chosen_position] = '<button disabled class="jspsych-btn" style = "border-color: red; border-width:5px; color: black">%choice%</button>'
          return button_html
        }},
      trial_duration: 3000,
      prompt:function(){
        var last_trial = jsPsych.data.get().last(1).values()[0]
         // if correct, print correct. if incorrect, show them the correct response
        if(last_trial.correct){return '<p style=font-size:20pt>' + "<b style=color:forestgreen>Correct!<br><br>"}
        else {return '<p style=font-size:20pt>' + "<b style=color:red>Incorrect!<br><br>"}},
    }]}
   
   
    return trial
    }