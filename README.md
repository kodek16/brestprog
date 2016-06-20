# brestprog

Lections on sport programming topics currently hosted at [neocities](http://brestprog.neocities.org/).

The site is undergoing (slow) rewrite, the major points are automatic tests for code listings
and the addition of Java and Python. There will be no deploys until this rewrite is complete,
but you can check out new features by building the site locally.

The old code that is currently deployed is located under `old` folder. The new code uses Gulp for building
and some hand-written Node scripts for testing. Lections are in the `lections` folder, tested listings - the `listings`
folder.

## Building

To build this site you need to have Node, npm and Gulp installed globally. Just run `npm install` to download
dependencies and `gulp run` to build and run a local webserver at port 8000.
