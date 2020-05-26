/**
 * Created by Samuel Gratzl on 29.09.2016.
 */
import { BaseUtils } from 'phovea_core';
import * as papaparse from 'papaparse';
const defaultOptions = {
    skipEmptyLines: true
};
/**
 * parses the given csv file/blob using PapaParse
 * @param data
 * @param options additional options
 * @return {Promise<R>|Promise}
 */
export function parseCSV(data, options = {}) {
    return new Promise((resolve, reject) => {
        papaparse.parse(data, BaseUtils.mixin({
            complete: (result) => resolve({ data: result.data, meta: result.meta }),
            error: (error) => reject(error)
        }, defaultOptions, options));
    });
}
export function streamCSV(data, chunk, options = {}) {
    return new Promise((resolve, reject) => {
        papaparse.parse(data, BaseUtils.mixin({
            complete: (result) => resolve(null),
            chunk: (result) => chunk({ data: result.data, meta: result.meta }),
            error: (error) => reject(error)
        }, defaultOptions, options));
    });
}
//# sourceMappingURL=parser.js.map