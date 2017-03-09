/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {list as listidtypes, isInternalIDType} from 'phovea_core/src/idtype';
import {ITypeDefinition, IValueTypeEditor, createDialog, ValueTypeEditor} from './valuetypes';
import {list} from 'phovea_core/src/plugin';

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */

const EXTENSION_POINT = 'idTypeDetector';

export interface IIDTypeDetector {
  detectIDType: (data: any[], accessor: (row: any) => string, sampleSize: number, options?: {[property: string]: any}) => Promise<number>|number;
}

interface IPluginResult {
  idType: string;
  confidence: number;
}


function editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const idtype = (<any>definition).idType || 'Custom';
  const existing = listidtypes().filter((d) => !isInternalIDType(d));

  return new Promise((resolve) => {
    const dialog = createDialog('Edit IDType', 'idtype', () => {

      const value = (<HTMLInputElement>dialog.body.querySelector('input')).value;
      const existingIDType = existing.find((idType) => idType.id === value);
      const idType = existingIDType? existingIDType.id : value;

      dialog.hide();
      definition.type = 'idType';
      (<any>definition).idType = idType;
      resolve(definition);
    });
    dialog.body.innerHTML = `
        <div class="form-group">
          <label for="idType_new">New IDType</label>
          <input type="text" class="form-control" id="idType_new" value="${existing.some((i) => i.id === idtype) ? '' : idtype}">
        </div>
    `;

    dialog.show();
  });
}

async function guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const anyDef: any = def;
  if (typeof anyDef.idType !== 'undefined') {
    return def;
  }

  const pluginPromise = executePlugins(data, accessor, Math.min(data.length, 100));
  const results = await pluginPromise;
  const confidences = results.map((result) => result.confidence);

  const maxConfidence = Math.max(...confidences);

  anyDef.idType = maxConfidence > 0.7? results[confidences.indexOf(maxConfidence)].idType : 'Custom';

  return def;
}

async function isIDType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
  const pluginPromise = executePlugins(data, accessor, sampleSize);
  const results = await pluginPromise;

  const confidences = results.map((result) => result.confidence);

  return Math.max(...confidences);
}

async function executePlugins(data: any[], accessor: (row: any) => string, sampleSize: number) {
  const results = list(EXTENSION_POINT).map( async (pluginDesc) => {
    const factory = await pluginDesc.load();
    const options = pluginDesc.options? pluginDesc.options : null;
    const plugin: IIDTypeDetector = factory.factory();
    const confidence = await plugin.detectIDType(data, accessor, sampleSize, options);
    return {
      idType: pluginDesc.idType,
      confidence
    };
  });

  return await Promise.all(results);
}

function parseIDType(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
  //TODO check all ids
  return [];
}

function getMarkup(this: ValueTypeEditor, current: ValueTypeEditor, def: ITypeDefinition): string {
  const allIDTypes = listidtypes().filter((idType) => !isInternalIDType(idType));

  return `<optgroup label="Identifier" data-type="${this.id}">
        ${allIDTypes.map((type) => `<option value="${type.id}" ${current && current.id === this.id && type.name === def.idType ? 'selected="selected"' : ''}>${type.name}</option>`).join('\n')}
    </optgroup>`;
}

export function idType(): IValueTypeEditor {
  return {
    isType: isIDType,
    parse: parseIDType,
    guessOptions: guessIDType,
    edit: editIDType,
    getOptionsMarkup: getMarkup
  };
}
