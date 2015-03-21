var require;
require = (function() {
  var importer = bitimports.config({
    "baseUrl": "../",
    "paths": {
      "mocha": "../node_modules/mocha/mocha",
      "chai": "../node_modules/chai/chai"
    },
    "shim": {
      "mocha": {
        "exports": "mocha"
      }
    },
    "transforms": [{
      name: "cantransform",
      handler: cantransform,
      ignore:["chai"]
    }]
  });

  /**
   * Simple filter for excluding particular modules from being processed by the transformation pipeline.
   */
  function cantransform(moduleMeta) {
    var ignoreList = this.ignore;
    var i, length;

    if (ignoreList && ignoreList.length) {
      for (i = 0, length = ignoreList.length; i < length; i++) {
        if (ignoreList[i].indexOf(moduleMeta.name) !== -1) {
          return false;
        }
      }
    }
  }

  return importer.require;
})();
