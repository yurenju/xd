'use strict';
var uid = null;
var accessToken = null;
var xdinfo = null;

function keyword(searchText) {
  var xds = xdinfo.getItems(searchText);
  var showEntries = [];
  if (xds.items.length !== 0) {
    showEntries = [];
    xds.items.sort(function(a, b) {
      return b.scroes- a.scroes;
    });
    for(var i in xds.items) {
      var index = parseInt(xds.items[i].id);
      if (xdinfo.feedEntries[index]) {
        xdinfo.feedEntries[index].scroes = xds.items[i].scroes;
        showEntries.push(xdinfo.feedEntries[index]);
      }
    }
    $('#comment_wrap').html('');
    showResult(showEntries, searchText, xds.items.scroes);
    //$('#result').html(render(showEntries)).css('border', '1px solid #f00');
  }
}

function smoothScrolling(hash) {
  var target = $(hash);
  target = target.length ? target : $('[name=' + hash.slice(1) +']');
  if (target.length) {
    $('html,body').animate({
      scrollTop: target.offset().top
    }, 1000);
  }
}

$(document).ready(function() {

  $.ajaxSetup({ cache: true });
  $.getScript('//connect.facebook.net/en_UK/all.js', fb_init);
  $('#fblogin').click(function() {
     FB.login(function(response) {
       // handle the response
       switchElement($('#fblogin'), 'off');
       // switchElement($('#getBT'), 'on');
     }, {scope: 'email,user_friends,read_stream,export_stream,friends_photos'});
  });

  $('#getBT').click(function() {
    runWordFreq($('#feeds').text());
  });

  $('#searchBT').click(function(){
    $('#comment_wrap').html('');
    var searchText = $('#xdSearch').val();
    var xds = xdinfo.getItems(searchText);
    var showEntries = [];
    if (xds.items.length !== 0) {
      showEntries = [];
      xds.items.sort(function(a, b) {
        return b.scroes- a.scroes;
      });
      for(var i in xds.items) {
        var index = parseInt(xds.items[i].id);
        if (xdinfo.feedEntries[index]) {
          showEntries.push(xdinfo.feedEntries[index]);
        }
      }
      showResult(showEntries);
      //$('#result').html(render(showEntries)).css('border', '1px solid #f00');

    }
  });

  $('#tell-me-more').click(function() {
    box.addClass('spin');
    $('#cube-outer').addClass('friend-list');
  });

  var prev = 'right';
  var box = $('.cube-container > div > div');
  box.addClass('show-' + prev);

  var emoticons = ['(>_<)', '(^_-)', '(´･ω･`)', '(ー_ー)!!', '( ･ิω･ิ)',
    'ఠ_ఠ', '(ಥ_ಥ)', '(❀╹◡╹)'];
  var sides = ['front', 'back', 'right', 'left', 'top', 'bottom'];

  $('#cube > figure').each(function(i, el) {
    $(el).text(emoticons[Math.floor(Math.random() * emoticons.length)]);
  })

  $('#change-face').click(function() {
    var next;
    do {
      next = sides[Math.floor(Math.random() * sides.length)];
    } while (next === prev);

    var changingSide = $('figure.' + next);
    changingSide.text(emoticons[Math.floor(Math.random() * emoticons.length)]);
    box.removeClass('show-' + prev);
    prev = next;
    box.addClass('show-' + next);
  });

  $('#back-to-banner').click(function() {
    $('#cube').removeClass('spin');
    $('#cube-outer').removeClass('friend-list');
  });
  $('#back-to-friend-list').click(function() {
    $('#cube-outer').removeClass('word-cloud');
    $('#cube-outer').addClass('friend-list');
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
      // switchElement($('#getBT'), 'on');
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
    ele.addClass('hideItem');
  } else {
    ele.removeClass('hideItem');
  }
}

function render(entries) {
  console.log('render!!!');
  var ret = '<ul>';
  var index = 0;
  entries.forEach(function(entry) {
    ret += '<li data-index="' + index + '">';
    if (entry.message) {
      ret += entry.message;
    }
    if (entry.type === 'photo' && entry.picture) {
      var path =  entry.picture;
      var last = path.substring(path.lastIndexOf("/") + 1, path.length);
      ret += '<img src="https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xaf1/' + last + '" />';

      // ret += '<img src="https://graph.facebook.com/' +
      //                                       entry.object_id + '/picture" />';
    }
    ret += '</li>';
    index += 1;
  })
  ret += '</ul>';
  return ret;
}

function calDegrees(entries) {
  var index = 0;
  entries.forEach(function(entry) {
    if (entry.message) {
      var xDegrees = null;
      xDegrees = calculateXD(entry.message);
      // console.log('xDegrees.scores:' + JSON.stringify(xDegrees.scores));
      xDegrees.scores.sort(function(a, b) {
        return b.scores- a.scores;
      });

      xDegrees.scores.forEach(function(xd){
        var scroes = parseInt(xd[1], 10);
        if (scroes > 0) {
          var obj = {};
          obj.id = index;
          obj.scroes = scroes;
          xdinfo.updateItem(xd[0], obj, scroes);
        }
      });
    }
    index += 1;
  });

  console.log('done!!:' + JSON.stringify(xdinfo));
}

function getUserFeed(id) {
  console.log('user id' +  id);
  if (id == null) {
    id = 'me';
  }
  FB.api(
      "/" + id + "/feed/", {limit: 500},
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          response.data.forEach(function (entry) {
              if (entry.from.id == id) {
                xdinfo.feedEntries.push(entry);
              }
              if (entry.comments != undefined) {
                entry.comments.data.forEach(function(comment) {
                  if (comment.from.id == id) {
                    xdinfo.feedEntries.push(comment);
                  }
                });
              }

          });
          console.log('abc:' + JSON.stringify(xdinfo.feedEntries));
          calDegrees(xdinfo.feedEntries);
          $('#feeds').html(render(xdinfo.feedEntries)).css('border', '1px solid #f00');
          runWordFreq($('#feeds').text());
        }// end of if
      }
    );
}

function getMyFriend() {
  var fql = 'SELECT uid, name, mutual_friend_count FROM user WHERE' +
            '   uid IN (SELECT uid2 FROM friend WHERE uid1 = me())' +
            '   ORDER BY mutual_friend_count DESC';
  FB.api('/fql?q=' + encodeURIComponent(fql), {limit: 500},
    function (response) {
      if (response && !response.error) {
        showFriendList(response.data, function(id, name) {
          $('#cube-outer').removeClass('friend-list');
          $('#cube-outer').addClass('word-cloud');
          getUserFeed(id);
          showFriendIcon(id, name);
          if (xdinfo === null) {
            xdinfo = new XDinfo(xdRegexes);
          } else  {
            xdinfo.restart(xdRegexes);
          }
        });
      }
    }
  );
}

function runWordFreq(text) {
  var normalText = calculateXD(text);
  var xDegrees = xdinfo.getScores();

  var hoverElement = $('#wc-canvas-hover');
  var hoverLabelElement = $('#wc-canvas-hover-label');



  var wordfreqOption = { workerUrl: 'vendor/wordfreq/src/wordfreq.worker.js' };
  WordFreq(wordfreqOption).process(normalText.processed, function(list) {
    var pizaList = list.concat(xDegrees);
    pizaList.sort(function(a, b) {
      return b[1]- a[1];
    });
    //console.log('pizaList:' +pizaList);
    $.getJSON('js/thumbs-up.json').then(function(thumbsUp) {
      $('#cube').removeClass('loading');
      WordCloud(document.getElementById('wc-canvas-canvas'),
        {
          list: pizaList,
          backgroundColor: '#83D3C9',
          hover: function(item, dimension, evt) {
            console.log("item: " + JSON.stringify(item));
            var el = hoverElement;
            if (!item) {
              el.attr('hidden', true);
              return;
            }

            el.removeAttr('hidden');
            el.css('transform', 'translate(' + (dimension.x + 20) + 'px, ' + (dimension.y + 40) + 'px');
            el.css('width', dimension.w + 'px');
            el.css('height', dimension.h + 'px');

            hoverLabelElement.text(JSON.stringify(item));
          },
          click: function(item, dimension, evt) {
            searchIIIAPI(item[0]);
            keyword(item[0]);
            smoothScrolling('#friendWrapper');
          },
          shape: function(theta) {
            for (var i = 1; i < thumbsUp.length; i++) {
              if (thumbsUp[i-1].theta < theta && theta <= thumbsUp[i].theta ) {
                return thumbsUp[i].r;
              }
            }
            return 0;
          }
        }
      );
    });
  });
}

function showFriendIcon(id, name) {
  //friendAvatar, friendName
  var avatarURL = "https://graph.facebook.com/" + id + "/picture?type=large";
  $('#friendAvatar').css('background', 'url(' + avatarURL + ') center center no-repeat');
  var getFontSize = calcFontSize($('#friendName'), 16, name, 64 * 3);
  console.log('avatarURL:' + getFontSize);
  $('#friendName').html(name).css('font-size', getFontSize);
  switchElement($('#friendInfoBox'), 'on');
  function calcFontSize(container, maxSize, text, target) {
    var fontSize = maxSize;
    var fontFamily = container.css('font-family');
    while (textWidth(text, fontSize + 'px', fontFamily) > target &&
           fontSize > 3) {
      fontSize--;
    }
    return fontSize + 'px';
  }

  function textWidth(text, fontSize, fontFamily){
    jQuery('body').append('<span>' + text + '</span>');
    var _lastspan = jQuery('span').last();

    _lastspan.css({
      'font-size' : fontSize,
      'font-family' : fontFamily
    })
    var width =_lastspan.width();
    _lastspan.remove();
    return width;
  };
}

function XDinfo(dict) {
  this.infoBox = [];
  this.feedEntries = [];
  this.init(dict);
}

XDinfo.prototype = {
  init: function xd_init(dict) {
    for(var key in dict) {
      var obj = {};
      obj.name = key;
      obj.items = [];
      obj.scores = 0; // default scroes
      this.infoBox.push(obj);
    }
  },

  updateItem: function xd_updateItem(key, keyInfo, scores) {
    var xd = this.getItems(key);
    xd.scores = xd.scores + scores;
    xd.items.push(keyInfo);
  },

  getItems: function xd_getItem(key) {
    for(var i in this.infoBox) {
      var xd = this.infoBox[i];
      if (xd.name === key) {
        return xd;
      }
    }

    return false;
  },

  getScores: function xd_getScores() {
    var xDegrees = [];
    for(var i in this.infoBox) {
      var xd = this.infoBox[i];
      if (xd.scores === 0) {
        xDegrees[xDegrees.length] = [xd.name, 10];
      } else {
        xDegrees[xDegrees.length] = [xd.name, xd.scores];
      }
    }

    return xDegrees;
  },

  restart: function xd_restart(dict) {
    this.close();
    this.init(dict);
  },

  close: function xd_close() {
    this.feedEntries = [];
    this.infoBox = [];
  }
};

function showResult(entries, searchText) {
  entries.forEach(function(entry) {
    var message = null,
        image = null,
        comments = null;
    var date = entry.created_time.substring(0, entry.created_time.lastIndexOf('T'));
    var whoSaid = entry.from.name;
    var scroes = entry.scroes;

    if (entry.message) {
      message = entry.message;
      // message = document.createElement('p');
      // var newContent = document.createTextNode(date + ':' + entry.message + ':' +entry.id);
      // message.appendChild(newContent);
    }
    if (entry.type === 'photo' && entry.picture) {
      var path =  entry.picture;
      var last = path.substring(path.lastIndexOf('/') + 1, path.length);
      image = 'https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xaf1/' + last;
      // image = document.createElement('img');
      // image.src = imgURL;
    }
    // if (entry.comments != undefined) {
    //   var allComments = entry.comments.data;
    //   allComments.forEach(function(Comment) {
    //     var li = document.createElement('li');
    //     var C_message = document.createElement('p');
    //     var span = document.createElement('span');
    //     var C_newContent = document.createTextNode(Comment.message);
    //     var name = document.createTextNode(Comment.from.name);
    //     span.appendChild(name);
    //     C_message.appendChild(C_newContent);
    //     li.appendChild(span);
    //     li.appendChild(C_message);
    //     comments.appendChild(li);
    //   });
    // }

    var result = '<li>' +
      '<div class="circle_score">' + scroes + '</div>' +
      '<div class="comment_content">' +
        '<div class="comment_date">' +
          '<p><time>' + date + '</time>' + whoSaid + '</p>';
    if (comments !== null) {
      result = result + '<a class="btn_spread" href="#" title="展開留言">' +
          '展開留言</a><!-- 收合換 btn_collapse class-->';
    }
    result = result +  '</div>';
    if (message !== null) {
      result =  result + '<div class="comment_detail">' +
                '<p><span>' + searchText + '</span>' + message +'</p>' +
                '</div>';
    }

    if (image !== null) {
      result =  result + '<div class="comment_img"><img  style="height:130px;" src="' + image + '"></div>';
    }

    result = result + '</div>' + '</li>';
    $('#comment_wrap').append(result);
  });

}
