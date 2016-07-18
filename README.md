# aws-es-curl

Simple `curl`-like utility with request signing support for AWS Elasticsearch

## Usage

Simple search from AWS Elasticsearch domain.

```
$ ./aws-es-curl -X GET http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
```

Specify local configured AWS_PROFILE.

```
$ ./aws-es-curl --profile another-local-aws-profile http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
$ AWS_PROFILE=another-local-aws-profile ./aws-es-curl http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
```

Pipe queries to search.

```
$ echo '{ "size": 0, "aggs": { "types": { "term": { "field": "_type" } } } }' | ./aws-es-curl -X POST http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
```
