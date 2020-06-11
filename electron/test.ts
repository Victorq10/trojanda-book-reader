//import * as electron from 'electron'
import { app, BrowserWindow, Menu, MenuItem, ipcMain, Tray, OpenDialogReturnValue, 
    dialog, remote } from "electron"
import * as path from 'path'
import * as fs from 'fs'
import './Constants'
import { APP_ASSETS_DIR, APP_HOME_DIR } from "./Constants";
import { TrojandaBook } from './TrojandaBook'


import {DOMParser, DOMImplementation, DOMParserStatic} from 'xmldom';
import * as xpath from 'xpath';
//import 'dom'
//import * as dom from require('./../node_modules/xmldom/lib/dom.js');
const dom = require(__dirname + '/../node_modules/xmldom/lib/dom');
const Node = dom.Node;
const ELEMENT_NODE = dom.ELEMENT_NODE;
console.log(dom)
console.log(dom.Node)
test();
function readXMLFile(xmlfilepath: string): Document | undefined {
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
function test() : any {
    //let select = xpath.useNamespaces({"xmlns": "urn:oasis:names:tc:opendocument:xmlns:container"})
    //select("//xmlns:container/xmlns:rootfiles/xmlns:rootfile", this.containerXmlDoc)
    //xpath.select("//*[local-name(.)='rootfile' and namespace-uri(.)!='fakeuri']", this.containerXmlDoc)
    let containerFilepath = __dirname + '/../data/currentBook/META-INF/container.xml';
    let containerXmlDoc = readXMLFile(containerFilepath);

    let rootFiles : Node[] = xpath.select("//*[local-name(.)='rootfile']", containerXmlDoc) as Node[]
    let rr = rootFiles[0].constructor.name
    console.log(rr)
    let aaa = new DOMImplementation();
    if (rootFiles.length < 1 || !(rootFiles[0].nodeType == Node.ELEMENT_NODE)) {
        // TODO: find file in the current book with extention *.opf
        return;
    }
    let element = rootFiles[0] as Element
    element.getAttribute("test")
    if (rootFiles.length > 1) {
        console.warn('WARNING: Only first rootfile is taken')
    }
    let rootFile = rootFiles[0];

    return null;
}
