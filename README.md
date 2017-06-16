VR View
=======

VR View allows you to embed 360 degree VR media into websites on desktop and
mobile. For more information, please read the documentation available at
<http://developers.google.com/cardboard/vrview>.

# Building

This project uses browserify to manage dependencies and build.  Watchify is
especially convenient to preserve the write-and-reload model of development.
This package lives in the npm index.

Relevant commands:

    npm run build - builds the iframe embed and JS API (full and minified versions).
    npm run build-api - builds the JS API (full and minified versions).

    npm run build-min - builds the minified iframe embed.
    npm run build-dev - builds the full iframe embed.

    npm run build-api-min - builds the minified JS API.
    npm run build-api-dev - builds the full JS API.

    npm run watch - auto-builds the iframe embed whenever any source changes.
    npm run watch-api - auto-builds the JS API code whenever any source changes.

As of 2017/06/13, the pre-built js artifacts have been removed from source
control. You must run `npm run build` prior to trying any of the examples.

Note: you may have to install uglify-js if error "sh: uglifyjs not found":
$ npm install uglify-js -g
