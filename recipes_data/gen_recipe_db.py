import re, json
from pymongo import MongoClient

connection = MongoClient("mongodb://admin:123abc@ds147985.mlab.com:47985/cookem")
db = connection.cookem
db.recipes.delete_many({})

recipes_file = open('recipes.txt', 'r')
rec_lines = re.split(r'\n', recipes_file.read())
result = []
idx = 0

while(rec_lines[idx] == "=====" and idx+1 < len(rec_lines)):
    recipe = {}

    idx = idx + 1
    rec_name = rec_lines[idx]
    idx = idx + 1
    while(rec_lines[idx] != "===="):
        rec_name = rec_name+' '+rec_lines[idx]
        idx = idx + 1
    recipe["name"] = rec_name

    idx = idx + 1
    desc_name = rec_lines[idx]

    idx = idx + 1
    while (rec_lines[idx] != "==="):
        desc_name = desc_name + ' ' + rec_lines[idx]
        idx = idx + 1
    recipe["desc"] = desc_name


    idx = idx + 1
    rec_tags = re.split('\|',rec_lines[idx])
    recipe["tags"] = rec_tags
    idx = idx + 1

    idx = idx + 1
    comps = []
    keys = []
    while (rec_lines[idx] != "="):
        rec_comp = re.split('\|',rec_lines[idx])
        comp = {}
        comp["mat"] = rec_comp[0]
        comp["size"] = rec_comp[1]
        comps.append(comp)
        keys.append(rec_comp[0])
        idx = idx + 1
    recipe["comp"] = comps
    recipe["keywords"] = keys


    idx = idx + 1
    rec_steps = rec_lines[idx];
    idx = idx + 1
    while(rec_lines[idx] != "====="):
        rec_steps = rec_steps+' '+rec_lines[idx]
        idx = idx + 1

    recipe["step"] = re.split('#',rec_steps)

    if(rec_lines[idx] == "====="):
        db.recipes.insert_one(recipe)
print("uploading recipes done")