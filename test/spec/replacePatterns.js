var replacePatterns = require('../../src/replacePatterns');

describe("Pattern Suites", function() {

  describe("When the pattern is 2 spaces in a tab", function() {
    var pattern;
    beforeEach(function() {
      pattern = new replacePatterns.TabConvertion(2);
    });

    describe("And there are 2 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(2, 1);
      });

      it("then result is 2 tabs", function() {
        expect(result).to.equal('\t\t');
      });
    });

    describe("And there are 3 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(3, 1);
      });

      it("then result is 2 tabs and 1 space", function() {
        expect(result).to.equal('\t\t ');
      });
    });

    describe("And there are 4 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(4, 1);
      });

      it("then result is 3 tabs", function() {
        expect(result).to.equal('\t\t\t');
      });
    });

    describe("And there are 5 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(5, 1);
      });

      it("then result is 3 tabs and 1 space", function() {
        expect(result).to.equal('\t\t\t ');
      });
    });
  });

  describe("When the pattern is 4 spaces in a tab", function() {
    var pattern;
    beforeEach(function() {
      pattern = new replacePatterns.TabConvertion(4);
    });

    describe("And there are 2 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(2, 1);
      });

      it("then result is 1 tab and 2 spaces", function() {
        expect(result).to.equal('\t  ');
      });
    });

    describe("And there are 3 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(3, 1);
      });

      it("then result is 1 tab and 3 spaces", function() {
        expect(result).to.equal('\t   ');
      });
    });

    describe("And there are 5 spaces and 1 tab", function() {
      var result;
      beforeEach(function() {
        result = pattern.getIndentation(5, 1);
      });

      it("then result is 2 tab and 1 spaces", function() {
        expect(result).to.equal('\t\t ');
      });
    });
  });

  describe("When string is 4 spaces", function() {
    var input;
    beforeEach(function() {
      input = '    ';
    });

    describe("and it is replaced with 1 space tabs", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 1);
        output = pattern.exec(input);
      });

      it ("then output is 4 tabs", function() {
        expect(output.replaceWith).to.equal('\t\t\t\t');
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });

    describe("and it is replaced with 2 space tabs", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 2);
        output = pattern.exec(input);
      });

      it ("then output is 2 tabs", function() {
        expect(output.replaceWith).to.equal('\t\t');
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });

    describe("and it is replaced with 4 space tabs", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 4);
        output = pattern.exec(input);
      });

      it ("then output is 1 tabs", function() {
        expect(output.replaceWith).to.equal('\t');
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });

    describe("and it is replaced with 2 spaces", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(false, 2);
        output = pattern.exec(input);
      });

      it ("then output is not changed", function() {
        expect(output.replaceWith).to.equals(undefined);
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });
  });

  describe("When string is 4 tabs", function() {
    var input;
    beforeEach(function() {
      input = '\t\t\t\t';
    });

    describe("and it is replaced with 1 space", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(false, 1);
        output = pattern.exec(input);
      });

      it ("then output is 4 spaces", function() {
        expect(output.replaceWith).to.equal('    ');
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });

    describe("and it is replaced with 2 spaces", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(false, 2);
        output = pattern.exec(input);
      });

      it ("then output is 8 spaces", function() {
        expect(output.replaceWith).to.equal('        ');
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });

    describe("and it is replaced with 4 spaces", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(false, 4);
        output = pattern.exec(input);
      });

      it ("then output is 16 spaces", function() {
        expect(output.replaceWith).to.equal('                ');
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });

    describe("and it is replaced with 4 tabs", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 1);
        output = pattern.exec(input);
      });

      it ("then output is is unchanged", function() {
        expect(output.replaceWith).to.equal(undefined);
      });

      it ("then end is 4", function() {
        expect(output.end).to.equal(4);
      });
    });
  });

  describe("When the input has 2 tabs and 1 space in the middle", function() {
    var input;
    beforeEach(function() {
      input = '\t \t';
    });

    describe("and the space is replaced with a 1 space tab", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 1);
        output = pattern.exec(input);
      });

      it ("then output is 3 tabs", function() {
        expect(output.replaceWith).to.equal('\t\t\t');
      });
    });

    describe("and the space is replaced with a 2 space tab", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 2);
        output = pattern.exec(input);
      });

      it ("then output is 2 tabs 1 space", function() {
        expect(output.replaceWith).to.equal('\t\t ');
      });
    });
  });

  describe("When the input has 4 tabs, starting with 1 space with 2 other spaces interleaved", function() {
    var input;
    beforeEach(function() {
      input = ' \t \t \t\t';
    });

    describe("and the spaces are replaced with a 1 space tab", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 1);
        output = pattern.exec(input);
      });

      it ("then output is 7 tabs", function() {
        expect(output.replaceWith).to.equal('\t\t\t\t\t\t\t');
      });
    });

    describe("and the spaces are replaced with a 2 space tab", function() {
      var pattern, output;
      beforeEach(function() {
        pattern = replacePatterns(true, 2);
        output = pattern.exec(input);
      });

      it ("then output is 2 tabs 1 space", function() {
        expect(output.replaceWith).to.equal('\t\t\t\t\t ');
      });
    });
  });
});
