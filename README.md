# aws-es-curl

Simple `curl`-like utility with request signing support for AWS Elasticsearch

## Install

```
npm install aws-es-curl -g
```

## Usage

Simple search from AWS Elasticsearch domain.

```
$ aws-es-curl -X GET http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
```

Specify local AWS CLI profile via `AWS_PROFILE` environment variable or using `--profile <profile_name>` option.

```
$ aws-es-curl --profile another-local-aws-profile http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
$ AWS_PROFILE=another-local-aws-profile aws-es-curl http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
```

Pipe queries to ElasticSearch.

```
$ echo '{ "size": 0, "aggs": { "types": { "term": { "field": "_type" } } } }' | aws-es-curl -X POST http://domain-search-jkewre3423432kfdsax.eu-west-1.es.amazonaws.com/_search
```
