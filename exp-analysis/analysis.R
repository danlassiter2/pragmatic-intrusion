library(tidyverse)
library(lme4)

d.full = read.csv('/Users/danlass/git-repos/pragmatic-intrusion/exp-analysis/all-data.csv', header=T, skipNul = TRUE)

d.full$participant_id = factor(d.full$participant_id)





# if we do rt exclusions, need to do them **by condition + QUD** bc of differing difficulty of tasks
# but this may be too difficult to administer - maybe just leave in and let them be noise

d.test = filter(d.full, block=='test')

# fix coding error - FF items in the numeral condition should be FT 
# this is just bc we were thinking about the 2ndary inference as 'exactly one' rather than 'no more than one' when coding - didn't affect experiment or results
numeral.items = filter(d.test, target_content_type=='numeral')
numeral.items = mutate(numeral.items, target_TV = recode(target_TV, 'tt' = 'tt',
                                     'tf' = 'tf',
                                     'ff' = 'ft')) 

d.test = rbind(
  filter(d.full, target_content_type != 'numeral'),
  numeral.items
)



# we'll need to fix this coding issue also for the allTVs before looking at likelihood data! 


levels(factor(d.test$qud))
d.test[which(d.test$qud == 'qud1'),]$qud = 'primary'
d.test[which(d.test$qud == 'qud2'),]$qud = 'secondary'
d.test[which(d.test$qud == 'qud3'),]$qud = 'both'
d.test[which(d.test$qud == 'qud4'),]$qud = 'none'
  # recode to make clear what these meant in the exp

d.test$TV1 = NA
d.test$TV2 = NA
d.test$TV1 = ifelse(d.test$target_TV %in% c('tt', 'tf'), 'True', 'False')
d.test$TV2 = ifelse(d.test$target_TV %in% c('tt', 'ft'), 'True', 'False')

d.test$response_collapsed = sapply(d.test$response, FUN= function(x) {
  if (x %in% c('True', 'Acceptable')) return('yes')
  if (x %in% c('False', 'Unacceptable')) return('no')
  else return(NA)
})

d.test$target_content_type = factor(d.test$target_content_type)
# "ana" "arc"     "con"     "def_ex"  "def_un"  "numeral" "only"    "scalar"
levels(d.test$target_content_type) = c("too", "ARC", "conj", "def_ex",  "def_un", "numeral", "only", "some")

length(d.test[,1]) # 31006 trials
length(filter(d.test, rt < 5000)[,1])
# 5593 answered quite fast ...

d.test$logrt = log(as.numeric(d.test$rt))
plot(density(d.test$logrt))
  # looks nicely Gaussian

subjects = levels(d.test$participant_id)
length(subjects) # 1955 participants
data.per.subject = sapply(subjects, FUN=function(x) {
  length(
    filter(d.test, participant_id==x)[,1]
  )
})
summary(data.per.subject)
data.per.subject[which(data.per.subject != 16)]
  # should be 16 data points per participant
  # some gave less bc they didn't finish the task?
length(which(data.per.subject != 16))
  # 60 participants did not finish, 
  # and 1 somehow got double the questions (???)

dnf = names(which(data.per.subject != 16))
# Excluding 60 participants who didn't finish, plus the one who got a weird javascript bug:
d.test = filter(d.test, !(participant_id %in% dnf)) 
length(d.test[,1])
length(levels(factor(d.test$participant_id)))
  # now 1894 participants, 1894*16 = 30304 data points remaining

truth.bin = filter(d.test, condition=='truth', response_format=='radio') %>% 
  select(id=participant_id, condition, qud, TV=target_TV, contentType = target_content_type, response, logrt, TV1, TV2) %>% 
  mutate(TV=recode(TV, 'tt' = 'TT',
                   'tf' = 'TF',
                   'ft' = 'FT',
                   'ff' = 'FF')
  )

truth.bin$response.bin = ifelse(truth.bin$response=='True', 1, 0) 

truth.cont = filter(d.test, condition=='truth', response_format=='slider') %>% 
  select(id=participant_id, condition, qud, TV=target_TV, contentType = target_content_type, response, logrt, TV1, TV2) %>% 
  mutate(TV=recode(TV, 'tt' = 'TT',
                   'tf' = 'TF',
                   'ft' = 'FT',
                   'ff' = 'FF')
  )
# just look at test items

truth.cont$response = as.numeric(truth.cont$response)/100
summary(truth.cont$response)
plot(density(truth.cont$response))
  # very bimodal at 0 and 1, with a little bump at .5

acc.bin = filter(d.test, condition=='acceptability', response_format=='radio') %>% 
  select(id=participant_id, condition, qud, TV=target_TV, contentType = target_content_type, response, logrt, TV1, TV2)
acc.bin$response.bin = ifelse(acc.bin$response=='True', 1, 0)
acc.bin$response.bin = ifelse(acc.bin$response=='Acceptable', 1, 0) %>% 
  

acc.cont = filter(d.test, condition=='acceptability', response_format=='slider') %>% 
  select(id=participant_id, condition, qud, TV=target_TV, contentType = target_content_type, response, logrt, TV1, TV2) 

acc.cont = mutate(acc.cont, TV=recode(TV, 'tt' = 'TT',
                   'tf' = 'TF',
                   'ft' = 'FT',
                   'ff' = 'FF')
  )

acc.cont$response = as.numeric(acc.cont$response)/100
summary(acc.cont$response)
plot(density(acc.cont$response))

lhood = filter(d.test, condition=='likelihood', response_format == 'slider') %>% 
  select(id=participant_id, condition, qud, TV=allTVs, contentType = target_content_type, response, logrt)
lhood$response = as.numeric(lhood$response)/100
summary(lhood$response)
plot(density(lhood$response))
  # good use of intermediate values, bumps at 0, .25, .5, .75, and 1 as expected

#
# data questions: see doc 'data-questions.txt'
#

# Q1. Do truth and acceptability judgments come apart, as the truth=sem, acc=prag hypothesis would have it?

# Helpfully, the slider judgments for truth and acceptability are very bimodal. 

length(filter(truth.cont, response < .75, response > .25)[,1])/length(truth.cont[,1])
  # 483/5872 = 8%
length(filter(acc.cont, response < .75, response > .25)[,1])/length(acc.cont[,1])
# 483/5872 = 7%

# We could binarize them by thresholding at .5 with almost no loss of information. But anyway:

# Baseline: this is 
length(filter(d.test, qud=='none')[,1])
  # 7504 judgments from 469 participants in the no-QUD condition, spread across the 5 judgment types

filter(truth.bin, qud=='none') %>% 
  mutate(response=factor(response, levels=c('False', 'True'))) %>% 
  ggplot(aes(x=TV, fill=response)) +
  geom_bar(position='fill') +
  facet_grid(~ contentType) +
  xlab("Primary/Secondary truth values") +
  ylab("Proportion") +
  ggtitle("Binary truth judgments, baseline condition") + 
  theme_gray(base_size = 9)

filter(truth.cont, qud=='none') %>% 
  ggplot(aes(x=TV, y=response)) +
  geom_boxplot() +
  facet_grid(~ contentType) +
  xlab("Primary/Secondary truth values") +
  ylab("Response") +
  ggtitle('Continous truth judgments, baseline condition') + 
  theme_gray(base_size = 9)

# for truth judgments, binary and slider judgments are super close. only small divergence is some participants give above-zero ratings for conjunctions that have one true conjunct. 

# What's the correlation between mean response by condition and proportion of 'true' responses? for all QUDs:

truth.props = filter(truth.bin) %>%
  group_by(contentType, TV) %>% 
  summarize(resp=mean(response.bin))
truth.ratings = filter(truth.cont) %>%
  group_by(contentType, TV) %>% 
  summarize(resp=mean(response))

cor(truth.props$resp, truth.ratings$resp)
  # R^2 = .98

# on to the birds-eye view of acceptability judments:

filter(acc.bin, qud=='none') %>% 
  mutate(response=factor(response, levels=c('Unacceptable', 'Acceptable'))) %>%
  ggplot(aes(x=TV, fill=response)) +
  geom_bar(position='fill') +
  facet_grid(~ contentType) +
  xlab("Primary/Secondary truth values") +
  ylab("Proportion") +
  ggtitle('Binary acceptability judgments, baseline condition') + 
  theme_gray(base_size = 9)

filter(acc.cont, qud=='none') %>% 
  ggplot(aes(x=TV, y=response)) +
  geom_boxplot() +
  facet_grid(~ contentType) +
  xlab("Primary/Secondary truth values") +
  ylab("Response") + 
  ggtitle('Continuous acceptability judgments, baseline condition') + 
  theme_gray(base_size = 9)

# similarly close. here ppl seem to give slightly higher slider ratings to tf for anaphoric and scalar items than the proportion of 'true' judgments. but otherwise they're very close.

acc.props = filter(acc.bin) %>%
  group_by(contentType, TV) %>% 
  summarize(resp=mean(response.bin))
acc.ratings = filter(acc.cont) %>%
  group_by(contentType, TV) %>% 
  summarize(resp=mean(response))
cor(acc.props$resp, acc.ratings$resp)
# R^2 = .99

# now compare truth and acceptability judgments.
# very high correlations for QUD none here as well:

cor(acc.props$resp, truth.props$resp)
# R^2 = .99
cor(acc.ratings$resp, truth.ratings$resp)
# R^2 = .98

# linear model - is there a main effect of condition?
  # use response_collapsed for binary ones

d.test$condition = factor(d.test$condition)

bin.dat = filter(d.test, response_format == 'radio')
bin.dat$response_collapsed = factor(bin.dat$response_collapsed)

bin.model.full = glm(response_collapsed ~ condition * target_content_type * target_TV, family = binomial(link = "logit"), data=bin.dat)
bin.model.partial = glm(response_collapsed ~ condition + target_content_type * target_TV, family = binomial(link = "logit"), data=bin.dat)
anova(bin.model.full, bin.model.partial)

cont.dat = filter(d.test, response_format == 'slider', condition %in% c('truth', 'acceptability'))
cont.dat$response = as.numeric(cont.dat$response)

comp.bin = function(ctype, qud) {
  mf = glm(response_collapsed ~ target_TV * condition, family = binomial(link = "logit"), data=filter(bin.dat, target_content_type==ctype, qud==qud))

  mp = glm(response_collapsed ~ target_TV + condition, family = binomial(link = "logit"), data=filter(bin.dat, target_content_type==ctype, qud==qud))
  return(anova(mf, mp))
}

comp.cont = function(ctype, qud) {
  mf = lm(response ~ condition * target_TV, data=filter(cont.dat, target_content_type==ctype, qud==qud))
  
  mp = lm(response ~ condition + target_TV, data=filter(cont.dat, target_content_type==ctype, qud==qud))
  return(anova(mf, mp))
}

#
# TROUBLESHOOT FROM HERE - THESE COMPARISON FUNCTIONS AREN'T PASSING THROUGH THE QUD ARGUMENT PROPERLY!
#

# t/f judgments by content type, just for qud='none' - no sig diffs
comp.bin('too', 'none')  
comp.bin('ARC', 'none')
comp.bin('conj', 'none')
comp.bin('def_ex', qud='none')
comp.bin('def_un', qud='none')  # ***
comp.bin('numeral', qud='none') # *
comp.bin('only', qud='none')
comp.bin('some', qud='none') 

# slider judgments by content type - just for qud='none'
# 
comp.cont('too', 'none')  # **
comp.cont('ARC', 'none')
comp.cont('conj', 'none')
comp.cont('def_ex', qud='none')
comp.cont('def_un', qud='none')  # **
comp.cont('numeral', qud='none') # ***
comp.cont('only', qud='none')
comp.cont('some', qud='none') # ***




# answers to Q1 and Q2: without QUD, the choice of measure (truth vs acc) and response format (binary vs slider) hardly matters at all.
  
  # but you do get some deviations in the continuous ratings for anaphoric ('too'), conjunction, numeral, and scalar items
    # anaphoric - some people give lower acc ratings for tf arcs
      # strikingly, anaphoric 'too' is the only place where truth vs acc ratings come apart dramatically - almost all ppl say tf 'too' is false & most (75%ish) say it's unacceptable, but they have medium-high scalar acceptability and quite high scalar truth ratings
    # conj - many ppl give above zero continuous truth ratings for tf and ft items, though still very low acceptability ratings
    # numeral and only - somewhat lower average acceptability than truth ratings for tf items 

# anything interesting with the intermediate responses?

length(filter(d.test, response_format=='slider', condition != 'likelihood')[,1])
intermediate = filter(d.test, response_format=='slider', condition != 'likelihood') 
intermediate$response = as.numeric(intermediate$response)/100
intermediate = filter(intermediate, response > .25) %>% 
  filter(response < .75)
intermediate$target_content_type = factor(intermediate$target_content_type)
length(intermediate[,1]) 
  # 925/11808 total slider ratings in the truth and acceptability conditions = 8% of responses

# where do we tend to get intermediate values? 

filter(intermediate, qud=='none') %>% 
  select(id=participant_id, condition, qud, TV=target_TV, contentType = target_content_type, response, logrt) %>% 
  ggplot() +
  geom_bar(
    mapping = aes(x=TV, fill=contentType),
    position='dodge'
  ) 

# mostly in tf, some in ft, but it depends on contentType -
  # ft higher for arc and con - as in previous work showing some ppl respond that a tf or ft condjunction is sort of true
  # tf for ana (too), arc, numeral, and scalar and a bit for con, def_un 

# looking at all QUDs:

select(intermediate, id=participant_id, condition, qud, TV=target_TV, contentType = target_content_type, response, logrt) %>% 
  ggplot() +
  geom_bar(
    mapping = aes(x=TV, fill=contentType),
    position='dodge'
  ) +
  facet_wrap(~ qud)

# QUD does affect where ppl use intermediate ratings, but it's complicated. seem to use more intermediate ratings for ft in the 2ndard QUD, which makes sense ... 
# and less intermediate ratings for tf numeral and scalar when the QUD is primary . i think this makes sense also ...

#
# Q3: does sensitivity to falsity of 2ndary content vary by content type, response format, or truth vs acc?
# 

# for baseline condition, based on same plots for Q1 and Q2:
  # Conjunctive = ARC = def_ex = only
  # def_ex != def_un - i.e., 'the square is green' is generally accepted if there's another square, but of course not if there's no square
  # ana is similar to numeral (mod missing condition for numeral)
  # scalar is its own thing

# now look at other QUDs separately

truth.bin %>% 
  mutate(response=factor(response, levels=c('True', 'False'))) %>% 
  ggplot(aes(x=TV, fill=response)) +
  geom_bar(position='fill') +
  facet_grid(qud ~ contentType) +
  xlab("Primary/2ndary truth values") +
  ylab("Proportion")

truth.cont %>% 
  ggplot(aes(x=TV, y=response)) +
  geom_boxplot() +
  facet_grid(qud ~ contentType) +
  xlab("Primary/2ndary truth values") +
  ylab("Response")

acc.bin %>% 
  ggplot(aes(x=TV, fill=response)) +
  geom_bar(position='fill') +
  facet_grid(qud ~ contentType) +
  xlab("Primary/2ndary truth values") +
  ylab("Proportion")

acc.cont %>% 
  ggplot(aes(x=TV, y=response)) +
  geom_boxplot() +
  facet_grid(qud ~ contentType) +
  xlab("Primary/2ndary truth values") +
  ylab("Response")

# def_un with 2ndary QUD - ppl are more likely to say tf and tt are unaccepatble than false
  # i.e., "Is there more than one circle?" -"The circle is left of the triangle." presumably unacceptable bc it's a weird way to answer the question.

# do some linear/logistic models to check wif there's evidence for main effects / interactions:
  # this is obvious for content type and TV 
  # check for interactions btw these and QUD
  # separately for each measure




#Q4:




#
# now look at likelihood data
#

lhood$response = as.numeric(lhood$response)/100


check.images = function(i) {
  if (length(grep(lhood[i,]$target_content_type, lhood[i,12:15])) != 4) {
    warning(paste('image labeling problem in line', i)) 
    return(i)
  } else {
    return()
  }
}
f = sapply(1:length(lhood[,1]), FUN=check.images)
which(is.na(f))
sm = 0
for (i in 1:length(f)) {
  if (length(f[[i]]) != 0) sm = sm + 1
} # all good, image labeling corresponds perfectly to condition
sm

expected.prob.primary = function(i) {
    tt = length(grep("-tt-", lhood[i,12:15]))
    tf = length(grep("-tf-", lhood[i,12:15]))
    ft = length(grep("-ft-", lhood[i,12:15]))
    ff = length(grep("-ff-", lhood[i,12:15]))
    if (tt + tf + ft + ff != 4) warning(paste('Missing values in line', i))
    return((tt + tf)/4)
}

expected.prob.secondary = function(i) {
    tt = length(grep("-tt-", lhood[i,12:15]))
    tf = length(grep("-tf-", lhood[i,12:15]))
    ft = length(grep("-ft-", lhood[i,12:15]))
    ff = length(grep("-ff-", lhood[i,12:15]))
    if (tt + tf + ft + ff != 4) warning(paste('Missing values in line', i))
    return((tt + ft)/4)
}

expected.prob.both = function(i) { # theory: both matter equally
    tt = length(grep("-tt-", lhood[i,12:15]))
    tf = length(grep("-tf-", lhood[i,12:15]))
    ft = length(grep("-ft-", lhood[i,12:15]))
    ff = length(grep("-ff-", lhood[i,12:15]))
    if (tt + tf + ft + ff != 4) warning(paste('Missing values in line', i))
    return(tt/4)
}

lhood1 = lhood
lhood1$pred_type = 'primary only'
lhood1$pred = sapply(1:length(lhood[,1]), FUN=expected.prob.primary)

lhood2 = lhood
lhood2$pred_type = 'secondary only'
lhood2$pred = sapply(1:length(lhood[,1]), FUN=expected.prob.secondary)

lhood3 = lhood
lhood3$pred_type = 'conjunctive'
lhood3$pred = sapply(1:length(lhood[,1]), FUN=expected.prob.both)

lhood.expanded = rbind(
  lhood1, lhood2, lhood3
)

# try plotting responses against each expected prob
lhood.expanded %>% 
  #group_by(target_content_type, pred_type) %>% 
  ggplot() +
  geom_point(mapping=aes(x=pred, y=response)) +
  geom_smooth(mapping=aes(x=pred, y=response)) +
  facet_grid(pred_type ~ target_content_type) + 
  ylim(c(0,1)) 

MSE = function(pred, observed) {
  mean((pred-observed)^2)
}

MSE.by.type = function(type) {
    res = c(
      conjunctive = MSE(
        filter(lhood.expanded, target_content_type == type, pred_type == 'conjunctive')$pred, 
        filter(lhood.expanded, target_content_type == type)$response
    ),
      primary.only = MSE(
        filter(lhood.expanded, target_content_type == type, pred_type == 'primary only')$pred, 
        filter(lhood.expanded, target_content_type == type)$response
    ),
      secondary.only = MSE(
        filter(lhood.expanded, target_content_type == type, pred_type == 'secondary only')$pred, 
        filter(lhood.expanded, target_content_type == type)$response
      )
    )
  types = c('conjunctive','primary_only', 'secondary_only')
  return(c(round(res,2), winner=types[which(res == min(res))]))
}

MSEs = list(
  ana = MSE.by.type('ana'),
  arc = MSE.by.type('arc'),
  con = MSE.by.type('con'),
  def.ex = MSE.by.type('def_ex'),
  def.un = MSE.by.type('def_un'),
  only = MSE.by.type('only')
)

# $ana
# conjunctive   primary.only secondary.only         winner 
# "0.09"         "0.07"         "0.16" "primary_only" 
# 
# $arc
# conjunctive   primary.only secondary.only         winner 
# "0.06"         "0.15"         "0.12"  "conjunctive" 
# 
# $con
# conjunctive   primary.only secondary.only         winner 
# "0.05"         "0.12"         "0.13"  "conjunctive" 
# 
# $def.ex
# conjunctive   primary.only secondary.only         winner 
# "0.03"         "0.13"         "0.12"  "conjunctive" 
# 
# $def.un
# conjunctive   primary.only secondary.only         winner 
# "0.15"         "0.05"         "0.15" "primary_only" 
# 
# $only
# conjunctive   primary.only secondary.only         winner 
# "0.08"         "0.14"         "0.13"  "conjunctive" 

t = filter(d, participant_id == '5dcc38c329314b000dd68210')
t[30,]$time_elapsed/60000

total.times = filter(d, test_trial_count == 30)
  %>% group_by(condition, response_format) 
  %>% mean(time_elapsed/60000))
  

