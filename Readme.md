## **J**ava**S**cript**T**emplate (pre-compiler)

Something like [Jammit](http://documentcloud.github.com/jammit/) but only for your Backbone templates.

This is a small library for [Node.js](http://nodejs.org) I wrote during holidays so, it's a work in progress, most likey won't work as expected.

**JST** will compile a directory full of

- [Handlebars](http://handlebarsjs.com)
- [Hogan.js](https://twitter.github.com/hogan.js)
- [Underscore](https://documentcloud.github.com/underscore)

templates into a single `templates.js` to use on the frontend

Configuration:

``` js
var jst = require('jst');
jst.compiler = 'handlebars'; // or 'underscore' (default) or 'hogan'
```

Example One-time Compile:

``` js
jst.compile(__dirname + '/templates', __dirname + '/public/javascripts/', function() {
  return console.log('recompiled ' + '/javascripts/admin/templates.js'.red);
});
```

Example directory watcher (useful in a development environment):

``` js
jst.watcher(__dirname + '/templates', __dirname + '/public/javascripts/', function() {
  return console.log('recompiled ' + '/javascripts/admin/templates.js'.red);
});
```

You can access to the template functions using the global namespace `JST`:

``` js
var teplate = JST.foo({
  template: 'context'
}, template_options);

$('#foo').htm(template);
```
## TODO

1. Write tests
2. Write more tests
3. rework the file watcher using inotify/fswatcher
4. use it daily

### Contribute

Fork the project.  
Make your feature addition or bug fix.  
Send me a pull request. Bonus points for topic branches.  
Bump the version number, if you really have to, in a separate commit.


### License

Copyright © 2011 Lorenzo Giuliani <lorenzo@frenzart.com>

jst is provided as-is under the [MIT](http://opensource.org/licenses/mit-license.html) License. For more information see LICENSE.