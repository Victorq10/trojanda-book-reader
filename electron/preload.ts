// All of the Node.js APIs are available in the preload process.

// import { ipcRenderer } from "electron"
const { ipcRenderer } = require('electron')
import * as path from 'path'
import * as fs from 'fs-extra'

import { TrojandaBook, NavPoint, ManifestItem } from './trojanda-book';
import { romanize } from './romanization/romanization';
//import { TrojandaBookApplication } from './trojanda-book-application';
//const trojandaBookApplication = global.trojandaBookApplicationInstance as TrojandaBookApplication;


let current_spine_src: string;
let current_book: CurrentBookHelper;
let content_ids = ['js-toc-content', 'js-reading-content', 'js-book-info-content',
    'js-library-content', 'js-settings-content'];

ipcRenderer.on('display-book', (event: any, trojanda_book: TrojandaBook) => {
    if (trojanda_book.toc_xmldoc === undefined) {
        console.log('There is data in the book');
    } else {
        current_book = new CurrentBookHelper(trojanda_book);
        current_book.init_and_display_toc_content();
    }
})

ipcRenderer.on('asynchronous-reply', (event: any, arg: any) => {
    console.log(arg) // prints "pong"
});

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
    ipcRenderer.send('open-previous-book', 'ping')
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
    addEvent('js-romanize-btn', (event: MouseEvent) => {
        romanization_helper.toggle_romanized_text();
        focus_application_content();
    });

    progress_status_component.init_reading_percent();
    dark_light_mode_compoment.init();
});

document.addEventListener('click', (event) => {
    let target = event.target as HTMLElement
    if (target.tagName === 'A') {
        event.preventDefault()
        event.stopPropagation();
        current_book.load_and_display_link(target);
    } else if (target.classList.contains('application-content-section') || target.id == 'js-application-content') {
        if (event.clientY < document.body.clientHeight / 2) {
            scroll_one_page(true);
        } else {
            scroll_one_page(false);
        }
    }
});

function focus_application_content() {
    document.getElementById('js-application-content').focus();
}

function show_content_by_id(elmt_id: string): void {
    for (const content_id of content_ids) {
        const elmt = document.getElementById(content_id);
        if (content_id === elmt_id) {
            elmt.style.display = '';
            focus_application_content();
        } else {
            elmt.style.display = 'none';
        }
    }
}

function is_reading_mode() {
    return document.getElementById('js-reading-content').style.display !== 'none';
}

function scroll_to_start_of_content() {
    const application_content = document.getElementById('js-application-content');
    application_content.scroll({ 
      top: 0,
      left: 0
    });
}

function scroll_one_page(up: boolean = false) {
    const application_content = document.getElementById('js-application-content');
    const one_page_scroll_value = application_content.clientHeight
    let font_size = 28;
    let line_height = 1.4
    application_content.scrollBy({ 
      top: (one_page_scroll_value - (font_size * line_height)) * (up ? -1 : 1),
      left: 0, 
      behavior: 'smooth' 
    });
}

class CurrentBookHelper {
    trojanda_book: TrojandaBook;
    spine_manifest_items = new Array<ManifestItem>();

    constructor(trojanda_book: TrojandaBook) {
        this.trojanda_book = trojanda_book
        this.spine_manifest_items = trojanda_book.spine_manifest_items;
        console.log(this);
    }

    init_and_display_toc_content(): void {
        current_spine_src = '';
        const reading_content_elmt = document.getElementById('js-reading-content');
        if (reading_content_elmt) {
            reading_content_elmt.innerHTML = '';
        }
        const title_elmt = document.getElementById('title');
        const author_elmt = document.getElementById('author');
        const book_nav_map_elmt = document.getElementById('book-nav-map');
        if (title_elmt && author_elmt && book_nav_map_elmt) {
            book_nav_map_elmt.innerHTML = '';
            title_elmt.textContent = this.trojanda_book.book_title || "";
            author_elmt.textContent = this.trojanda_book.book_author || "";
            if (this.trojanda_book.book_toc && this.trojanda_book.book_toc.nav_points) {
                book_nav_map_elmt.appendChild(this.create_list_from_navPoint(this.trojanda_book.book_toc.nav_points));
            }
        }
        show_content_by_id('js-toc-content');
    }

    create_list_from_navPoint(navPoints: NavPoint[]): HTMLUListElement {
        let ul_elmt = document.createElement('ul');
        for (const navPoint of navPoints) {
            let li_elmt = document.createElement('li');
            let a_elmt = document.createElement('a');
            a_elmt.textContent = navPoint.label || "";
            a_elmt.href = navPoint.full_filepath || ""; //navPoint.src;
            a_elmt.dataset.spineSrc = navPoint.src;
            li_elmt.appendChild(a_elmt);
            if (navPoint.sub_nav_points && navPoint.sub_nav_points.length > 0) {
                let subUlElement = this.create_list_from_navPoint(navPoint.sub_nav_points);
                li_elmt.appendChild(subUlElement);
            }
            ul_elmt.appendChild(li_elmt);
        }
        return ul_elmt;
    }

    async load_and_display_file_content(filepath: string): Promise<any> {
        const t1 = new Date();
        return await fs.readFile(filepath, 'utf-8').then((data) => {
            console.log(`Reading  ${data.length} byte from “${filepath}” file take ${utils.format_log_time_string(t1)}`);
            let reading_content_elmt = document.getElementById('js-reading-content');

            let base_dir = filepath.substring(0, filepath.lastIndexOf('/') + 1)
            let base = document.getElementsByTagName('base')[0] as HTMLElement;
            base.setAttribute('href', base_dir)
            //base.setAttribute('href', '../data/currentBook/OEBPS/Text/')
            //base.setAttribute('href', '../data/currentBook/')

            data = data.replace(/<(link|meta)[^>]+>/g, '');
            reading_content_elmt.innerHTML = data
            // remove all style elements from the chapter
            //utils.remove_elemens(reading_content_elmt, 'link');
            //utils.remove_elemens(reading_content_elmt, 'meta');
            utils.remove_elemens(reading_content_elmt, 'style');
            utils.remove_elemens(reading_content_elmt, 'title');
            utils.remove_elemens(reading_content_elmt, 'base');
            if (filepath.includes('/currentBook/')) {
                utils.remove_class_and_style_attributies(reading_content_elmt);
            }
            romanization_helper.check_and_romanize_text();
            show_content_by_id('js-reading-content');
            scroll_to_start_of_content();
        });
    }

    load_and_display_manifestItem(manifest_item: ManifestItem) {
        let href = manifest_item.full_filepath;
        console.log('Opening a ManifestItem “' + manifest_item.id + '”')
        let filepath = window.decodeURI(href.replace('file://', '')) // existed link on the page with full path
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
        //console.log(`A “${target.textContent}”(${href}) link was clicked`)
        let filepath = window.decodeURI(href.replace('file://', '')) // existed link on the page with full path
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

    get_current_spine_idx(): number {
        let current_idx = -1;
        let i = 0;
        for (const spine_manifest_items of this.spine_manifest_items) {
            if (spine_manifest_items.href === current_spine_src) {
                current_idx = i;
                break;
            }
            i++;
        }
        if (current_idx === -1) {
            //console.warn('There is no current_spine_src among spine_manifest_items')
        }
        return current_idx;
    }

    get_number_of_spines() {
        return this.spine_manifest_items.length;
    }

    display_prev_spine() {
        const current_spine_idx = this.get_current_spine_idx();
        if (current_spine_idx > 0 && this.spine_manifest_items.length > 0) {
            let next_spine_manifest_item = this.spine_manifest_items[current_spine_idx - 1];
            this.load_and_display_manifestItem(next_spine_manifest_item);
        }
    }

    display_next_spine() {
        const current_spine_idx = this.get_current_spine_idx();
        if ((current_spine_idx + 1) < this.spine_manifest_items.length) {
            let next_spine_manifest_item = this.spine_manifest_items[current_spine_idx + 1];
            this.load_and_display_manifestItem(next_spine_manifest_item);
        }
    }
}
class RomanizationHelper {
    romanized_text_for_revert = new Map<Node, string>();
    toggle_romanized_text() {
        const html = document.querySelector('html');
        const is_romanize = html.classList.toggle('romanized');
        if (!is_romanize && !this.romanized_text_for_revert.size) {
            return;
        }
        this.romanize_text(is_romanize);
    }
    check_and_romanize_text() {
        const html = document.querySelector('html');
        const should_romanize = html.classList.contains('romanized');
        if (should_romanize) {
            this.romanize_text(true);
        }
    }
        async romanize_text(is_romanize: boolean) {
        let t1 = new Date();
        if (is_romanize) {
            this.romanized_text_for_revert.clear();
        }
        let count = 0,
            la_character_count = 0,
            uk_character_count = 0;
        const reading_content = document.getElementById('js-reading-content')
        const all_elmt = reading_content.getElementsByTagName('*')
        for(let i = 0; i < all_elmt.length; i++) {
            let elmt = all_elmt[i];
            for(let j = 0; j < elmt.childNodes.length; j++) {
                let node = elmt.childNodes[j];
                if (node.nodeType === node.TEXT_NODE) {
                    let uk_text : string, la_text: string;
                    if (is_romanize) {
                        uk_text = node.textContent;
                        la_text = romanize(node.textContent);
                        node.textContent = la_text;
                        this.romanized_text_for_revert.set(node, uk_text);
                    } else { // revert romanization
                        la_text = node.textContent;
                        uk_text = this.romanized_text_for_revert.get(node);
                        node.textContent = uk_text;
                        this.romanized_text_for_revert.delete(node);
                    }
                    la_character_count += la_text.length;
                    uk_character_count += uk_text.length;
                    count++;
                    //console.log(node.textContent);
                }
            }
        }
        if (!is_romanize && this.romanized_text_for_revert.size) {
            console.warn(`CHECK CLEARNING CHACH FOR ROMANIZATION!!! Cache size is ${this.romanized_text_for_revert.size} entries. FORCE CLEARING!!!`)
            this.romanized_text_for_revert.clear();
        } 
        let t2 = new Date();
        console.log(`Romanize text of ${count} phrases 
            or ${la_character_count} “la” characters 
            or ${uk_character_count} “uk” characters 
            was done in ${utils.format_log_time_string(t1)}`);
    }
    
}

class DarkLightModeCompoment {
    eventName: string;
    constructor() {
        this.eventName = ("ontouchstart" in window ? "touchend" : "click");
    }
    init() {
        this.init_rainbow();
        this.init_toggle("js-contrast-btn", "contrast");
        this.init_toggle("js-invmode-btn", "inverted");
    }
    private init_rainbow() {
        let rainbow_red_color = 0;
        const rainbow_text = () => {
            const rainbow_elmts = document.getElementsByClassName("colored") as HTMLCollectionOf<HTMLElement>;
            if (rainbow_elmts.length) {
                let color = "hsl(" + rainbow_red_color + ", 80%, 60%)";
                let d = rainbow_red_color + 5;
                rainbow_red_color = d > 360 ? 0 : d;
                for(let i = 0; i < rainbow_elmts.length; i++) {
                    rainbow_elmts[i].style.color = color;
                }
                window.setTimeout(rainbow_text, 30);
            } else {
                window.setTimeout(rainbow_text, 3000);
            }
        };
        rainbow_text();
    }

    private init_toggle(elmt_id: string, toggle_class_name: string) {
        const html = document.getElementsByTagName("html")[0];
        const elmt = document.getElementById(elmt_id);
        const application_content = document.getElementById('js-application-content');
        const toggle_class = () => {
            html.classList.toggle(toggle_class_name);
            application_content.focus();
        };
        elmt.addEventListener(this.eventName, toggle_class, false);
    };
}

class ProgressInfo {
    chapter_info: string;
    pages_info: string;
    percent_info: string;
}

class ProgressStatusComponent {
    init_reading_percent() {
        const chapter_info = document.getElementById('chapters-info');
        const pages_info = document.getElementById('pages-info');
        const percent_info = document.getElementById('percent-info');
        const elmt = document.getElementById('js-progress-info');
        (function update_precent() {
            if (elmt) {
                if (is_reading_mode()) {
                    const progress_info = progress_status_component.get_progress_info()
                    utils.update_text_content(chapter_info, progress_info.chapter_info);
                    utils.update_text_content(pages_info, progress_info.pages_info);
                    utils.update_text_content(percent_info, progress_info.percent_info);
                } else {
                    //elmt.textContent = '';
                }
            }
            setTimeout(update_precent, 300);
        })();
    }
    get_progress_info(): ProgressInfo {
        const application_content = document.getElementById('js-application-content');
        const percent = ((application_content.scrollTop + application_content.clientHeight) / application_content.scrollHeight * 100).toFixed(1);
        const number_of_pages = (application_content.scrollHeight / application_content.clientHeight).toFixed(1);
        const current_page = ((application_content.scrollTop + application_content.clientHeight)
            / application_content.clientHeight).toFixed(1);
        const current_spine_idx = !current_book ? -1 : current_book.get_current_spine_idx();
        const number_of_spines = !current_book ? 0 : current_book.get_number_of_spines();
        return {
            chapter_info: `chapter ${current_spine_idx + 1} of ${number_of_spines}`,
            pages_info: `page ${current_page} of ${number_of_pages}`,
            percent_info: `progress ${percent}%`
        };
       /*  this.chapter_info.textContent = `Chapter ${current_spine_idx + 1} / ${number_of_spines}`;
        this.pages_info.textContent = `page ${current_page} / ${number_of_pages}`;
        this.percent_info.textContent = `${percent}%`
        return `Chapter ${current_spine_idx + 1} / ${number_of_spines}<br>
                page ${current_page} / ${number_of_pages} —
                ${percent}%`; */
    }
}
class Utils {
    remove_elemens(elmt: HTMLElement, tagName: string) {
        let elements = elmt.getElementsByTagName(tagName);
        for (let i = 0; i < elements.length; i++) {
            elements[i].remove();
        }
    }

    format_log_time_string(start_time: Date): string {
        const current_time = new Date();
        return `${(current_time.getTime() - start_time.getTime()) / 1000}s`;
    }
    update_text_content(elmt:  HTMLElement, text_content: string): void {
        if (elmt.textContent !== text_content) {
            elmt.textContent = text_content;
        }
    }    
    remove_class_and_style_attributies(elmt: HTMLElement) {
        const all_elmts_with_style_attr = elmt.querySelectorAll('*[style]')
        for(let i = 0; i < all_elmts_with_style_attr.length; i++) {
            all_elmts_with_style_attr[i].removeAttribute('style');
        }
        const all_elmts_with_class_attr = elmt.querySelectorAll('*[class]')
        for(let i = 0; i < all_elmts_with_class_attr.length; i++) {
            all_elmts_with_class_attr[i].removeAttribute('class');
        }
    }
}

const romanization_helper = new RomanizationHelper()
const utils = new Utils();
const progress_status_component = new ProgressStatusComponent();
const dark_light_mode_compoment = new DarkLightModeCompoment();