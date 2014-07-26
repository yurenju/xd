(function() {

  var MAX_RADIUS = 64;
  var quadtree;
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

  function createFriendCircle(container, svg, f, width, height, maxValue) {
    var suggestdRadius = MAX_RADIUS * (f.value / maxValue);
    var circle = createCircle(1,
                              suggestdRadius < 8 ? 8 : suggestdRadius,
                              width,
                              height, 5);
    var node = svg.append('g')
                  .attr('class', 'node')
                  .attr('transform',
                        'translate(' + circle[0] + ',' + circle[1] + ')')
                  .on("mouseover", function() {
                    d3.select(this).style("fill", "gold");
                  })
                  .on("mouseout", function() {
                    d3.select(this).style("fill", function() {
                      return color(f.value * 112);
                    });
                  })
                  .style('fill', function(d) {
                    return color(f.value * 61);
                  })
                  .on("click", function() {
                    if (listener) {
                      listener(f.id, f.name);
                    }
                  });
    node.append('circle')
        .attr('r', 0)
        .transition()
          .attr('r', circle[2]);
    node.append("text")
        .attr('dy', ".3em")
        .style("text-anchor", "middle")
        .style("fill","black")
        .style("font-size", function(d) {
          var fontSize = 24;
          var fontFamily = container.css('font-family');
          var target = (circle[2] + 20);
          while (textWidth(f.name, fontSize + 'px', fontFamily) > target &&
                 fontSize > 3) {
            fontSize--;
          }
          return fontSize + 'px';
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
                .attr('class', 'bubble')
                .append('g')
                  .attr('transform',
                        'translate(' + MAX_RADIUS + ',' + MAX_RADIUS + ')');
    console.log(width, height);
    quadtree = d3.geom.quadtree().extent([[0, 0], [width, height]])([]);
    width -= 2 * MAX_RADIUS;
    height -= 2 * MAX_RADIUS;
    var friendCount = friends.length;
    var selfNode = createMySelf(svg, width, height);
    d3.timer(function() {
      var f = friends[friends.length - friendCount];
      createFriendCircle(container, svg, f, width, height, maxValue);
      return !(--friendCount);
    });
  };

})();