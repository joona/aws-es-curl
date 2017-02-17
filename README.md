# aws-es-curl

Simple `curl`-like utility with V4 request signing support for AWS Elasticsearch Service.

## Install

```
npm install aws-es-curl -g
```

## Prequisities

* Make sure your Elasticsearch domain is configured with access policy template "Allow or deny access to one or more AWS accounts or IAM users".
* Make sure your IAM credentials are discoverable:
  * via environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  * via `aws-cli` authentication profile (defaults to profile `default`)
  * via instance profile on EC2 instance (with IAM role granting access to ES domain)

## Usage

`aws-es-curl` tries to figure out right set of credentials to use automatically. If credentials are not set through env variables, nor authentication profile is specified, it tries to fetch credentials from EC2 metadata service. This causes unneeded delay on development environment when default settings are used, because metadata call will fail after couple of attempts. If this is a problem, just specify profile or credentials via environment and the call will be skipped.

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
