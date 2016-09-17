var bonsai_url    = "https://w5jmmiui:ilmurlpmgcvo8rjl@apricot-7832938.us-east-1.bonsai.io"
var elasticsearch = require('elasticsearch');
var client        = new elasticsearch.Client({
							host: bonsai_url,
							log: 'trace' 
						});

// Test the connection...
client.ping({
	requestTimeout: 30000,
	hello: "elasticsearch"
  },
  function (error) {
	if (error) {
	  console.error('elasticsearch cluster is down!');
	} else {
	  console.log('All is well');
	}
  }
);

QUERY = ["avocado", "Nectarines"]
queries = []
for q in QUERY:
    queries.append({"term":{"keywords":q}})

client.search({
	"query":
	{
		"bool": {
			"minimum_number_should_match": 1,
			"should": queries
		}
	}

}, function(err, results, fullData) {

	// data = {
	//     total: results.total,
	//     documents: _.pluck(results.hits, '_source'),
	//     tags: fullData.facets.tags.terms
	// };

	response.end(JSON.stringify(fullData));
});
