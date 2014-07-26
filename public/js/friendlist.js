(function() {

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

  window.showFriendList = function(friends, listener) {
    friends.forEach(function(p) {
      p.value = p.mutual_friend_count + 1;
    });
    var container = $('#friendlist');
    container.html('');
    var color = d3.scale.category20c();
    var width = container.width();
    var height = 680;
    var svg = d3.select('#friendlist').append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'bubble');
    var bubble = d3.layout.pack().sort(null).size([width, height]).padding(1.5);
    var node = svg.selectAll(".node")
        .data(bubble.nodes({children: friends})
        .filter(function(d) { return !d.children; }))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
      .style("fill", function(d) {
        return color(d.value);
      }).on("mouseover", function(d,i) {
        d3.select(this).style("fill", "gold");
        console.log(" "+d.name+"<br>"+d.value+" ",d.x+d3.mouse(this)[0]+50,d.y+d3.mouse(this)[1],true);
      }).on("mouseout", function() {
        d3.select(this).style("fill", function(d) { return color(d.value * 112); });
        console.log(" mouse out ",0,0,false);
      }).on("click", function(d, i) {
        if (listener) {
          listener(d.id, d.name);
        }
      });

    node.append("circle").attr("r", function(d) { return d.r; });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("fill","black")
        .style("font-size", function(d) {
          var fontSize = 24;
          var fontFamily = container.css('font-family');
          while (textWidth(d.name, fontSize + 'px', fontFamily) > (d.r + 20) &&
                 fontSize > 3) {
            fontSize--;
          }
          return fontSize + 'px';
        })
        .text(function(d) {
          return (d.r < 12) ? '...' : d.name;
        });
  };

})();