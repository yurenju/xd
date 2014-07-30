(function() {

  var STANDARD_SIZE = 136;
  var createdCircles;  
  var color = d3.scale.category20c();

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

  function smoothScrolling(hash) {
    var target = $(hash);
    target = target.length ? target : $('[name=' + hash.slice(1) +']');
    if (target.length) {
      $('html,body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  }

  function createCircle(k, max, width, height, padding) {
    var radius = max;
    var bestX, bestY;
    var collision = false;
    for (var i = 0; i < k && radius > 0; ++i) {
      var x = Math.random() * width;
      var y = Math.random() * height;
      collision = false;

      createdCircles.some(function(circle) {
        var dx = circle.x - x;
        var dy = circle.y - y;
        var distanceSquare = dx * dx + dy * dy;
        var twoRadius = radius + circle.radius + padding;
        if (distanceSquare < (twoRadius * twoRadius)) {
          collision = true;
        }
        return collision;
      });
      if (collision) {
        radius -= 2;
      } else {
        bestX = x;
        bestY = y;
        break;
      }
    }
    if (collision) {
      console.log('still collision');
      return  {
        'x': -100,
        'y': -100,
        'radius': radius
      };
    } else {
      return  {
        'x': bestX,
        'y': bestY,
        'radius': radius
      };
    }
  }

  function calcFontSize(container, maxSize, text, target) {
    var fontSize = maxSize;
    var fontFamily = container.css('font-family');
    while (textWidth(text, fontSize + 'px', fontFamily) > target &&
           fontSize > 3) {
      fontSize--;
    }
    return fontSize;
  }

  function createFriendCircle(container, f, width, height, maxValue, listener) {
    var defRadius = STANDARD_SIZE / 2;
    var circle = createCircle(50, defRadius, width, height, 1);

    if (circle.x === -100 || circle.y === -100) {
      // No space for this person.
      return;
    }

    var imgSrc = 'https://graph.facebook.com/' + f.uid + '/picture?type=large';
    var friend = createItem(container, imgSrc, f.name, circle.x, circle.y,
                            circle.radius / defRadius);

    createdCircles[createdCircles.length] = circle;

    friend.click(function() {
      if (listener) {
        listener(f.uid, f.name);
      }
    });
  }

  function createItem(container, image, name, x, y, scale) {
    var item = document.createElement('div');
    item.classList.add('avatar');
    item.classList.add('friend');
    // image
    var img = document.createElement('div');
    img.classList.add('avatar-image');
    img.style.backgroundImage = 'url(\'' + image + '\')'; 
    // user name
    var userName = document.createElement('p');
    userName.classList.add('avatar-name');
    userName.textContent = name;
    // We use scale to resize it so, we can use 128px as its normal size.
    userName.style.fontSize = calcFontSize(container, 24, name, 128) + 'px';

    item.appendChild(img);
    item.appendChild(userName);
    item.style.transform = 'translate(' + Math.round(x) + 'px, ' +
                                          Math.round(y) + 'px) ' +
                           'scale(' + scale + ')';
    container.append($(item));
    item.dataset.name = name;
    $(item).mouseenter(function() {
      item.classList.add('focused');
      item.style.transform = 'translate(' + Math.round(x) + 'px, ' +
                                            Math.round(y) + 'px) ' +
                             'scale(1.5)';

    }).mouseleave(function() {
      item.classList.remove('focused');
      item.style.transform = 'translate(' + Math.round(x) + 'px, ' +
                                            Math.round(y) + 'px) ' +
                             'scale(' + scale + ')';
    });
    return $(item);
  }

  function createMySelf(container, width, height) {
    var item = createItem(container, $('#usericon').attr('src'),
                          $('#username').text(), width / 2, height / 2, 1);
    item.addClass('userSelf');

    createdCircles[createdCircles.length] = {
      'x': width / 2,
      'y': height / 2,
      'radius': STANDARD_SIZE / 2
    };
  }

  window.showFriendList = function(friends, listener) {
    var totalValue = 0;
    var maxValue = 0;
    friends = friends.splice(0, 100);
    friends.forEach(function(p) {
      p.value = p.mutual_friend_count + 1;
      totalValue += p.value;
      maxValue = (maxValue < p.value) ? p.value : maxValue;
    });
    var container = $('#friendlist');
    container.html('');
    createdCircles = [];

    // use container size to draw it
    var width = container.width();
    var height = container.height();
    var circleContainer = document.createElement('div');
    circleContainer.classList.add('friends-container');
    container.append(circleContainer);
    // inner size
    width -= STANDARD_SIZE;
    height -= STANDARD_SIZE;
    // create self circle
    createMySelf($(circleContainer), width, height);

    var friendCount = friends.length;
    d3.timer(function() {
      var f = friends[friends.length - friendCount];
      createFriendCircle($(circleContainer), f, width, height, maxValue, listener);
      return !(--friendCount);
    });
  };

})();
