(function() {

  var MAX_RADIUS = 64;
  var quadtree;
  var color = d3.scale.category20c();
  var defs;

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
    var searchRadius = max * 2,
        maxRadius2 = max * max;
    var bestX, bestY, bestDistance = 0;

    for (var i = 0; i < k || bestDistance < padding; ++i) {
      var x = Math.random() * width,
          y = Math.random() * height,
          rx1 = x - searchRadius,
          rx2 = x + searchRadius,
          ry1 = y - searchRadius,
          ry2 = y + searchRadius,
          minDistance = max; // minimum distance for this candidate

      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (p = quad.point) {
          var p,
              dx = x - p[0],
              dy = y - p[1],
              d2 = dx * dx + dy * dy,
              r2 = p[2] * p[2];
          if (d2 < r2) return minDistance = 0, true; // within a circle
          var d = Math.sqrt(d2) - p[2];
          if (d < minDistance) minDistance = d;
          if (minDistance < 1.5)
            return true;
        }
        return !minDistance || x1 > rx2 || x2 < rx1 || y1 > ry2 || y2 < ry1; // or outside search radius
      });

      if (minDistance > bestDistance) bestX = x, bestY = y, bestDistance = minDistance;
    }

    var best = [bestX, bestY, bestDistance - padding];
    quadtree.add(best);
    return best;
  }

  function calcFontSize(container, maxSize, text, target) {
    var fontSize = maxSize;
    var fontFamily = container.css('font-family');
    while (textWidth(text, fontSize + 'px', fontFamily) > target &&
           fontSize > 3) {
      fontSize--;
    }
    return fontSize + 'px';
  }

  function createPattern(uid) {
    return defs.append('pattern').attr('id', 'img-' + uid)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '1')
        .attr('height', '1')
        .attr('patternUnits', 'objectBoundingBox')
        .append('image')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', '200')
          .attr('height', '200')
          .attr('xlink:href',
                'https://graph.facebook.com/' + uid + '/picture?type=large');
  }

  function createFriendCircle(container, svg, f, width, height, maxValue,
                              listener) {
    var suggestdRadius = MAX_RADIUS * (f.value / maxValue);
    var circle = createCircle(1,
                              suggestdRadius < 8 ? 8 : suggestdRadius,
                              width,
                              height, 5);
    var pattern;
    var node = svg.append('g')
                  .attr('class', 'node')
                  .attr('transform',
                        'translate(' + circle[0] + ',' + circle[1] + ')')
                  .on("mouseover", function() {
                    pattern = pattern || createPattern(f.uid);
                    d3.select(this).select('circle.base')
                        .attr('fill', 'url(#img-' + f.uid + ')')
                        .transition()
                          .attr('r', MAX_RADIUS * 1.5);
                    d3.select(this).select('text')
                        .attr('class', 'text hidden');
                  })
                  .on("mouseout", function() {
                    d3.select(this).select('circle.base')
                        .transition()
                          .attr('r', circle[2])
                          .each('end', function() {
                            d3.select(this).attr('fill', null);
                            node.select('text').attr('class', 'text');
                          });
                  })
                  .style('fill', function(d) {
                    return color(f.value * 61);
                  })
                  .on("click", function() {
                    var canvas = $('#wc-canvas-canvas');
                    var ctx = canvas[0].getContext('2d');
                    ctx.clearRect(0, 0, canvas.width(), canvas.height());
                    $('#cube').addClass('loading');
                    smoothScrolling('#wordcloud-break');
                    if (listener) {
                      listener(f.uid, f.name);
                    }
                  });


    node.append('circle')
        .attr('class', 'base')
        .attr('r', 0)
        .transition()
          .attr('r', circle[2]);
    node.append("text")
        .attr('dy', ".3em")
        .attr('class', 'text')
        .style("text-anchor", "middle")
        .style("fill","black")
        .style("font-size","2px")
        .transition()
        .style("font-size", function(d) {
          return calcFontSize(container, 24, f.name, circle[2] * 2);
        })
        .text(function() {
          return (circle[2] < 12) ? '...' : f.name;
        });
  }

  function createMySelf(svg, width, height) {
    var node = svg.append('g')
              .attr('class', 'self')
              .attr('transform',
                    'translate(' + width / 2 + ',' +
                                   height / 2 + ')');
    node.append('circle')
        .attr('r', 0)
        .transition()
          .attr('r', MAX_RADIUS)
        .style('fill', 'transparent');
    quadtree.add([width / 2, height / 2, MAX_RADIUS]);
    return node;
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
    var width = container.width();
    var height = 680;
    var svg = d3.select('#friendlist').append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'bubble');
    defs = svg.append('defs');
    var rootG = svg.append('g')
                   .attr('transform',
                         'translate(' + MAX_RADIUS + ',' + MAX_RADIUS + ')');

    quadtree = d3.geom.quadtree().extent([[0, 0], [width, height]])([]);
    width -= 2 * MAX_RADIUS;
    height -= 2 * MAX_RADIUS;
    var friendCount = friends.length;
    var selfNode = createMySelf(rootG, width, height);
    d3.timer(function() {
      var f = friends[friends.length - friendCount];
      createFriendCircle(container, rootG, f, width, height, maxValue, listener);
      return !(--friendCount);
    });
  };

})();
