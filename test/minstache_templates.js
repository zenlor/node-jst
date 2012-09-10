var fs = require('fs')
  , util = require('util')
  , vm = require('vm')
  , jst = require('../lib/jst')
  , path = require('path')
  , assert = require('assert')
  , fixture_path = path.resolve(__dirname, './fixtures')
  , output_path = path.resolve(__dirname, './output')
  ;

describe('minstache templates', function () {

  before(function(){
    jst.compiler = 'minstache';
  });

  it('should be the active compiler', function () {
    jst.compiler.should.be.equal('minstache');
  });
  
  it('should compile and work as expected', function(done){
    jst.compile(fixture_path, output_path, function () {
      var context = vm.createContext({});
      vm.runInContext(fs.readFileSync(output_path+'/templates.js'), context, output_path+'/minstache.vm');

      assert.equal(typeof context.JST === 'object', true);

      context.JST['first']({foo: '__foo__'}).should.match(/\_\_foo\_\_/);
      context.JST['nes/ted']({foo: '__foo__'}).should.match(/\_\_foo\_\_/);
      done();
    });
  });
});