'use strict';
var uid = null;
var accessToken = null;

$(document).ready(function() {
  $.ajaxSetup({ cache: true });
  $.getScript('//connect.facebook.net/en_UK/all.js', fb_init);
  $('#fblogin').click(function() {
     FB.login(function(response) {
       // handle the response
       switchElement($('#fblogin'), 'off');
       switchElement($('#getBT'), 'on');
     }, {scope: 'email,user_friends,read_stream,export_stream,friends_photos'});
  });

  $('#getBT').click(function() {
    runWordFreq($('#feeds').html());
  });
});

function fb_init() {
  FB.init({
    appId: FACEBOOK_APP_ID,
    status     : true,
    xfbml      : true,
    version    : 'v1.0'
  });

  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // the user is logged in and has authenticated your
      // app, and response.authResponse supplies
      // the user's ID, a valid access token, a signed
      // request, and the time the access token 
      // and signed request each expire
      var uid = response.authResponse.userID;
      var accessToken = response.authResponse.accessToken;
      console.log('login!!!' + response.authResponse.userID);
      userInfo();
      getMyFriend()
      switchElement($('#getBT'), 'on');
    } else if (response.status === 'not_authorized') {
      // the user is logged in to Facebook, 
      // but has not authenticated your app
      switchElement($('#fblogin'), 'on');
      console.log('has not authenticated your app');
    } else {
      $('#fblogin').removeAttr('disabled');
      // the user isn't logged in to Facebook.
      console.log('the user isn\'t logged in to Facebook.');
      switchElement($('#fblogin'), 'on');
    }
 });
}

function userInfo () {
  FB.api(
    "/me/",
    function (response) {
      if (response && !response.error) {
        /* handle the result */
        var icon = "https://graph.facebook.com/" + response.id + 
                                                        "/picture";
        $('#usericon').attr('src', icon).attr('traget', '_blank');
        $('#username').attr('href', response.link).html(response.name);
        $('#usericon').click(function() {
          getUserFeed(response.id);
        });
        switchElement($('#userinfo'), 'on');
      }
    }
  );
}

function switchElement(ele, operate) {
  if (operate === 'off') {
    ele.addClass('hidden');
  } else {
    ele.removeClass('hidden');
  }
}

function getUserFeed(id) {
  if (id == null) {
    id = 'me';
  }
  FB.api(
      "/" + id + "/feed/", {limit: 500},
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          var text = [];
          response.data.forEach(function (entry) {
              if (entry.message != undefined && entry.from.id == id) {
                text.push(entry.message);
              }
              if (entry.comments != undefined) {
                entry.comments.data.forEach(function(comment) {
                  text.push(comment.message);
                });
              }
              
          });
          text = text.join('\n');
          $('#feeds').html(text).css('border', '1px solid #f00');
        }// end of if
      }
    );
}

function getMyFriend() {
  FB.api(
    "/me/friends/", {limit: 500},
    function (response) {
      if (response && !response.error) {
        var ul = document.createElement("ul");
        var docfrag = document.createDocumentFragment();
        response.data.forEach(
          function (entry) {
            var li = document.createElement("li");
            li.textContent = entry.name;
            li.dataset.id = entry.id;
            docfrag.appendChild(li);
          }
        );
        ul.appendChild(docfrag);
        document.getElementById('friendlist').appendChild(ul);
        ul.addEventListener('click', function(e) {
          getUserFeed(e.target.dataset.id);
        });
      }
    }
  );
}

function runWordFreq(text) {
   var wordfreqOption = { workerUrl: 'js/wordfreq/src/wordfreq.worker.js' };
   WordFreq(wordfreqOption).process(text, function(list) {
    console.log('pizaList:' +list);
    WordCloud(document.getElementById('wc-canvas-canvas'), { list: list } );
   });
}
