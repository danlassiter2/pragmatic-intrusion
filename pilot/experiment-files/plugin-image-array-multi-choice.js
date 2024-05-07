var jsPsychImageArrayMultiChoice = (function (jspsych) {
  'use strict';

  const info = {
      name: "image-array-multi-choice",
      parameters: {
          /** Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
          images: {
              type: jspsych.ParameterType.IMAGE,
              array: true,
              pretty_name: "Images",
              default: undefined,
          },
          /** HTML-formatted string to display at top of the page above all of the questions. */
          preamble: {
            type: jspsych.ParameterType.HTML_STRING,
            pretty_name: "Preamble",
            default: undefined,
          },
          /** Question prompt. */
          prompt: {
            type: jspsych.ParameterType.HTML_STRING,
            pretty_name: "Prompt",
            default: undefined,
          },
          options: {
            type: jspsych.ParameterType.COMPLEX,
            pretty_name: "Options",
            array: true,
            nested: {
              name: { 
                type: jspsych.ParameterType.STRING,
                pretty_name: "Option name",
                default: undefined
              },
              text: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Option text",
                default: undefined
              }
            }
          },
          highlighted_image_index: {
            type: jspsych.ParameterType.INT,
            pretty_name: "Highlighted image index",
            default: undefined,
          }
      }
  };
  /**
   * **survey-multi-choice**
   *
   * jsPsych plugin for presenting multiple choice survey questions
   *
   * @author Shane Martin
   * @see {@link https://www.jspsych.org/plugins/jspsych-survey-multi-choice/ survey-multi-choice plugin documentation on jspsych.org}
   */
  class ImageArrayMultiChoicePlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          var plugin_id_name = "jspsych-image-array-multi-choice";
          var html = '<form id="iamc-form" autocomplete="off">\n';
          html += '<div id="iamc-grid-top">\n';
          // add images
          for (let idx=0; idx<4; idx++) {
            html += `<div id="iamc-grid-image-${idx}" class="iamc-grid-image-div">\n`
            let highlight = "";
            if (idx == trial.highlighted_image_index) {
              highlight = 'id="iamc-grid-image-highlighted"';
            }
            html += `<img ${highlight} class="iamc-grid-image" src="${trial.images[idx]}">\n`
            html += '</div>';
          }
          html += '<div id="iamc-rhs">\n'
          // add preamble
          html += `<div id="iamc-preamble">${trial.preamble}</div>\n`;
          // and prompt
          html += `<div id="iamc-prompt">${trial.prompt}</div>\n`;
          // and options
          html += '<div id="iamc-options">\n'
          let idx=0;
          for (let option of trial.options) {
            let input_id = `iamc-radio-${idx}`;
            html += '<div class="iamc-option">\n';
            html += `<input type="radio" id="${input_id}" value="${option.text}" data-name="${option.name}"></input>\n`;
            html += `<label class="iamc-radio-text" for="${input_id}">${option.text}</label>\n`;
            html += '</div>\n';
            idx += 1;
          }
          html += '</div>';
          // add submit button
          html += `<input type="submit" id="${plugin_id_name}-next" class="${plugin_id_name} jspsych-btn"></input>`;
          html += "</div>\n</div>\n</form>\n";
        
          // render
          display_element.innerHTML = html;
          document.querySelector("form").addEventListener("submit", (event) => {
              event.preventDefault();
              // only allow if we have one selected
              if (!this.any_radio_button_selected()) {
                return;
              }
              // measure response time
              var endTime = performance.now();
              var response_time = Math.round(endTime - startTime);
              var match = display_element.querySelector("#iamc-form");
              var response;
              if (match.querySelector("input[type=radio]:checked") !== null) {
                  response = match.querySelector("input[type=radio]:checked").attributes["data-name"].value;
              } else {
                  response = "";
              }
              // save data
              var trial_data = {
                  rt: response_time,
                  response: response
              };
              display_element.innerHTML = "";
              // next trial
              this.jsPsych.finishTrial(trial_data);
          });
          var startTime = performance.now();
      }
      any_radio_button_selected() {
        var radio_buttons = document.querySelectorAll('input[type="radio"');
        for (let idx=0; idx < radio_buttons.length; idx++) {
          if (radio_buttons[idx].checked) { return true; }
        }
        return false;
      }
      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      create_simulation_data(trial, simulation_options) {
          const question_data = {};
          let rt = 1000;
          for (const q of trial.questions) {
              const name = q.name ? q.name : `Q${trial.questions.indexOf(q)}`;
              question_data[name] = this.jsPsych.randomization.sampleWithoutReplacement(q.options, 1)[0];
              rt += this.jsPsych.randomization.sampleExGaussian(1500, 400, 1 / 200, true);
          }
          const default_data = {
              response: question_data,
              rt: rt,
              question_order: trial.randomize_question_order
                  ? this.jsPsych.randomization.shuffle([...Array(trial.questions.length).keys()])
                  : [...Array(trial.questions.length).keys()],
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          this.trial(display_element, trial);
          load_callback();
          const answers = Object.entries(data.response);
          for (let i = 0; i < answers.length; i++) {
              this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`#jspsych-survey-multi-choice-response-${i}-${trial.questions[i].options.indexOf(answers[i][1])}`), ((data.rt - 1000) / answers.length) * (i + 1));
          }
          this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("#jspsych-survey-multi-choice-next"), data.rt);
      }
  }
  ImageArrayMultiChoicePlugin.info = info;

  return ImageArrayMultiChoicePlugin;

})(jsPsychModule);
//# sourceMappingURL=index.browser.js.map
