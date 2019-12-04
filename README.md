# jquery.resize

[![npm](https://img.shields.io/badge/npm-1.1.0-blue.svg)](https://www.npmjs.com/package/jquery.resize)
![bower](https://img.shields.io/badge/bower-1.1.0-yellow.svg)

Custom resize jQuery event for element. The code  use ResizeObserver if browser
support it (right now only Chrome/Chromium) or sentinel iframe.

The plugin was created for [jQuery Terminal](https://github.com/jcubic/jquery.terminal).


# Usage

You can use it as jQuery plugin:

```javascript
$('element').resizer(function() {
    var $this = $(this);
    console.log($this.width(), $this.height());
});
// if handler is omitted all event handlers are removed
$('element').resizer('unbind', handler);
```

or as normal event using on/off:

```javascript
$('element').on('resize', function() {
    var $this = $(this);
    console.log($this.width(), $this.height());
});

$('element').off('resize', handler);
```

# License

Copyright (c) 2018-2019 [Jakub T. Jankiewicz](https://jcubic.pl/jakub-jankiewicz)

Released under [MIT](http://opensource.org/licenses/MIT) license
