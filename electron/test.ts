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
function read_xml_file(xml_filepath: string): Document | undefined {
    let xmldoc;
    if (fs.existsSync(xml_filepath) && fs.statSync(xml_filepath).isFile()) {
        try {
            let data = fs.readFileSync(xml_filepath, 'utf-8');
            console.log("Reading xml file “" + xml_filepath + "” (size" + data.length + ")...");
            let parser = new DOMParser();
            xmldoc = parser.parseFromString(data, "application/xml");
        } catch (err) {
            console.error("An error ocurred reading the file :" + err.message);
        }
    }
    return xmldoc;
}
function test() : any {
    //let select = xpath.useNamespaces({"xmlns": "urn:oasis:names:tc:opendocument:xmlns:container"})
    //select("//xmlns:container/xmlns:rootfiles/xmlns:rootfile", this.containerXmlDoc)
    //xpath.select("//*[local-name(.)='rootfile' and namespace-uri(.)!='fakeuri']", this.containerXmlDoc)
    let container_filepath = __dirname + '/../data/currentBook/META-INF/container.xml';
    let container_xmldoc = read_xml_file(container_filepath);

    let root_files : Node[] = xpath.select("//*[local-name(.)='rootfile']", container_xmldoc) as Node[]
    let rr = root_files[0].constructor.name
    console.log(rr)
    let aaa = new DOMImplementation();
    if (root_files.length < 1 || !(root_files[0].nodeType == Node.ELEMENT_NODE)) {
        // TODO: find file in the current book with extention *.opf
        return;
    }
    let element = root_files[0] as Element
    element.getAttribute("test")
    if (root_files.length > 1) {
        console.warn('WARNING: Only first rootfile is taken')
    }
    let rootFile = root_files[0];

    return null;
}
