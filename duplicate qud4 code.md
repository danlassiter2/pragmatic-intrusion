 if (qud_assignment == "qud4") { 
    // NEW: if qud4 is assigned, the "question" and "response" bits are not inserted
        if (responseformat_assignment== "radio") {
            // make trials using custom radio button plugin
            var trial = {
                type: jsPsychImageArrayMultiChoice,
                images: images_to_display, 
                preamble: qud + "</p><br>" +  trial_stim.prompt + "</p><br>" +  instruction, 
                prompt: "",
                labels: response_options,
                highlighted_image_index: index,
    
                //at the start of the trial, make a note of all relevant info to be saved
                on_start: function (trial) {
                    trial.data = {
                        condition: condition_assignment,
                        qud: qud_assignment, 
                        response_format: "radio",
                        block: "test",
                        training_trial_counter: "NA",
                        test_trial_counter: ++test_trial_counter, 
                        target_truth_value: target_truth_value, 
                        all_TVs: all_TVs,
                        target_content_type: target_content_type,
                        target_image: target_image_filename,
                        images_in_order: images_to_display, // saves the filenames in the order they were presented in a trial
                        stimulus: trial_stim.prompt_name
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
                images: images_to_display,
                preamble: qud + "</p><br>" +  trial_stim.prompt + "</p><br>" +  instruction, 
                prompt: "",
                labels: response_options,
                highlighted_image_index: index,
               // slider_width: // can set this in pixels if desired
    
                //at the start of the trial, make a note of all relevant info to be saved
                on_start: function (slider_trial) {
                    slider_trial.data = {
                        condition: condition_assignment,
                        qud: qud_assignment,
                        response_format: "slider",
                        block: "test",
                        training_trial_counter: "NA",
                        test_trial_counter: ++test_trial_counter, 
                        target_truth_value: target_truth_value, 
                        all_TVs: all_TVs,
                        target_content_type: target_content_type,
                        target_image: target_image_filename,
                        images_in_order: images_to_display, 
                        stimulus: trial_stim.prompt_name
                    };
                },
                on_finish: function (data) {
                    save_pragdep_data_line(data); //save the trial data
                },
            };
            //console.log(slider_trial);
            return slider_trial;
        }     
    }