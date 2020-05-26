/**
 * Created by Samuel Gratzl on 29.09.2016.
 */
export interface IParseResult {
    data: any;
    meta: any;
}
export interface ICSVParsingOptions {
    header?: boolean;
    delimiter?: string;
    newline?: string;
}
/**
 * parses the given csv file/blob using PapaParse
 * @param data
 * @param options additional options
 * @return {Promise<R>|Promise}
 */
export declare function parseCSV(data: any, options?: ICSVParsingOptions): Promise<IParseResult>;
export declare function streamCSV(data: any, chunk: (chunk: IParseResult) => any, options?: ICSVParsingOptions): Promise<IParseResult>;
