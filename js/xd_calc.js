'use strict';

var xdRegexes = {
  'XD': /XD+/gi,
  '^_^': /\^_+\^/g,
  '>///<': />\/\/\/+</g,
  'T_T': /T_+T/g,
  'cool': /coo+l/gi,
  ':)': /:\)+/g,
  '8-)': /8-\)+/g,
  ';)': /:\)+/g,
  ':D': /:D+/g,
  ':d': /:d+/g,
  ':p': /:p+/gi,
  'ha': /(ha+)(ha)*/gi,
  '哈': /哈+/g,
  '謝': /謝+/g,
  '啊': /[啊阿]+/g,
  '呵': /呵+/g,
  '囧': /囧+/g,
  '科': /科+/g,
  'wwww': /wwww+/gi,
  'Orz': /[Oo囧]rz+/g,
  '\0/': /\[Oo0]\//g,
  '++': /\++/g,
  '-_-': /-_+-/g,
  '@@': /@_*@/g,
  '!!': /!!+/g,
  'kerker': /(ker)(ker)+/gi,
  'der': /der/g,
  'q_q': /q_*q/g
};

(function(exports) {

  function calculateXD(text) {
    var xDegrees = [];
    var matchedResult;
    var processed = text;
    for(var key in xdRegexes) {
      matchedResult = matchAndCalculate(processed, key, xdRegexes[key]);
      processed = matchedResult.processed;
      xDegrees[xDegrees.length] = [key, matchedResult.score];
    }
    return {
      'processed': processed,
      'scores': xDegrees
    };
  }

  function matchAndCalculate(text, base, regex) {
    var matches = text.match(regex);
    var score = 0;
    if (matches) {
      score = matches.length
      matches.forEach(function(m) {
        score += (m.length - base.length);
      });
    }
    return {
             'processed': text.replace(regex, ''),
             'score': score
           };
  }

  exports.calculateXD = calculateXD;
})(this);
