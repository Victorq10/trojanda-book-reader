// All of the Node.js APIs are available in the preload process.

// import { ipcRenderer } from "electron"
const { ipcRenderer } = require('electron')
import { TrojandaBook, NavPoint } from './TrojandaBook';
//import { TrojandaBookApplication } from './TrojandaBookApplication';
//const trojandaBookApplication = global.trojandaBookApplicationInstance as TrojandaBookApplication;

import * as path from 'path'
import * as fs from 'fs-extra'

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector : string, text : any) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }

    // convert relative pathes to absolete
    let base_dir = location.href;
    base_dir = base_dir.substring(0, base_dir.lastIndexOf('/'))
    const setBaseDir = (tagName : string, attrName : string) => {
        let elements = document.getElementsByTagName(tagName);
        for(let i = 0; i < elements.length; i++) {
            let elmt = elements[i];
            let attrValue = elmt.getAttribute(attrName);
            if (attrValue && attrValue.indexOf(':') === -1) {
                elmt.setAttribute(attrName, base_dir + '/' + attrValue);
            }
        }
    };
    setBaseDir('link', 'href');
    setBaseDir('script', 'src');
    setBaseDir('a', 'href');
/*     let links = document.getElementsByTagName('link');
    for(let i = 0; i < links.length; i++) {
        let link = links[0];
        let attr = link.getAttribute('href');
        if (attr) {
            link.setAttribute('href', base_dir + '/' + attr);
        }
    }
 */

    // display version information
    let versions : any = process.versions;
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, versions[type])
    }

    // init buttons events
    const addEvent = (elmt_id : string, handler : Function) => {
        const btn = document.getElementById(elmt_id)
        if (btn !== null) {
            btn.addEventListener('click', (event : MouseEvent) => handler(event))
        }
    }
    addEvent('js-open-book-btn', (event : MouseEvent) => {
        ipcRenderer.send('open-book', 'ping')
    });
    addEvent('js-book-content-btn', (event : MouseEvent) => {
        document.getElementById('bookContent').style.display = 'none';
        document.getElementById('toc').style.display = '';
    });
    addEvent('js-current-reading-btn', (event : MouseEvent) => {
        document.getElementById('bookContent').style.display = '';
        document.getElementById('toc').style.display = 'none';
    });
    
});

let trojandaBook : TrojandaBook;

ipcRenderer.on('display-book', (event : any, trojandaBookArg : TrojandaBook) => {
    trojandaBook = trojandaBookArg;
    console.log(trojandaBook); // prints "pong"
    const titleElement = document.getElementById('title');
    const authorElement = document.getElementById('author');
    const bookNavMapElement = document.getElementById('bookNavMap');
    if (titleElement && authorElement && bookNavMapElement) {
        bookNavMapElement.innerHTML = '';
        titleElement.textContent = trojandaBook.bookTitle || "";
        authorElement.textContent = trojandaBook.bookAuthor || "";
        if (trojandaBook.bookTOC && trojandaBook.bookTOC.navPoints) {
            bookNavMapElement.appendChild(create_list_from_navPoint(trojandaBook.bookTOC.navPoints));
        }
    }
})

function create_list_from_navPoint(navPoints : NavPoint[]) : HTMLUListElement {
    let ulElement = document.createElement('ul');
    for (const navPoint of navPoints) {
        let liElement = document.createElement('li');
        let aElement = document.createElement('a');
        aElement.textContent = navPoint.label || "";
        aElement.href = navPoint.fullFilepath || ""; //navPoint.src;
        aElement.dataset.baseDir = navPoint.fullFilepath.substring(0, navPoint.fullFilepath.lastIndexOf('/') + 1);
        liElement.appendChild(aElement);
        if (navPoint.subNavPoints && navPoint.subNavPoints.length > 0) {
            let subUlElement = create_list_from_navPoint(navPoint.subNavPoints);
            liElement.appendChild(subUlElement);
        }
        ulElement.appendChild(liElement);
    }
    return ulElement;
}

ipcRenderer.on('asynchronous-reply', (event : any, arg : any) => {
    console.log(arg) // prints "pong"
});

document.addEventListener('click', (event) => {
    let target = event.target as HTMLElement
    if (target.tagName === 'A') {
        event.preventDefault()
        event.stopPropagation();
        let a = target;
        let href = target.getAttribute('href')
        console.log('An a element was clicked, text:' + target.textContent + ', href:' + href)
        try {
            href = href.replace('file://','') // existed link on the page with full path
            fs.readFile(href, 'utf-8').then((data) => {
                console.log("Reading file “" + href + "” (size" + data.length + ")...");
                if (target.dataset.baseDir) {
                    let base = document.getElementsByTagName('base')[0] as HTMLElement;
                    base.setAttribute('href', target.dataset.baseDir)
                    //base.setAttribute('href', '../data/currentBook/OEBPS/Text/')
                    //base.setAttribute('href', '../data/currentBook/')
                }
                let bookContentElement = document.getElementById('bookContent');
                bookContentElement.innerHTML = data
                // remove all style elements from the chapter
                const removeElemens = (tagName: string) => {
                    let elements = bookContentElement.getElementsByTagName(tagName);
                    for(let i = 0; i < elements.length; i++) {
                        elements[i].remove();
                    }
                }
                removeElemens('link');
                removeElemens('style');
                removeElemens('meta');
                removeElemens('title');
                bookContentElement.style.display = '';
                document.getElementById('toc').style.display = 'none';
            }).catch((err) => {
                console.log('Error on reading “' + href + '” file: ' + err.message);
            });
        } catch (err) {
            console.error("An error ocurred reading the file :" + err.message);
        }
    }
});
