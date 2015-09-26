iGotTime 
======

A super nice `angular js (ES6)` `timer`.

##How to use

*DEVELOPEMENT/DEMO* :
- Clone or download
- *if you don't have jspm : `npm install jspm -g`*
- `npm install`
- `jspm install`
- `gulp`

*PRODUCTION (or just want a simple js file)* :
- `gulp jspmBuild:sfx` (or `gulp jspmBuild:sfx:min` for minified version)
- get `iGotTime.js` (or `iGotTime.min.js`) file in ./dist directory
- add it in a script tag as usual.


##Note : JSPM bundle sfx and external dependencies 

> When need to `Bundle sfx` and don't want to include external dependencies (*example you write a shared angular module*).

*Just tell SystemJS to wait for these dependecies :*

```javascript
//don't "jspm install angular" 

//But :
//file : adapters/jquery.js
adapters/angular.js
export default window.angular;


//file : config.js
System.config({
  map: {
    "jquery": "adapters/angular"
  }
});

//then don't forget to add angular in script tag in your html
```

##Histo

**14 September 2015** : Initial module.

>More content coming soon (*it just starts*).

 
##License

The MIT License (MIT)

Copyright (c) 2015 Erwan DATIN

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

