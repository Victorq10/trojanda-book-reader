// All of the Node.js APIs are available in the preload process.

// import { ipcRenderer } from "electron"
const { ipcRenderer } = require('electron')
import { TrojandaBook, NavPoint, ManifestItem } from './TrojandaBook';
//import { TrojandaBookApplication } from './TrojandaBookApplication';
//const trojandaBookApplication = global.trojandaBookApplicationInstance as TrojandaBookApplication;

import * as path from 'path'
import * as fs from 'fs-extra'

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    // convert relative pathes to absolete
    let base_dir = location.href;
    base_dir = base_dir.substring(0, base_dir.lastIndexOf('/'))
    const setBaseDir = (tagName: string, attrName: string) => {
        let elements = document.getElementsByTagName(tagName);
        for (let i = 0; i < elements.length; i++) {
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

    const replaceText = (selector: string, text: any) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    // display version information
    let versions: any = process.versions;
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, versions[type])
    }

    // init buttons events
    const addEvent = (elmt_id: string, handler: Function) => {
        const btn = document.getElementById(elmt_id)
        if (btn !== null) {
            btn.addEventListener('click', (event: MouseEvent) => handler(event))
        }
    }
    addEvent('js-open-book-btn', (event: MouseEvent) => {
        ipcRenderer.send('open-book', 'ping')
    });
    addEvent('js-toc-content-btn', (event: MouseEvent) => {
        show_content_by_id('js-toc-content');
    });
    addEvent('js-prev-chapter-btn', (event: MouseEvent) => {
        if (current_book) {
            current_book.display_prev_spine();
        }
    });
    addEvent('js-next-chapter-btn', (event: MouseEvent) => {
        if (current_book) {
            current_book.display_next_spine();
        }
    });
    addEvent('js-reading-content-btn', (event: MouseEvent) => {
        show_content_by_id('js-reading-content');
    });
    addEvent('js-book-info-content-btn', (event: MouseEvent) => {
        show_content_by_id('js-book-info-content');
    });
    addEvent('js-library-content-btn', (event: MouseEvent) => {
        show_content_by_id('js-library-content');
    });
    addEvent('js-settings-content-btn', (event: MouseEvent) => {
        show_content_by_id('js-settings-content');
    });
    show_content_by_id('js-toc-content');
});

let content_ids = ['js-toc-content', 'js-reading-content', 'js-book-info-content',
    'js-library-content-btn', 'js-settings-content'];

function show_content_by_id(elmt_id: string): void {
    for (const content_id of content_ids) {
        const elmt = document.getElementById(content_id);
        if (content_id === elmt_id) {
            elmt.style.display = '';
        } else {
            elmt.style.display = 'none';
        }
    }
}

ipcRenderer.on('display-book', (event: any, trojanda_book: TrojandaBook) => {
    console.log(trojanda_book); // prints "pong"
    current_book = new CurrentBookHelper(trojanda_book);
    current_book.init_and_display_toc_content();
})

ipcRenderer.on('asynchronous-reply', (event: any, arg: any) => {
    console.log(arg) // prints "pong"
});

document.addEventListener('click', (event) => {
    let target = event.target as HTMLElement
    if (target.tagName === 'A') {
        event.preventDefault()
        event.stopPropagation();
        current_book.load_and_display_link(target);
    }
});

let current_spine_src: string;
let current_book: CurrentBookHelper;
class CurrentBookHelper {
    trojanda_book: TrojandaBook;
    spine_manifest_items: Array<ManifestItem> = [];

    constructor(trojanda_book: TrojandaBook) {
        this.trojanda_book = trojanda_book
        for (const manifest_item_id of trojanda_book.spine) {
            let found = false;
            for (const manifest_item of trojanda_book.manifestItems) {
                if (manifest_item.id === manifest_item_id) {
                    found = true;
                    this.spine_manifest_items.push(manifest_item);
                    break;
                }
            }
            if (!found) {
                console.warn('Can not find manifest item by id :' + manifest_item_id)
            }
        }
        console.log(this);
    }

    init_and_display_toc_content(): void {
        const titleElement = document.getElementById('title');
        const authorElement = document.getElementById('author');
        const bookNavMapElement = document.getElementById('bookNavMap');
        if (titleElement && authorElement && bookNavMapElement) {
            bookNavMapElement.innerHTML = '';
            titleElement.textContent = this.trojanda_book.bookTitle || "";
            authorElement.textContent = this.trojanda_book.bookAuthor || "";
            if (this.trojanda_book.bookTOC && this.trojanda_book.bookTOC.navPoints) {
                bookNavMapElement.appendChild(this.create_list_from_navPoint(this.trojanda_book.bookTOC.navPoints));
            }
        }
    }

    create_list_from_navPoint(navPoints: NavPoint[]): HTMLUListElement {
        let ul_elmt = document.createElement('ul');
        for (const navPoint of navPoints) {
            let li_elmt = document.createElement('li');
            let a_elmt = document.createElement('a');
            a_elmt.textContent = navPoint.label || "";
            a_elmt.href = navPoint.fullFilepath || ""; //navPoint.src;
            a_elmt.dataset.spineSrc = navPoint.src;
            li_elmt.appendChild(a_elmt);
            if (navPoint.subNavPoints && navPoint.subNavPoints.length > 0) {
                let subUlElement = this.create_list_from_navPoint(navPoint.subNavPoints);
                li_elmt.appendChild(subUlElement);
            }
            ul_elmt.appendChild(li_elmt);
        }
        return ul_elmt;
    }

    remove_elemens(elmt: HTMLElement, tagName: string) {
        let elements = elmt.getElementsByTagName(tagName);
        for (let i = 0; i < elements.length; i++) {
            elements[i].remove();
        }
    }

    async load_and_display_file_content(filepath: string): Promise<any> {
        return await fs.readFile(filepath, 'utf-8').then((data) => {
            console.log("Reading file “" + filepath + "” (size: " + data.length + ")");
            let reading_content_elmt = document.getElementById('js-reading-content');

            let base_dir = filepath.substring(0, filepath.lastIndexOf('/') + 1)
            let base = document.getElementsByTagName('base')[0] as HTMLElement;
            base.setAttribute('href', base_dir)
            //base.setAttribute('href', '../data/currentBook/OEBPS/Text/')
            //base.setAttribute('href', '../data/currentBook/')

            reading_content_elmt.innerHTML = data
            // remove all style elements from the chapter
            this.remove_elemens(reading_content_elmt, 'link');
            this.remove_elemens(reading_content_elmt, 'style');
            this.remove_elemens(reading_content_elmt, 'meta');
            this.remove_elemens(reading_content_elmt, 'title');
            show_content_by_id('js-reading-content')
        });
    }

    load_and_display_manifestItem(manifest_item: ManifestItem) {
        let href = manifest_item.fullFilepath;
        console.log('Opening a ManifestItem “' + manifest_item.id + '”')
        let filepath = href.replace('file://', '') // existed link on the page with full path
        this.load_and_display_file_content(filepath)
            .then(() => {
                if (manifest_item.href) {
                    current_spine_src = manifest_item.href;
                }
            })
            .catch((err) => {
                console.log('Error on reading “' + filepath + '” file: ' + err.message);
            });
    }

    load_and_display_link(target: HTMLElement): void {
        let href = target.getAttribute('href')
        console.log('An a element was clicked on “' + target.textContent + '” link, href:' + href)
        let filepath = href.replace('file://', '') // existed link on the page with full path
        this.load_and_display_file_content(filepath)
            .then(() => {
                if (target.dataset.spineSrc) {
                    current_spine_src = target.dataset.spineSrc;
                }
            })
            .catch((err) => {
                console.log('Error on reading “' + filepath + '” file: ' + err.message);
            });
    }

    get_spine_manifest_item_by_href(manifest_item_href: string): number {
        let current_idx = -1;
        let i = 0;
        for (const spine_manifest_items of this.spine_manifest_items) {
            if (spine_manifest_items.href === manifest_item_href) {
                current_idx = i;
                break;
            }
            i++;
        }
        if (current_idx === -1) {
            console.warn('There is no current_spine_src among spine_manifest_items')
        }
        return current_idx;
    }

    display_prev_spine() {
        const current_spine_idx = this.get_spine_manifest_item_by_href(current_spine_src);
        if (current_spine_idx > 0 && this.spine_manifest_items.length > 0) {
            let next_spine_manifest_item = this.spine_manifest_items[current_spine_idx - 1];
            this.load_and_display_manifestItem(next_spine_manifest_item);
        }
    }

    display_next_spine() {
        const current_spine_idx = this.get_spine_manifest_item_by_href(current_spine_src);
        if ((current_spine_idx + 1) < this.spine_manifest_items.length) {
            let next_spine_manifest_item = this.spine_manifest_items[current_spine_idx + 1];
            this.load_and_display_manifestItem(next_spine_manifest_item);
        }
    }


}

