define(function (require) {
  'use strict';

  var getReplacePattern = require('./replacePatterns');

  function sanitize(doc, useTab, units) {
    var line, pattern, match;
    var lineIndex = 0;
    var wsPattern = getReplacePattern(useTab, units);

    while ((line = doc.getLine(lineIndex)) !== undefined) {
      //trim trailing whitespaces
      pattern = /[ \t]+$/g;
      match = pattern.exec(line);
      if (match) {
        doc.replaceRange('', {
            line: lineIndex,
            ch: match.index
          }, {
            line: lineIndex,
            ch: pattern.lastIndex
          });
      }

      match = wsPattern.exec(line);
      if (match.replaceWith) {
        doc.replaceRange(match.replaceWith, {
            line: lineIndex,
            ch: match.start
          }, {
            line: lineIndex,
            ch: match.end
          });
      }

      lineIndex++;
    }

    //ensure newline at the end of file
    line = doc.getLine(lineIndex - 1);
    var lastN = line.slice(-1);
    if (line !== undefined && line.length > 0 && lastN !== '\n') {
      doc.replaceRange('\n', {
        line: lineIndex,
        ch: lastN
      });
    }
  }


  sanitize.verify = function(doc, useTab, units) {
    var line, pattern;
    var lineIndex = 0;
    var wsPattern = getReplacePattern(useTab, units);

    while ((line = doc.getLine(lineIndex)) !== undefined) {
      pattern = /[ \t]+$/g;

      if ((!!pattern.exec(line)) || (!!wsPattern.exec(line).replaceWith)) {
        return false;
      }

      lineIndex++;
    }

    //ensure newline at the end of file
    line = doc.getLine(lineIndex - 1);
    var lastN = line.slice(-1);
    if (line !== undefined && line.length > 0 && lastN !== '\n') {
      return false;
    }

    return true;
  };

  return sanitize;
});
