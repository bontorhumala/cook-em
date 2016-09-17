import os, base64, re, logging
from elasticsearch import Elasticsearch
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

INDEX_NAME = "cookem"
TYPE_NAME = "recipes"
QUERY = ["avocado", "Nectarines"]

queries = []
for q in QUERY:
    queries.append({"term":{"keywords":q}})

bdy = {
    "bool": {
        "minimum_number_should_match": 1,
        "should": queries
    }
}
res = es.search(index=INDEX_NAME, doc_type=TYPE_NAME,
                body={
                    "query":
                        {
                            "bool": {
                                "minimum_number_should_match": 1,
                                "should": queries
                            }
                        }
                })
print("%d documents found" % res['hits']['total'])
print(dumps(res))
