imgs = ["ana1-ff-1+arc2-ft-1+arc3-tt-2.jpg","stimuli/ana1-ff-2+only2-tt-1+def_ex2-tf-2.jpg","stimuli/ana1-ft-1+ana2-tt-2+only2-ft-1+arc2-ft-2.jpg","stimuli/ana1-ft-2+only2-ft-2+arc2-tf-1+arc3-tf-1+scalar2-tt-2.jpg","stimuli/ana1-tf-1+only2-ff-1.jpg","stimuli/ana1-tf-2+arc2-ff-1+def_ex2-ft-1.jpg","stimuli/ana1-tt-1+ana2-tf-1+only2-ff-2+def_ex-ft-2.jpg","stimuli/ana1-tt-2+def_ex3-tt-1.jpg","stimuli/arc1-ff-1+con2-tt-1+ana3-tf-1+only2-tt-2+def_ex2-ff-1.jpg","stimuli/arc1-ff-2+ana2-tf-2+ana3-tf-2.jpg","stimuli/arc1-ft-1+ana3-ft-1+def_ex3-tt-2.jpg","stimuli/arc1-ft-2+con3-ff-2.jpg","stimuli/arc1-tf-1+only2-tf-1+def_ex2-ff-2.jpg","stimuli/arc1-tf-2+arc3-tf-2.jpg","stimuli/arc1-tt-1+ana2-ft-2.jpg","stimuli/arc1-tt-2+ana2-ft-1+only2-tf-2.jpg","stimuli/arc3-ft-1+def_ex2-tf-1.jpg","stimuli/arc3-ft-2.jpg","stimuli/con1-ff-1+con2-tf-1+only3-ff-2+arc2-ff-2+def_un3-tt-1.jpg","stimuli/con1-ff-2+con2-ft-2+con3-ff-1+ana2-tt-1+ana3-ft-2+def_un3-tt-2.jpg","stimuli/con1-ft-1+ana3-ff-1+def_ex3-tf-1+def_un3-ft-2+def_ex2-ft-2.jpg","stimuli/con1-ft-2+con2-ff-1+con3-ft-2+ana2-ff-1.jpg","stimuli/con1-tf-1+ana3-tt-2.jpg","stimuli/con1-tf-2.jpg","stimuli/con1-tt-1+con3-tt-1+arc2-tt-1+arc3-tt-1+def_ex3-tf-2.jpg","stimuli/con1-tt-2+ana3-ff-2+only3-ff-1.jpg","stimuli/def_ex1-ff-1+ana2-ff-2+only3-ft-2+arc2-tt-2.jpg","stimuli/def_ex1-ft-1+def_un-ft-2.jpg","stimuli/def_ex1-ft-2.jpg","stimuli/def_ex1-tf-1+def_un-ft-1.jpg","stimuli/def_ex1-tf-2+con2-tf-2+con3-ft-1+def_un3-ft-1.jpg","stimuli/def_ex1-tt-1+con2-ft-1+def_ex2-tt-1.jpg","stimuli/def_ex1-tt-2+con3-tf-1+con2-ff-2.jpg","stimuli/def_ex2-tt-2+scalar2-ft-2.jpg","stimuli/def_un1-ff-1+scalar2-ft-1+numeral2-tf-2.jpg","stimuli/def_un1-ff-2+only3-tt-1+scalar3-ft-2.jpg","stimuli/def_un1-ft-1+con3-tt-2+def_ex1-ff-2.jpg","stimuli/def_un1-ft-2+scalar2-tt-1.jpg","stimuli/def_un1-tf-1+numeral2-ff-1.jpg","stimuli/def_un1-tf-2+only3-ft-1+scalar3-ft-1+numeral2-tt-2.jpg","stimuli/def_un1-tt-1+con3-tf-2+arc2-tf-2.jpg","stimuli/def_un1-tt-2+arc3-ff-1+numeral1-tt-2.jpg","stimuli/def_un2-ff-1+numeral1-tf-1.jpg","stimuli/def_un2-ff-2.jpg","stimuli/def_un2-tf-1.jpg","stimuli/def_un2-tf-2+numeral1-tf-2.jpg","stimuli/def_un3-ff-1+numeral1-ff-1.jpg","stimuli/def_un3-ff-2+scalar2-tf-1.+scalar3-tt-1jpg.jpg","stimuli/def_un3-tf-1+scalar3-tt-2.jpg","stimuli/def_un3-tf-2+scalar2-tf-2+numeral3-ff-1.jpg","stimuli/numeral3-ff-2.jpg","stimuli/numeral3-tf-1.jpg","stimuli/numeral3-tf-2.jpg","stimuli/numeral3-tt-2.jpg","stimuli/only1-ff-1.jpg","stimuli/only1-ff-2+only3-tf-2+def_ex3-ff-2+def_un2-ft-2.jpg","stimuli/only1-ft-1+numeral1-tt-1.jpg","stimuli/only1-ft-2+con2-tt-2+ana3-tt-1+only3-tf-1+arc3-ff-2+def_ex3-ft-1.jpg","stimuli/only1-tf-1+only3-tt-2+def_un2-ft-1.jpg","stimuli/only1-tf-2+cons-ft-2+def_ex3-ff-1.jpg","stimuli/only1-tt-1+def_un2-tt-2.jpg","stimuli/only1-tt-2+def_ex3-ft-2+def_un2-tt-1.jpg","stimuli/scalar1-ft-1+numeral2-tt-1.jpg","stimuli/scalar1-ft-2+numeral2-tf-1.jpg","stimuli/scalar1-tf-1.jpg","stimuli/scalar1-tf-2+numeral2-ff-2.jpg","stimuli/scalar1-tt-1.jpg","stimuli/scalar1-tt-2.jpg","stimuli/scalar3-tf-1.jpg","stimuli/scalar3-tf-2+numeral1-ff-2+numeral3-tt-1.jpg"]

content_types = ['con','ana','only','arc','def_ex','def_un','scalar','numeral']

for t in content_types:
    for stimnum in ["1","2","3"]:
        for imgnum in ["1","2"]:
            for tv in ["tt","tf","ft","ff"]:
                target = t + stimnum + "-" + tv + "-" + imgnum
                rel = [x for x in imgs if target in x]
                if len(rel) != 1:
                    print(target, len(rel))

# should only output the impossible scalar (ff) and numeral (ft) items - CHECK

# are there any that don't have a number? 

for t in content_types:
    for x in [y for y in imgs if t + "-" in y]:
        print(x)

# stimuli/ana1-tt-1+ana2-tf-1+only2-ff-2+def_ex-ft-2.jpg
# stimuli/def_ex1-ft-1+def_un-ft-2.jpg
# stimuli/def_ex1-tf-1+def_un-ft-1.jpg

# in checking items, pay extra close attention to these

# def_ex-ft-2
# def_un-ft-2
# def_un-ft-1

