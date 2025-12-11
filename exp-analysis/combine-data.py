import os
dir = '/Users/danlass/git-repos/pragmatic-intrusion/exp-analysis'
filenames = os.listdir(dir + '/participant-data/')

dat = '\"participant_id\",\"condition\",\"response_format\",\"block\",\"training_trial_count\",\"test_trial_count\",\"trial_index\",\"target_truth_value\",\"target_content_type\",\"linguistic_prompt\",\"target_image\",\"images_in_presentation_order_0\",\"images_in_presentation_order_1\",\"images_in_presentation_order_2\",\"images_in_presentation_order_3\",\"response\",\"time_elapsed\",\"rt\"\n'

for filename in filenames:
    f = open(dir + '/participant-data/' + filename, encoding='utf-8', errors='ignore')
    lines = f.readlines()[1:]
    for line in lines:
        if line[:16] != '"participant_id"':
            dat += line

all_data = open(dir + '/all-data.csv', 'w')
all_data.write(dat)
all_data.close()