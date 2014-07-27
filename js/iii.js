(function() {

  var min30 = 60 * 1000 * 30;
  var tokenTime;
  var cachedToken;
  $('.related-ptt').hide();

  function requestToken(callback) {
    var now = (new Date()).getTime();
    if ((now - tokenTime) < min30) {
      console.log('use cached token');
      callback(cachedToken);
      return;
    }
    tokenTime = (new Date()).getTime();
    var data = {
      'id': 'af028008ce5492cbb15f06098e847e63',
      'secret_key': '4c6703c5dc240720d2213eb5c50fbbd2'
    };
    $.post('http://api.ser.ideas.iii.org.tw:80/api/user/get_token', data,
           function(d) {
            if (d.result && d.result.token) {
              cachedToken = d.result.token;
              callback(cachedToken);
            } else {
              console.log('request token error');
              callback(null);
            }
           },
           'json');
  }

  function showToList(data) {
    $('.related-ptt').html('');
    var container = document.createElement('ul');
    data.forEach(function(row) {
      var item = document.createElement('li');
      container.appendChild(item);
      item.classList.add('ptt-link');
      var anchor = document.createElement('a');
      anchor.href = row[0].url;
      anchor.target = '_blank';
      anchor.title = row[0].title;
      anchor.textContent = row[0].title;
      item.appendChild(anchor);
    });
    $('.related-ptt').append(container);
    $('.related-ptt').show();
  }

  window.searchIIIAPI = function(keyword) {
    $('.related-ptt').hide();
    requestToken(function(token) {
      if (!token) {
        return;
      }
      var data = {
        'keyword': keyword,
        'limit': 7,
        'sort': 'push',
        'token': token
      }
      $.post('http://api.ser.ideas.iii.org.tw:80/api/keyword_search/ptt/content',
            data, function(d) {
              if (d.result) {
                showToList(d.result);
              }
            }, 'json');
    });
  };

})();
