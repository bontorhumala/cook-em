import os, base64, re, logging
from elasticsearch import Elasticsearch
from pymongo import MongoClient
from bson.json_util import dumps

# Log transport details (optional):
logging.basicConfig(level=logging.INFO)

# Parse the auth and host from env:
bonsai = 'https://w5jmmiui:ilmurlpmgcvo8rjl@apricot-7832938.us-east-1.bonsai.io'
auth = re.search('https\:\/\/(.*)\@', bonsai).group(1).split(':')
host = bonsai.replace('https://%s:%s@' % (auth[0], auth[1]), '')

# Connect to cluster over SSL using auth for best security:
es_header = [{
  'host': host,
  'port': 443,
  'use_ssl': True,
  'http_auth': (auth[0],auth[1])
}]

# Instantiate the new Elasticsearch connection:
es = Elasticsearch(es_header)

# Verify that Python can talk to Bonsai (optional):
es.ping()

INDEX_NAME = "cookem"
TYPE_NAME = "recipes"

index_exists = es.indices.exists(INDEX_NAME)
if index_exists:
	es.indices.delete(index=INDEX_NAME, ignore=[400, 404])

es.indices.create(
	index = INDEX_NAME,
	body = {
		"settings": {
			"index": {
				"number_of_shards": 1,
				"number_of_replicas": 0,
				"analysis": {
					"analyzer": {
						"default": {
							"type": "standard",
							"tokenizer": "standard",
							"filter": [
								"lowercase",
								"stopwords"
							]
						}
					},
					"filter": {
						"stopwords": {
							"type": "stop",
							"stopwords": "_english_"
						}
					}
				}
			}
		}
	},
	ignore = 400
)

connection = MongoClient("mongodb://admin:123abc@ds147985.mlab.com:47985/cookem")
db = connection.cookem

cursor = db.recipes.find()
idx=0
for document in cursor:
	docs = dumps(document)
	es.index(index= INDEX_NAME, doc_type=TYPE_NAME, id=idx, body=docs)
	idx += 1

# refresh to make the documents available for search
es.indices.refresh(index=INDEX_NAME)