define(function (require) {
  'use strict';

  var getReplacePattern = require('./replacePatterns');


  function sanitize(doc, settings) {
    var line, pattern, match;
    var lineIndex = 0;
    var wsPattern = getReplacePattern(settings);
    var hasChanged = 0;

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

        hasChanged++;
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

        hasChanged++;
      }

      lineIndex++;
    }

    //ensure newline at the end of file
    if (settings.addNewLine) {
      line = doc.getLine(lineIndex - 1);
      var lastN = line.slice(-1);
      if (line !== undefined && line.length > 0 && lastN !== '\n') {
        doc.replaceRange('\n', {
          line: lineIndex,
          ch: lastN
        });

        hasChanged++;
      }
    }

    return !!hasChanged;
  }


  sanitize.verify = function(doc, settings) {
    var line;
    var lineIndex = 0;
    var wsPattern = getReplacePattern(settings);

    while ((line = doc.getLine(lineIndex)) !== undefined) {
      if (/[ \t]+$/g.exec(line) || wsPattern.exec(line).replaceWith) {
        return false;
      }

      lineIndex++;
    }

    if (settings.addNewLine) {
      line = doc.getLine(lineIndex - 1);
      var lastN = line.slice(-1);
      if (line !== undefined && line.length > 0 && lastN !== '\n') {
        return false;
      }
    }

    return true;
  };


  return sanitize;
});
