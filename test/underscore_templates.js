var fs = require('fs')
  , util = require('util')
  , vm = require('vm')
  , jst = require('../lib/jst')
  , path = require('path')
  , assert = require('assert')
  , fixture_path = path.resolve(__dirname, './fixtures')
  , output_path = path.resolve(__dirname, './output')
  ;

describe('underscore templates', function () {
  it('should be the default compiler', function () {
    jst.compiler.should.be.equal('underscore');
  });

  it('should have custom settings', function () {
    jst.compilers.underscore.settings.should.be.a('object');
    jst.compilers.underscore.settings.interpolate.should.be.an.instanceof(RegExp);
    jst.compilers.underscore.settings.evaluate.should.be.an.instanceof(RegExp);
  });
  
  it('should compile and work as expected', function(done){
    jst.compile(fixture_path, output_path, function () {
      var context = vm.createContext({});
      vm.runInContext(fs.readFileSync(output_path+'/templates.js'), context, output_path+'/underscore.vm');

      assert.equal(typeof context.JST === 'object', true);

      context.JST['first']({foo: '__foo__'}).should.match(/\_\_foo\_\_/);
      context.JST['nes/ted']({foo: '__foo__'}).should.match(/\_\_foo\_\_/);
      done();
    });
  });
});