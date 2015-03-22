define(function (require) {
  'use strict';

  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var SPACE_UNITS        = "spaceUnits";
  var TAB_SIZE           = "tabSize";
  var USE_TAB_CHAR       = "useTabChar";
  var getReplacePattern  = require('./replacePatterns');

  function sanitize(doc) {
    var line, pattern, match;
    var lineIndex          = 0;
    var preferencesContext = doc.file.fullPath;
    var useTabChar         = PreferencesManager.get(USE_TAB_CHAR, preferencesContext);
    var tabSize            = PreferencesManager.get(TAB_SIZE, preferencesContext);
    var spaceUnit          = PreferencesManager.get(SPACE_UNITS, preferencesContext);
    var wsPattern          = getReplacePattern(useTabChar, useTabChar ? tabSize : spaceUnit);

    while ((line = doc.getLine(lineIndex)) !== undefined) {
      //trim trailing whitespaces
      pattern = /[ \t]+$/g;
      match = pattern.exec(line);
      if (match) {
        doc.replaceRange(
          '', {
            line: lineIndex,
            ch: match.index
          }, {
            line: lineIndex,
            ch: pattern.lastIndex
          }
        );
      }

      match = wsPattern.exec(line);
      if (match.replaceWith) {
        doc.replaceRange(
          match.replaceWith, {
            line: lineIndex,
            ch: match.start
          }, {
            line: lineIndex,
            ch: match.end
          }
        );
      }

      lineIndex += 1;
    }

    //ensure newline at the end of file
    line = doc.getLine(lineIndex - 1);
    if (line !== undefined && line.length > 0 && line.slice(-1) !== '\n') {
      doc.replaceRange(
        '\n', {
          line: lineIndex,
          ch: line.slice(-1)
        }
      );
    }
  }

  return sanitize;
});
