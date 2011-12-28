//     (c) Lorenzo Giuliani, 2011
//     license [MIT](http://opensource.org/licenses/mit-license.html)

var fs = require('fs')
  , util = require('util')
  , vm = require('vm')
  , jst = require('../lib/jst')
  , path = require('path')
  , assert = require('assert')
  , fixture_path = path.resolve(__dirname, './fixtures')
  , output_path = path.resolve(__dirname, './output')
  , template = "Hello {{world}}!!"
  ;

// maintain Mustache-like compatability in underscore templates
jst.compilers.underscore.settings.interpolate = /\{\{([\s\S]+?)\}\}/g;

describe('jst', function () {
  describe('object', function () {
    it('should export ƒ() compile', function (done) {
      jst.should.have.ownProperty('compile');
      done();
    });
    it('should export ƒ() watcher', function (done) {
      jst.should.have.ownProperty('watcher');
      done();
    });
    it('should export a set of compilers', function (done) {
      jst.should.have.ownProperty('compilers');
      done();
    });
    it('should export a default compiler', function (done) {
      jst.should.have.ownProperty('compiler');
      done();
    });
    it('should export an extra ƒ() _walk', function (done) {
      jst.should.have.ownProperty('_walk');
      done();
    });
  });

  describe('ƒ() _walk', function () {
    describe('output', function () {
      it('should be async', function (done) {
        jst._walk(fixture_path, done);
      });
      it('should return an Array', function (done) {
        jst._walk(fixture_path, function (e, data) {
          data.should.be.an.instanceof(Array);
          done(e, data);
        });
      });
    });
    it('should walk relative paths by process.cwd()', function (done) {
      jst._walk('./test/fixtures', done);
    });
    it('should walk and resolve relative paths by process.cwd()', function (done) {
      jst._walk('./test/fixtures', function(e, data){
        data[0].should.match(new RegExp(fixture_path));
        done(e, data);
      });
    });
  });

  describe('ƒ() compile', function () {
    it('should compile a directory', function (done) {
      jst.compile(fixture_path, output_path, function() {
        fs.stat(output_path+'/templates.js', done)
      });
    });
  });

  describe('underscore templates', function () {
    it('should be the default compiler', function () {
      jst.compiler.should.be.equal('underscore');
    });
    
    it('should compile and work as expected', function(done){
      jst.compile(fixture_path, output_path, function () {
        var context = vm.createContext({});
        vm.runInContext(fs.readFileSync(output_path+'/templates.js'), context, output_path+'/underscore2.vm');

        assert.equal(typeof context.JST === 'object', true);

        context.JST['first']({foo: '__foo__'}).should.match(/\_\_foo\_\_/);
        context.JST['nes/ted']({foo: '__foo__'}).should.match(/\_\_foo\_\_/);
        done();
      });
    });
  });
});
