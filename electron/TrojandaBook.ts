
import * as yauzl from "yauzl"
//import 'extract-zip' // see: https://www.npmjs.com/package/extract-zip
const extractZip = require('extract-zip')
import * as path from 'path'
import * as fs from 'fs-extra'
//const { parseString } = require('xml2js');
import {DOMParser} from 'xmldom';
import * as xpath from 'xpath';
const Node = require('./../node_modules/xmldom/lib/dom').Node;
const ELEMENT_NODE = Node.ELEMENT_NODE;

import { CURRENT_BOOK_PATH } from './Constants'

const getAllFiles = function (dirPath: any): string[] {
    let files = fs.readdirSync(dirPath)

    let returnFileList : string[] = []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            returnFileList.push(...getAllFiles(dirPath + "/" + file))
        } else {
            returnFileList.push(path.join(dirPath, "/", file))
        }
    })

    return returnFileList
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
const readXMLFile = function (xmlfilepath: string): Document | undefined {
    let xmlDoc;
    if (fs.existsSync(xmlfilepath) && fs.statSync(xmlfilepath).isFile()) {
        try {
            let data = fs.readFileSync(xmlfilepath, 'utf-8');
            console.log("Reading xml file “" + xmlfilepath + "” (size" + data.length + ")...");
            let parser = new DOMParser();
            xmlDoc = parser.parseFromString(data, "application/xml");
        } catch (err) {
            console.error("An error ocurred reading the file :" + err.message);
        }
    }
    return xmlDoc;
}
class BookTOC {
    title?: string; // String
    author?: string; // String
    navPoints?: NavPoint[]; // Array
}

export class NavPoint {
    label?: string;
    src?: string;
    subNavPoints : NavPoint[] = [];

    fullFilepath?: string;
}
export class ManifestItem {
    id?: string | null;
    href?: string | null;
    mediaType?: string | null;
    fullFilepath?: string;
}
type TrojandaBookCallback = (book: TrojandaBook) => void

export class TrojandaBook {
    filepath: string;
    files: string[] = [];
    contentBaseDir: string = '';

    manifestItems: ManifestItem[] = []; // here is metadata and all resources
    spine: string[] = []; // resources for linear reading, contain id from manifestItems

    bookTOC?: BookTOC; // type class BookTOC Object
    bookTitle?: string; // dublicate with bookTOC.title
    bookAuthor?: string; // dublicate with bookTOC.author

    containerXmlDoc?: Document;
    rootOPFFilepath?: string;
    rootOPFFileXmlDoc?: Document;
    tocFilepath?: string; // here is TOC for display
    tocFileXmlDoc?: Document;

    constructor(filepath: string, onCompleteCallback: TrojandaBookCallback) {
        this.filepath = filepath;
        if (true) {
            this.clearCurrentBookDir();
            this.extractCurrentBook(/* this.i.bind(this) */ () => {
                this.readStructure();
                onCompleteCallback(this);
            });
        } else { // read a previously opened book
            this.readStructure();
            onCompleteCallback(this);
        }
    }

    readStructure() {
        //this.printAllFilesInTheBook();
        this.parseContainerFile()
        this.determineRootOPFFilepath();
        this.parseRootOPFFile();
        this.determineTOCFilepath();
        this.parseTOCFile();

        this.init_book_toc();
        this.init_spine();
    }

    init_book_toc() {
        if (this.tocFileXmlDoc === undefined) {
            return;
        }
        let bookTOC = new BookTOC();
        bookTOC.title = this.getTextContent("docTitle", this.tocFileXmlDoc);
        bookTOC.author = this.getTextContent("docAuthor", this.tocFileXmlDoc);
        let navMap: Element = this.tocFileXmlDoc.getElementsByTagName("navMap")[0];
        if (navMap) {
            bookTOC.navPoints = this.create_NavPoints(get_children_by_name(navMap, 'navPoint'))
        }
        this.bookTOC = bookTOC;
        this.bookTitle = bookTOC.title;
        this.bookAuthor = bookTOC.author;
    }

    create_NavPoints(childNodes: Array<Element>): NavPoint[] {
        let navPoints: NavPoint[] = [];
        for (let i = 0; i < childNodes.length; i++) {
            let node: Element = childNodes[i];
            if (node.tagName === 'navPoint') {
                let navPoint = new NavPoint();
                navPoint.label = this.getTextContent('navLabel', node);
                navPoint.src = this.getAttr('content', 'src', node);
                navPoint.fullFilepath = path.resolve(this.contentBaseDir, navPoint.src);
                navPoint.subNavPoints = this.create_NavPoints(get_children_by_name(node, 'navPoint'));
                navPoints.push(navPoint);
            }
        }
        return navPoints;
    }

    getAttr(tagName: string, attrName: string, document : Element) : string {
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
    getTextContent(tagName : string, document : Element | Document) {
        let text = "";
        let element = document.getElementsByTagName(tagName)[0];
        if (element) {
            //text = xpath.select("string(//*[local-name(.)='text'])", element)
            let textElement = element.getElementsByTagName("text")[0]
            if (textElement && textElement.textContent !== null) {
                text = textElement.textContent
            }
        }
        return text;
    }

    init_spine() {
        if (this.rootOPFFileXmlDoc === undefined) {
            return;
        }
        let manifest = this.rootOPFFileXmlDoc.getElementsByTagName('manifest')[0]
        if (!manifest) {
            console.error("There is no manifest element in the book opf file")
        } else {
            let manifestItems = [];
            let items = manifest.getElementsByTagName('item')
            for (let i = 0; i < items.length; i++) {
                let node = items[i]
                if (node.tagName === 'item') {
                    let manifestItem = new ManifestItem();
                    manifestItem.id = node.getAttribute('id');
                    manifestItem.href = node.getAttribute('href');
                    manifestItem.mediaType = node.getAttribute('media-type');
                    let valid = true;
                    if (manifestItem.id === null || manifestItem.id === "") {
                        console.warn("There is no id attribute for item element");
                        valid = false;
                    }
                    if (manifestItem.href === null || manifestItem.href === "") {
                        console.warn("There is no href attribute for item element");
                        valid = false;
                    }
                    if (valid && manifestItem.href !== null) {
                        manifestItem.fullFilepath = path.resolve(this.contentBaseDir, manifestItem.href);
                        manifestItems.push(manifestItem);
                    }
                }
            }
            this.manifestItems = manifestItems;
        }

        let spineElement = this.rootOPFFileXmlDoc.getElementsByTagName('spine')[0]
        if (!spineElement) {
            console.error("There is no spine element in the book opf file")
        } else {
            let spine = [];
            let items = spineElement.getElementsByTagName('itemref')
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

    parseContainerFile() : void {
        let containerFilepath = path.resolve(CURRENT_BOOK_PATH, 'META-INF', 'container.xml');
        this.containerXmlDoc = readXMLFile(containerFilepath);
    }

    parseRootOPFFile() : void {
        if (this.rootOPFFilepath !== undefined) {
            this.rootOPFFileXmlDoc = readXMLFile(this.rootOPFFilepath);
        }
    }
    parseTOCFile() : void {
        if (this.tocFilepath !== undefined) {
            this.tocFileXmlDoc = readXMLFile(this.tocFilepath);
        }
    }

    determineTOCFilepath() : string | undefined {
        if (this.rootOPFFileXmlDoc === undefined) {
            return;
        }
        let spineElements = this.rootOPFFileXmlDoc.getElementsByTagName('spine')
        if (spineElements.length < 0) {
            console.error("There is invalide OPF file. No spine element");
            return;
        }
        if (spineElements.length > 1) {
            console.warn("There is more than one spine elements. Select first");
        }
        let spineElement = spineElements[0];
        let tocId = spineElement.getAttribute('toc');
        if (tocId == null || tocId === '') {
            console.error("There is no toc attribute in the spine element")
            return;
        }
        // let tocItemElement = this.rootOPFFileXmlDoc.getElementById(tocId) // throw Refference Exception
        let tocItemNode : Node[] = xpath.select("//*[local-name(.)='manifest']/*[local-name(.)='item' and @id='" + tocId + "']", this.rootOPFFileXmlDoc) as Node[];
        if (tocItemNode.length < 0 || tocItemNode[0].nodeType !== Node.ELEMENT_NODE) {
            console.error("There is no toc item element with the '" + tocId + "' id ")
            return;
        }
        let tocItemElement = tocItemNode[0] as Element
        let tocFilepath = tocItemElement.getAttribute('href');
        if (tocFilepath == null || tocFilepath === '') {
            console.error("There is no href attribute in the item element")
            return;
        }
        // pash is related to the location of *.OPF file
        this.tocFilepath = path.resolve(this.contentBaseDir, tocFilepath);
        return this.tocFilepath
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

    determineRootOPFFilepath() : string | undefined {
        //let select = xpath.useNamespaces({"xmlns": "urn:oasis:names:tc:opendocument:xmlns:container"})
        //select("//xmlns:container/xmlns:rootfiles/xmlns:rootfile", this.containerXmlDoc)
        //xpath.select("//*[local-name(.)='rootfile' and namespace-uri(.)!='fakeuri']", this.containerXmlDoc)

        let rootFiles : Node[] = xpath.select("//*[local-name(.)='rootfile']", this.containerXmlDoc) as Node[]
        if (rootFiles.length < 1 || rootFiles[0].nodeType !== Node.ELEMENT_NODE) {
            // TODO: find file in the current book with extention *.opf
            return;
        }
        if (rootFiles.length > 1) {
            console.warn('WARNING: Only first rootfile is taken')
        }
        let rootFile = rootFiles[0] as Element;
        let rootfileFullPath = rootFile.getAttribute('full-path');
        let rootfileMediaType = rootFile.getAttribute('media-type');
        if (rootfileMediaType != 'application/oebps-package+xml') {
            console.warn("WARNING: media-type should be: application/oebps-package+xml, but it is:" + rootfileMediaType)
        }
        if (rootfileFullPath === null || rootfileFullPath === '') {
            console.warn("WARNING: rootfile full-path attribute is absant or empty")
        }
        if (rootfileFullPath !== null) {
            this.rootOPFFilepath = path.resolve(CURRENT_BOOK_PATH, rootfileFullPath);
            this.contentBaseDir = path.dirname(this.rootOPFFilepath);
        }
        return this.rootOPFFilepath;
    }

    printAllFilesInTheBook() {
        this.files = getAllFiles(CURRENT_BOOK_PATH);
        console.log('All book files (size: ' + this.files.length + '):')
        for (const file of this.files) {
            console.log('    ' + file);
        }
    }


    clearCurrentBookDir() {
        try {
            fs.emptyDirSync(CURRENT_BOOK_PATH)
            console.log('success!')
        } catch (err) {
            console.error(err)
            throw err;
        }
    }

    extractCurrentBook(callbackOnComplete : Function) {
        extractZip(this.filepath, { dir: CURRENT_BOOK_PATH }, (err: any) => {
            if (err) {
                console.error(err)
            } else {
                callbackOnComplete()
            }
        })
    }

    printBookEntries() {
        yauzl.open(this.filepath, function (err, zipfile) {
            if (err) throw err;
            if (zipfile !== undefined) {
                zipfile.on("error", function (err) {
                    throw err;
                });
                zipfile.on("entry", function (entry) {
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
