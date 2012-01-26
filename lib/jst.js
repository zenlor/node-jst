//     node-jsc 0.0.1-alpha1
//     (c) Lorenzo Giuliani, 2011
//     license [MIT](http://opensource.org/licenses/mit-license.html)

var fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn
  , _ = require('underscore')
  , jst
  , compilers = {};

// **JST** will compile a directory full of [Handlebars](http://handlebarsjs.com),
// [Hogan.js](https://twitter.github.com/hogan.js) or
// [Underscore](https://documentcloud.github.com/underscore) templates into a
// single `templates.js` to use on the frontend 
//
// **NOTE** all files must have `.html` extension
//
// ## Configuration
//
//     var jst = require('jst');
//     jst.compiler = 'handlebars'; // or 'underscore' (default) or 'hogan'
//
// ## Example One-time Compile
// 
//     jst.compile(__dirname + '/templates', __dirname + '/public/javascripts/', function() {
//       return console.log('recompiled ' + '/javascripts/admin/templates.js'.red);
//     });
// 
// ## Example file Watcher
// 
//     jst.watcher(__dirname + '/templates', __dirname + '/public/javascripts/', function() {
//       return console.log('recompiled ' + '/javascripts/admin/templates.js'.red);
//     });
// 
//  this should not be used in a production environment
//
//     app.configure('production', function() {
//       jst.compile(__dirname + '/templates', __dirname + '/../public/javascripts/admin/', function() {
//         return console.log('recompiled ' + '/javascripts/admin/templates.js'.red);
//       });


// mustache-like underscore templates
_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
, evaluate: /\{\%(.+?)\%\}/g
};

// compilers template
compilers.std = {
  head: "(function(){this.JST || (this.JST = {});"
, foot: "}).call(this);"
};
compilers.handlebars = {
  compiler: function (file) {
    var handlebars = require('handlebars') || require('hbs').handlebars;
    return handlebars.precompile(fs.readFileSync(file, 'utf8')).toString();
  }
, partial: _.template(
    "Handlebars.registerPartial('{{ name }}', Handlebars.template({{ tpl }}));"
  )
, tpl: _.template(
      "this.JST['{{ name }}'] = function(context) { return HandlebarsTemplates['{{ name }}'](context); };"+
      "this._HandlebarsTemplates['{{ name }}'] = Handlebars.template({{ tpl }});"
  )
, head: compilers.std.head + "this._HandlebarsTemplates || (this._HandlebarsTemplates = {});"
, foot: compilers.std.foot
};
compilers.underscore = {
  settings: {
    evaluate:    /<%([\s\S]+?)%>/g
  , interpolate: /<%=([\s\S]+?)%>/g
  }
, compiler: function(file) {
    // stolen from Jammit
    return (
      new Function(
        'obj',
        'var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push(\'' +
        fs.readFileSync(file, 'utf8')
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(this.settings.interpolate, function (match, code) {
            return "'," + code.replace(/\\'/g, "'") + ",'";
          })
          .replace(this.settings.evaluate, function (match, code) {
            return "');" +
              code
                .replace(/\\'/g, "'")
                .replace(/[\r\n\t]/g, ' ') +
                "__p.push('";
          })
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t') +
        "');}return __p.join('');"))
        .toString()
        .replace(' anonymous(obj)', '(obj)');
  }
, partial: function(ctx) { return this.tpl(ctx); }
, tpl: _.template("this.JST['{{ name }}']={{tpl}};")
, head: compilers.std.head
, foot: compilers.std.foot
};
compilers.hogan = {
  compiler: function(file) {
    var Hogan = require('hogan.js'), c, text;
    text = fs.readFileSync(file, 'utf8')
      .replace(/\r/g, '')
      .replace(/\n/g, '')
      .replace(/\t/g, '');
    c = Hogan.compile(
        text
      , {asString: true});
    return {text: text, r: c};
  }
, partial: function(ctx) { return this.tpl(ctx); }
, tpl: _.template(
    "this._JST['{{name}}'] = new HoganTemplate();"
  + "this._JST['{{name}}'].r = {{tpl.r}};"
  + "this.JST['{{name}}'] = function(cx,p){return _JST['{{name}}'].r(cx,p)};\n"
  )
, head: compilers.std.head + 'this._JST||(this._JST={});'
, foot: compilers.std.foot
}

compilers.whiskers = {
  compiler: function(file) {
    var Whiskers = require('whiskers'), tpl, text;
    text = fs.readFileSync(file, 'utf8')
      .replace(/\r/g, '')
      .replace(/\n/g, '')
      .replace(/\t/g, '');

    tpl = Whiskers.compile(text).toString();
    return tpl;
  }
, partial: function(ctx) { return this.tpl(ctx); }
, tpl: _.template(
  + "this.JST['{{name}}'] = {{tpl}};\n"
  )
, head: compilers.std.head + '\
    function g(obj, key) { \
      var accessor = key.split("."); \
      for (var i=0, l=accessor.length; i<l; i++) { \
        obj = obj[accessor[i]]; \
        if (!obj) break; \
      } \
      if (!obj) obj = ""; \
      return obj; \
    };'
, foot: compilers.std.foot
}

jst = module.exports = {
  compile: function(dir, output, callback) {
    var resolved_path = path.resolve(dir)
      , resolved_output = path.resolve(output);

    walk(resolved_path, function(err, templates) {
      var compiled, name, t, tpl, _i, _len;
      compiled = new Array();
      tpl = new String();
      name = new String();

      compiled.push(jst.compilers[jst.compiler].head);
      templates.forEach(function (t) {
        tpl = jst.compilers[jst.compiler].compiler(t);
        name = t.replace(resolved_path, '')
                .replace(/^\/+/, '')
                .replace(/\.html$/, '');

        if (/^\_/.test(name)) {
          compiled.push(jst.compilers[jst.compiler].partial({ name: name.substring(1), tpl: tpl }));
        } else {
          compiled.push(jst.compilers[jst.compiler].tpl({ name: name, tpl: tpl }));
        }
      });

      compiled.push(jst.compilers[jst.compiler].foot);
      fs.writeFile(resolved_output + "/templates.js", compiled.join(''), function(err) {
        if (err) throw err;
        if (typeof callback === "function") return callback(err);
      });
    });
  }
, watcher: function(dir, output, callback) {
    walk(dir, function (e, files) {
      if (e) throw e;
      _.each(files, function (f) {
        fs.watch(f, function(event, filename) {
          jst.compile(dir, output, callback);
        })
      });
    });
  }

, compilers: compilers
, compiler: 'underscore'
};


// according to my [small test](https://gist.github.com/1521429) ... spanw('find'...) wins
function walk (dir, cb, filter, type) {
  filter = filter || '*.html';
  type = type || 'f';
  dir = path.resolve(process.cwd(), dir);
  var find = spawn('find', [dir, '-name', filter, '-type', type, '-print'])
    , output = [];

  find.stdout.on('data', function (data) {
    if (/^execvp\(\)/.test(data)) {
      return cb(new Error('Failed to start child process.'));
    } else {
      data.toString().split(/\n/).forEach(function (str) {
        if (str.length > 1) output.push(str);
      });
    }
  });
  find.stdout.on('end', function () {
    cb(null, output);
  });
  find.on('exit', function (code) {
    if (code > 0) {
      return cb(new Error('Process failed with code: ' + code));
    }
  });
}
// this function can be useful outside
module.exports._walk = walk;
