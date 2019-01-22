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

describe('extractFileName()', function () {
    context('without arguments', function () {
        it('should throw error', function () {
            (function (){util.extractFileName()}).should.throw();
        })
    });

    context('with arguments', function () {
        it('should return the filename given a path', function () {
            util.extractFileName("./Test/path/file.ext").should.equal("file.ext");
        });
        it('should return filename given a filename', function () {
            util.extractFileName('file.ext').should.equal('file.ext');
        });
        it('should return empty string given directory path', function () {
            util.extractFileName("./test/path/dir/").should.equal('');
        });
    });
});

describe('extractFileNameWithoutExtension', function () {
    context('without arguments', function () {
        it('should throw an error', function () {
            (function () {
                util.extractFileNameWithoutExtension();
            }).should.throw();
        });
    });

    context('with arguments', function () {
        it('should return the filename to a given file path without extension', function () {
            util.extractFileNameWithoutExtension("./test/path/dir/file.ext").should.equal("file");
        });
        it('should return the filename without extension given just a filename', function () {
            util.extractFileNameWithoutExtension("file.ext").should.equal("file");
        });
        it('should return empty string given just a filename without extension', function () {
            util.extractFileNameWithoutExtension("file").should.equal("");
        });
    })
});