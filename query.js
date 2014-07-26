var querystring = require('querystring');
var http = require('http');

var keywords = ['xd', 'orz', '冏', 'kerker', '呵呵', '哈哈', 'TT', '@@', '科科',
                '!!', 'qq', 'q_q', '-_-'];

function post(host, path, data, callback) {
  
  var post_data = querystring.stringify(data);

  // An object of options to indicate where to post to
  var post_options = {
      host: host,
      port: '80',
      path: path,
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      var data = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          data += chunk;
      });
      res.on('end', function() {
          callback(data);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();
}

var min30 = 60 * 1000 * 30;
var tokenTime;
var cachedToken;
var usageCount = 0;

function requestToken(callback) {
  console.log('request token');
  var now = (new Date()).getTime();
  if ((now - tokenTime) < min30 && usageCount < 5) {
    console.log('use cached token');
    usageCount++;
    callback(cachedToken);
    return;
  }
  tokenTime = (new Date()).getTime();
  usageCount = 0;
  var data = {
    'id': 'af028008ce5492cbb15f06098e847e63',
    'secret_key': '4c6703c5dc240720d2213eb5c50fbbd2'
  };
  post('api.ser.ideas.iii.org.tw', '/api/user/get_token', data,
       function(str) {
        var d = JSON.parse(str);
        if (d.result && d.result.token) {
          cachedToken = d.result.token;
          console.log('got token: ' + cachedToken);
          callback(cachedToken);
        } else {
          console.log('request token error');
          callback(null);
        }
       });
}

function doQuery() {
  console.log('do query');
  requestToken(function(token) {
    var keyword = keywords[Math.round(Math.random() * keywords.length)];
    console.log('keyword: ' + keyword);
    var data = {
      'keyword': keyword,
      'limit': 7,
      'sort': 'push',
      'token': token
    };
    post('api.ser.ideas.iii.org.tw', '/api/keyword_search/ptt/content',
          data, function(str) {
            var d = JSON.parse(str);
            if (d.result) {
              console.log('query result: ' + JSON.stringify(d.result));
            } else {
              console.log('no result');
            }
            setTimeout(doQuery, 500 + Math.random() * 2500);
          });
  });
}

doQuery();
