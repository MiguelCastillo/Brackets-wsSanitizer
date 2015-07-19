define(function () {
  'use strict';

  var Characters = {
    SPACE: ' ',
    TAB: '\t'
  };


  function TabConvertion(units) {
    this.units = units;
  }


  TabConvertion.prototype.getIndentation = function (wsCount, tabCount) {
    if (!wsCount) {
      return;
    }

    var newTabs = Math.floor(wsCount / this.units);
    var totalTabs = tabCount + newTabs;
    var totalSpaces = wsCount - (newTabs * this.units);
    var indentation = totalTabs ? new Array(totalTabs + 1).join(Characters.TAB) : '';
    indentation += totalSpaces ? new Array(totalSpaces + 1).join(Characters.SPACE) : '';
    return indentation;
  };


  function SpaceConvertion(units) {
    this.units = units;
  }


  SpaceConvertion.prototype.getIndentation = function (wsCount, tabCount) {
    if (!tabCount) {
      return;
    }

    var newSpaces = wsCount + (tabCount * this.units);
    var indentation = new Array(newSpaces + 1).join(Characters.SPACE);
    return indentation;
  };


  function ReplacePattern(useTab, units) {
    this.pattern = useTab ? (new TabConvertion(units)) : (new SpaceConvertion(units));
  }


  ReplacePattern.prototype.exec = function (line) {
    var pattern = this.pattern;
    var wsCount = 0, tabCount = 0;
    var character, i, length;

    for (i = 0, length = line.length; i < length; i++) {
      character = line[i];
      if (character === ' ') {
        wsCount++;
      }
      else if (character === '\t') {
        tabCount++;
      }
      else {
        break;
      }
    }

    var start = 0;
    var end   = wsCount + tabCount;
    var replaceWith = pattern.getIndentation(wsCount, tabCount);

    if (end && replaceWith && line.substring(0, end) === replaceWith) {
      replaceWith = false;
    }

    return {
      replaceWith: replaceWith,
      start: start,
      end: end
    };
  };


  ReplacePattern.create = function (settings) {
    return new ReplacePattern(settings.useTab, settings.units);
  };


  ReplacePattern.create.TabConvertion   = TabConvertion;
  ReplacePattern.create.SpaceConvertion = SpaceConvertion;
  return ReplacePattern.create;
});
