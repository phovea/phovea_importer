/**
 * Created by Samuel Gratzl on 29.09.2016.
 */
import { EventHandler } from 'tdp_core';
import * as d3 from 'd3';
import { IDataDescription } from 'tdp_core';
export interface IImporterOptions {
    /**
     * type to import: table,matrix
     */
    type?: string;
}
export declare class Importer extends EventHandler {
    private options;
    private $parent;
    private builder;
    constructor(parent: Element, options?: IImporterOptions);
    private selectedFile;
    private build;
    getResult(): {
        data: any;
        desc: IDataDescription;
    };
    static createImporter(parent: Element, options?: IImporterOptions): Importer;
    static selectFileLogic($dropZone: d3.Selection<any>, $files: d3.Selection<any>, onFileSelected: (file: File) => any, overCssClass?: string): void;
}
