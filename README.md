trojanda-book-reader
====================

Trojanda Book Reader — a ePub reader application. It's written on Electron with usages TypeScript.

![Trojanda Book Reader](Trojanda-book-reader_dark-mode_at_2020-06-13_22-32-39.png)

![Trojanda Book Reader](Trojanda-book-reader_light-mode_2020-06-13_22-31-22.png)

INSTALLATION
------------
```
git clone git@github.com:Victorq10/trojanda-book-reader.git
cd trojanda-book-reader
npm install
npm run build
npm run start
```

WORK IN THE VISUAL STUDIO CODE IDE
----------------------------------
```
cd trojanda-book-reader
code trojanda-book-reader.code-workspace 
```
Open terminal in the Code and run a command to compile *.ts files on save:
```
npm run watch
```

Open Debuger drop-down menu and select `Debug Main Process (trojanda-book-reader)`

USED VERSIONS
-------------
```
~$ node --version
v10.20.1

~$ sqlite3 --version
3.31.1 2020-01-27 19:55:54 3bfa9cc97da10598521b342961df8f5f68c7388fa117345eeb516eaa837balt1

~$ code --version
1.46.0
a5d1cc28bb5da32ec67e86cc50f84c67cc690321
x64
```

Possible version incompobility
------------------------------
if you have trable with `better-sqlite3` version compatability with `electron`.
You need to run a command
> $(npm bin)/electron-rebuild

##### Some details from the https://www.npmjs.com/package/better-sqlite3
npm install better-sqlite3                     # https://github.com/JoshuaWise/better-sqlite3/blob/HEAD/docs/troubleshooting.md
npm install --save-dev electron-rebuild        # https://www.npmjs.com/package/electron-rebuild
$(npm bin)/electron-rebuild

VESUAL STUDIO CODE CONFIGURATION
--------------------------------
##### Command line tools:
* sqlite3 — install with synaptic package manager in the Ubuntu 20.04.

Press `ctrl+shift+P` in the `Visual Studio Code` and start to type `sqlite` than select `SQLite: Open Database`. 
Select `testBook.db` or `Books.db` from the drop-down. Repeate for anothor database.
An `SQLITE EXPLORER` will be appear in the left side of you `Visual Studio Code` in the `Explorer`.

##### Visual Studio Code plugins:
* A “[formate: CSS/LESS/SCSS formatter](https://marketplace.visualstudio.com/items?itemName=MikeBovenlander.formate)” plugin to format css files.
* A [SQLite](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) 
  plugin to view SQLite database (it require `sqlite3` command line tool).

NAME CONVENTIONS
================
snale cace (or Underscope) is used for variable, instances, parameters and function names. 

CamelCaces is used for Types, Classes, Enums etc.

See: [Snake case](https://en.wikipedia.org/wiki/Snake_case) on Wikipedia. and [Python: Naming Conventions](https://www.python.org/dev/peps/pep-0008/#naming-conventions)

At least one study found that readers can recognise snake case values more quickly than camelCase:
[Sharif, Bonita; Maletic, Jonathan I. (2010). "An Eye Tracking Study on camelCase and under_score Identifier Styles"](http://www.cs.kent.edu/~jmaletic/papers/ICPC2010-CamelCaseUnderScoreClouds.pdf)

RESEARCH INFORMATION
====================

There are some result of investigation about packages needed for `Trojanda Book Reader` project.

ZIP PACKAGES
------------
adm-zip
jsZip
UnZip

hejoshwolfe/yauzl           — https://github.com/thejoshwolfe/yauzl
antelle/node-stream-zip     — https://github.com/antelle/node-stream-zip 
ZJONSSON/node-unzipper      — https://github.com/ZJONSSON/node-unzipper
EvanOxfeld/node-unzip       — https://github.com/EvanOxfeld/node-unzip
Stuk/jszip                  — https://github.com/Stuk/jszip
kriskowal/zip               — https://github.com/kriskowal/zip

see [https://blog.csdn.net/meimeilive/article/details/103150412]
and [https://github.com/open-xml-templating/pizzip/blob/master/documentation/howto/read_zip.md]
import PizZip from 'pizzip'
import JSZipUtils from 'jszip-utils'

DOM PACKAGES
------------
https://github.com/cheeriojs/cheerio
https://github.com/fb55/DomHandler          https://www.npmjs.com/package/domhandler
https://github.com/fb55/domutils
https://github.com/fb55/htmlparser2         https://www.npmjs.com/package/htmlparser2
https://github.com/stfsy/node-html-light    https://www.npmjs.com/package/node-html-light
https://github.com/douzi8/htmldom           https://www.npmjs.com/package/htmldom
https://github.com/facebook/react           https://www.npmjs.com/package/react-dom

RESOURCES
---------
https://matthewhorne.me/setup-typescript-project/
https://sqlite.org/cli.html
https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
https://nodejs.org/api/esm.html#esm_writing_dual_packages_while_avoiding_or_minimizing_hazards
https://css-tricks.com/examples/WebKitScrollbars/


