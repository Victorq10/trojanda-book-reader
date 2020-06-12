
import * as yauzl from "yauzl"
//import 'extract-zip' // see: https://www.npmjs.com/package/extract-zip
const extract_zip = require('extract-zip')
import * as path from 'path'
import * as fs from 'fs-extra'
//const { parseString } = require('xml2js');
import {DOMParser} from 'xmldom';
import * as xpath from 'xpath';
const Node = require('./../node_modules/xmldom/lib/dom').Node;
const ELEMENT_NODE = Node.ELEMENT_NODE;

import { CURRENT_BOOK_PATH } from './Constants'

const get_all_files = function (dirpath: any): string[] {
    let files = fs.readdirSync(dirpath)

    let file_list : string[] = []

    files.forEach(function (file) {
        if (fs.statSync(dirpath + "/" + file).isDirectory()) {
            file_list.push(...get_all_files(dirpath + "/" + file))
        } else {
            file_list.push(path.join(dirpath, "/", file))
        }
    })

    return file_list
}

const get_children_by_name = function (element: Element, children_tag_name : string) : Array<Element> {
    let elements: Element[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
        let node: Node = element.childNodes[i];
        if (node.nodeName === children_tag_name) {
            elements.push(node as Element);
        }
    }
    return elements;
}
const read_xml_file = function (xml_filepath: string): Document | undefined {
    let xml_doc;
    if (fs.existsSync(xml_filepath) && fs.statSync(xml_filepath).isFile()) {
        try {
            let data = fs.readFileSync(xml_filepath, 'utf-8');
            console.log("Reading xml file “" + xml_filepath + "” (size" + data.length + ")...");
            let parser = new DOMParser();
            xml_doc = parser.parseFromString(data, "application/xml");
        } catch (err) {
            console.error("An error ocurred reading the file :" + err.message);
        }
    }
    return xml_doc;
}
class BookTOC {
    title?: string; // String
    author?: string; // String
    nav_points?: NavPoint[]; // Array
}

export class NavPoint {
    label?: string;
    src?: string;
    sub_nav_points : NavPoint[] = [];

    full_filepath?: string;
}
export class ManifestItem {
    id?: string | null;
    href?: string | null;
    media_type?: string | null;
    full_filepath?: string;
}
type TrojandaBookCallback = (book: TrojandaBook) => void

export class TrojandaBook {
    filepath: string;
    files: string[] = [];
    content_basedir: string = '';

    manifest_items: ManifestItem[] = []; // here is metadata and all resources
    spine: string[] = []; // resources for linear reading, contain id from manifestItems

    book_toc?: BookTOC; // type class BookTOC Object
    book_title?: string; // dublicate with bookTOC.title
    book_author?: string; // dublicate with bookTOC.author

    container_xml_doc?: Document;
    root_opf_filepath?: string;
    root_opf_xmldoc?: Document;
    toc_filepath?: string; // here is TOC for display
    toc_xmldoc?: Document;

    constructor(filepath: string, onCompleteCallback: TrojandaBookCallback) {
        this.filepath = filepath;
        if (true) {
            this.clear_current_book_dir();
            this.extract_current_book(/* this.i.bind(this) */ () => {
                this.init_book();
                onCompleteCallback(this);
            });
        } else { // read a previously opened book
            this.init_book();
            onCompleteCallback(this);
        }
    }

    init_book() {
        //this.printAllFilesInTheBook();
        this.parse_container_file()
        this.determine_root_opf_filepath();
        this.parse_root_opf_file();
        this.determine_toc_filepath();
        this.parse_toc_file();

        this.init_book_toc();
        this.init_spine();
    }

    init_book_toc() {
        if (this.toc_xmldoc === undefined) {
            return;
        }
        let bookTOC = new BookTOC();
        bookTOC.title = this.get_text_content("docTitle", this.toc_xmldoc);
        bookTOC.author = this.get_text_content("docAuthor", this.toc_xmldoc);
        let navMap: Element = this.toc_xmldoc.getElementsByTagName("navMap")[0];
        if (navMap) {
            bookTOC.nav_points = this.create_NavPoints(get_children_by_name(navMap, 'navPoint'))
        }
        this.book_toc = bookTOC;
        this.book_title = bookTOC.title;
        this.book_author = bookTOC.author;
    }

    create_NavPoints(childNodes: Array<Element>): NavPoint[] {
        let navPoints: NavPoint[] = [];
        for (let i = 0; i < childNodes.length; i++) {
            let node: Element = childNodes[i];
            if (node.tagName === 'navPoint') {
                let navPoint = new NavPoint();
                navPoint.label = this.get_text_content('navLabel', node);
                navPoint.src = this.get_element_attr('content', 'src', node);
                navPoint.full_filepath = path.resolve(this.content_basedir, navPoint.src);
                navPoint.sub_nav_points = this.create_NavPoints(get_children_by_name(node, 'navPoint'));
                navPoints.push(navPoint);
            }
        }
        return navPoints;
    }

    get_element_attr(tagName: string, attrName: string, document : Element) : string {
        let text : string = "";
        let element = document.getElementsByTagName(tagName)[0];
        if (element) {
            let tmp_text = element.getAttribute(attrName);
            if (tmp_text !== null) {
                text = tmp_text;
            }
        }
        return text;
    
    }
    get_text_content(tagName : string, document : Element | Document) {
        let text = "";
        let element = document.getElementsByTagName(tagName)[0];
        if (element) {
            //text = xpath.select("string(//*[local-name(.)='text'])", element)
            let text_element = element.getElementsByTagName("text")[0]
            if (text_element && text_element.textContent !== null) {
                text = text_element.textContent
            }
        }
        return text;
    }

    init_spine() {
        if (this.root_opf_xmldoc === undefined) {
            return;
        }
        let manifest = this.root_opf_xmldoc.getElementsByTagName('manifest')[0]
        if (!manifest) {
            console.error("There is no manifest element in the book opf file")
        } else {
            let manifest_items = [];
            let items = manifest.getElementsByTagName('item')
            for (let i = 0; i < items.length; i++) {
                let node = items[i]
                if (node.tagName === 'item') {
                    let manifest_item = new ManifestItem();
                    manifest_item.id = node.getAttribute('id');
                    manifest_item.href = node.getAttribute('href');
                    manifest_item.media_type = node.getAttribute('media-type');
                    let valid = true;
                    if (manifest_item.id === null || manifest_item.id === "") {
                        console.warn("There is no id attribute for item element");
                        valid = false;
                    }
                    if (manifest_item.href === null || manifest_item.href === "") {
                        console.warn("There is no href attribute for item element");
                        valid = false;
                    }
                    if (valid && manifest_item.href !== null) {
                        manifest_item.full_filepath = path.resolve(this.content_basedir, manifest_item.href);
                        manifest_items.push(manifest_item);
                    }
                }
            }
            this.manifest_items = manifest_items;
        }

        let spine_element = this.root_opf_xmldoc.getElementsByTagName('spine')[0]
        if (!spine_element) {
            console.error("There is no spine element in the book opf file")
        } else {
            let spine = [];
            let items = spine_element.getElementsByTagName('itemref')
            for (let i = 0; i < items.length; i++) {
                let node = items[i]
                if (node.tagName === 'itemref') {
                    let idref = node.getAttribute('idref');
                    if (idref === null || idref === "") {
                        console.warn("There is no idref attribute for itemref element");
                    } else {
                        spine.push(idref);
                    }
                }
            }
            this.spine = spine;
        }
    }

    parse_container_file() : void {
        let container_filepath = path.resolve(CURRENT_BOOK_PATH, 'META-INF', 'container.xml');
        this.container_xml_doc = read_xml_file(container_filepath);
    }

    parse_root_opf_file() : void {
        if (this.root_opf_filepath !== undefined) {
            this.root_opf_xmldoc = read_xml_file(this.root_opf_filepath);
        }
    }
    parse_toc_file() : void {
        if (this.toc_filepath !== undefined) {
            this.toc_xmldoc = read_xml_file(this.toc_filepath);
        }
    }

    determine_toc_filepath() : string | undefined {
        if (this.root_opf_xmldoc === undefined) {
            return;
        }
        let spine_elements = this.root_opf_xmldoc.getElementsByTagName('spine')
        if (spine_elements.length < 0) {
            console.error("There is invalide OPF file. No spine element");
            return;
        }
        if (spine_elements.length > 1) {
            console.warn("There is more than one spine elements. Select first");
        }
        let spine_element = spine_elements[0];
        let toc_id = spine_element.getAttribute('toc');
        if (toc_id == null || toc_id === '') {
            console.error("There is no toc attribute in the spine element")
            return;
        }
        // let tocItemElement = this.rootOPFFileXmlDoc.getElementById(tocId) // throw Refference Exception
        let toc_item_node : Node[] = xpath.select("//*[local-name(.)='manifest']/*[local-name(.)='item' and @id='" + toc_id + "']", this.root_opf_xmldoc) as Node[];
        if (toc_item_node.length < 0 || toc_item_node[0].nodeType !== Node.ELEMENT_NODE) {
            console.error("There is no toc item element with the '" + toc_id + "' id ")
            return;
        }
        let toc_item_element = toc_item_node[0] as Element
        let toc_filepath = toc_item_element.getAttribute('href');
        if (toc_filepath == null || toc_filepath === '') {
            console.error("There is no href attribute in the item element")
            return;
        }
        // pash is related to the location of *.OPF file
        this.toc_filepath = path.resolve(this.content_basedir, toc_filepath);
        return this.toc_filepath
        /* 
        //let select = xpath.useNamespaces({"xmlns": "http://www.idpf.org/2007/opf"})
        //let tocId = xpath.select("//xmlns:package/xmlns:spine/@toc", this.rootOPFFileXmlDoc)
        let spineElement = xpath.select("//*[local-name(.)='spine']", this.rootOPFFileXmlDoc)
        let tocId = spineElement[0].getAttribute('toc');
        let tocItemElement = xpath.select("//*[local-name(.)='manifest']/*[local-name(.)='item' and @id='" + tocId + "']", this.rootOPFFileXmlDoc)
        let tocFilepath = tocItemElement.getAttribute('href');
        this.tocFilepath = path.resolve(CURRENT_BOOK_PATH, tocFilepath);
        return tocFilepath;
        */
    }

    determine_root_opf_filepath() : string | undefined {
        //let select = xpath.useNamespaces({"xmlns": "urn:oasis:names:tc:opendocument:xmlns:container"})
        //select("//xmlns:container/xmlns:rootfiles/xmlns:rootfile", this.containerXmlDoc)
        //xpath.select("//*[local-name(.)='rootfile' and namespace-uri(.)!='fakeuri']", this.containerXmlDoc)

        let root_files : Node[] = xpath.select("//*[local-name(.)='rootfile']", this.container_xml_doc) as Node[]
        if (root_files.length < 1 || root_files[0].nodeType !== Node.ELEMENT_NODE) {
            // TODO: find file in the current book with extention *.opf
            return;
        }
        if (root_files.length > 1) {
            console.warn('WARNING: Only first rootfile is taken')
        }
        let root_file = root_files[0] as Element;
        let root_filepath = root_file.getAttribute('full-path');
        let root_file_media_type = root_file.getAttribute('media-type');
        if (root_file_media_type != 'application/oebps-package+xml') {
            console.warn("WARNING: media-type should be: application/oebps-package+xml, but it is:" + root_file_media_type)
        }
        if (root_filepath === null || root_filepath === '') {
            console.warn("WARNING: rootfile full-path attribute is absant or empty")
        }
        if (root_filepath !== null) {
            this.root_opf_filepath = path.resolve(CURRENT_BOOK_PATH, root_filepath);
            this.content_basedir = path.dirname(this.root_opf_filepath);
        }
        return this.root_opf_filepath;
    }

    print_all_files_in_the_book() {
        this.files = get_all_files(CURRENT_BOOK_PATH);
        console.log('All book files (size: ' + this.files.length + '):')
        for (const file of this.files) {
            console.log('    ' + file);
        }
    }


    clear_current_book_dir() {
        try {
            fs.emptyDirSync(CURRENT_BOOK_PATH)
            console.log('success!')
        } catch (err) {
            console.error(err)
            throw err;
        }
    }

    extract_current_book(callbackOnComplete : Function) {
        extract_zip(this.filepath, { dir: CURRENT_BOOK_PATH }, (err: any) => {
            if (err) {
                console.error(err)
            } else {
                callbackOnComplete()
            }
        })
    }

    print_book_entries() {
        yauzl.open(this.filepath, function (err, zip_file) {
            if (err) throw err;
            if (zip_file !== undefined) {
                zip_file.on("error", function (err) {
                    throw err;
                });
                zip_file.on("entry", function (entry) {
                    console.log('-----------------');
                    console.log(entry.fileName + ', time:' + entry.getLastModDate());
                    console.log(entry);
                    if (/\/$/.exec(entry)) return;
                    /* 
                    zipfile.openReadStream(entry, function (err, readStream) {
                        if (err) throw err;
                        readStream.pipe(process.stdout);
                    }); */
                });
            }
        });

    }
}
