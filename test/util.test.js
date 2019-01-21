const util = require('../Resources/Scripts/util');
const should = require('chai').should();

describe('randomStringGenerator()', function() {

    context('without arguments', function() {
        it('should return empty String', function() {
            (function(){util.randomStringGenerator();}).should.throw();
        });
    });

    context('with length arguments', function() {
        it('should return string with length given in argument', function() {
            util.randomStringGenerator(15).length.should.equal(15);
        });

        it('should return string with length of first argument when more than one argument is passed', function() {
            util.randomStringGenerator(5,27).length.should.equal(5);
        });

        it('should throw an error if no number is passed', function() {
            (function(){util.randomStringGenerator("wurst");}).should.throw();
        });
    });
});