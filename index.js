var AWS = require('aws-sdk');
var co = require('co');
var url = require('url');
var options = require('optimist')
  .argv;

var profile = process.env.AWS_PROFILE || options.profile || 'default';
var creds = new AWS.SharedIniFileCredentials({ profile });

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
    signer.addAuthorization(creds, new Date()); 
    
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

co(function*(){
    var maybeUrl = options._[0];
    var method = options.X || options.method || 'GET';
    var region = options.region || 'eu-west-1';

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
