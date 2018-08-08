var AWS = require('aws-sdk');
var co = require('co');
var url = require('url');
var options = require('optimist')
  .argv;

var credentials;

var getMetadataCredentials = function() {
  credentials = new AWS.EC2MetadataCredentials();
  return credentials.getPromise()
};

var getCredentials = function*() {
  var profile = process.env.AWS_PROFILE || options.profile;
  if(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && !profile) {
    credentials = new AWS.EnvironmentCredentials('AWS');
    return;
  }

  if(!profile) {
    try {
      yield getMetadataCredentials();
      return;
    } catch(err) {
      console.error('Unable to access metadata service.', err.message);
    }
  }
  
  credentials = new AWS.SharedIniFileCredentials({ 
      profile: profile || 'default',
      // the filename to use when loading credentials
      // use of AWS_SHARED_CREDENTIALS_FILE environment variable
      // see also 'The Shared Credentials File' http://docs.aws.amazon.com/cli/latest/topic/config-vars.html
      filename: process.env.AWS_SHARED_CREDENTIALS_FILE
   });
}

var readStdin = function() {
  return new Promise((resolve, reject) => {
    var data = '';
    var stdin = process.stdin;

    stdin.on('readable', function() {
      var chunk = this.read();
      if(chunk) {
        data += chunk;
      }
    });

    stdin.on('end', function() {
      resolve(data.trim());
    });
  });
};

var execute = function(endpoint, region, path, method, body) {
  return new Promise((resolve, reject) => {
    var req = new AWS.HttpRequest(endpoint); 
    req.method = method || 'GET'; 
    req.path = path; 
    req.region = region; 

    if(body) {
      if(typeof body === "object") {
        req.body = JSON.stringify(body); 
      } else {
        req.body = body;
      }
    }
    
    req.headers['presigned-expires'] = false; 
    req.headers.Host = endpoint.host;

    var signer = new AWS.Signers.V4(req, 'es'); 
    signer.addAuthorization(credentials, new Date()); 
    
    var send = new AWS.NodeHttpClient(); 
    send.handleRequest(req, null, (httpResp) => { 
      var body = ''; 
      httpResp.on('data', (chunk) => { 
        body += chunk; 
      }); 
      httpResp.on('end', (chunk) => { 
        resolve(body); 
      }); 
    }, (err) => { 
      console.log('Error: ' + err); 
      reject(err); 
    }); 
  });
};

var main = function() {
  co(function*(){
      var maybeUrl = options._[0];
      var method = options.X || options.method || 'GET';
      var region = options.region || process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'eu-west-1';

      yield getCredentials();

      var input;
      if(!process.stdin.isTTY) {
        input = yield readStdin();
      }

      if(!maybeUrl || (maybeUrl && maybeUrl == 'help') || options.help || options.h) {
        console.log('Usage: aws-es-curl [options] <url>');
        console.log();
        console.log('Options:');
        console.log("\t-X, --method \tHTTP method \t(Default: GET)");
        console.log("\t--profile \tAWS profile \t(Default: default)");
        console.log("\t--region \tAWS region \t(Default: eu-west-1)");
        process.exit(1);
      }

      if(maybeUrl && maybeUrl.indexOf('http') === 0) {
        var uri = url.parse(maybeUrl);
        var endpoint = new AWS.Endpoint(uri.host);
        var response = yield execute(endpoint, region, uri.path, method, input);
        process.stdout.write(response + "\n");
      }
    })
    .then(res => {
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err.message);
      console.log(err.stack);
      process.exit(1);
    });
};

if(!module.parent) {
  main();
}

module.exports = main;
