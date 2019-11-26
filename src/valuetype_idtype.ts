/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {resolve as resolveIDType} from 'phovea_core/src/idtype';
import {listAll as listAllIDTypes} from 'phovea_core/src/idtype/manager';
import {ITypeDefinition, IValueTypeEditor, createDialog, ValueTypeEditor, numerical} from './valuetypes';
import {list} from 'phovea_core/src/plugin';
import {isInternalIDType} from 'phovea_core/src/idtype/manager';
import i18n from 'phovea_core/src/i18n';

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */

const EXTENSION_POINT = 'idTypeDetector';

export interface IIDTypeDetector {
  detectIDType: (data: any[], accessor: (row: any) => string, sampleSize: number, options?: {[property: string]: any}) => Promise<number> | number;
}

interface IPluginResult {
  idType: string;
  confidence: number;
}


function editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const idtype = (<any>definition).idType || 'Custom';

  return new Promise(async (resolve) => {
    const existing = await listAllIDTypes();
    const existingFiltered = existing.filter((d) => !isInternalIDType(d));
    const dialog = createDialog(i18n.t('phovea:importer.editIdType'), 'idtype', () => {

      const value = (<HTMLInputElement>dialog.body.querySelector('input')).value;
      const existingIDType = existingFiltered.find((idType) => idType.id === value);
      const idType = existingIDType ? existingIDType.id : value;

      dialog.hide();
      definition.type = 'idType';
      (<any>definition).idType = idType;

      resolveIDType(idType);
      resolve(definition);
    });
    dialog.body.innerHTML = `
        <div class="form-group">
          <label for="idType_new">${i18n.t('phovea:importer.dialogLabel')}</label>
          <input type="text" class="form-control" id="idType_new" value="${existingFiltered.some((i) => i.id === idtype) ? '' : idtype}">
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

  anyDef.idType = maxConfidence > 0.7 ? results[confidences.indexOf(maxConfidence)].idType : 'Custom';

  return def;
}

async function isIDType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
  //first check if it is number then it cant be an IDType
  const isNumber = numerical().isType(name, index, data, accessor, sampleSize);
  if (isNumber > 0.8) {
    // pretty sure it is a number
    return 0;
  }

  const pluginPromise = executePlugins(data, accessor, sampleSize);
  const results = await pluginPromise;

  const confidences = results.map((result) => result.confidence);

  return Math.max(...confidences);
}

async function executePlugins(data: any[], accessor: (row: any) => string, sampleSize: number): Promise<IPluginResult[]> {
  const results = list(EXTENSION_POINT).map(async (pluginDesc) => {
    const factory = await pluginDesc.load();
    const options = pluginDesc.options ? pluginDesc.options : null;
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

async function getMarkup(this: ValueTypeEditor, current: ValueTypeEditor, def: ITypeDefinition): Promise<string> {
  const allIDTypes = await listAllIDTypes();
  const allNonInternalIDtypes = allIDTypes.filter((idType) => !isInternalIDType(idType));

  return `<optgroup label="${i18n.t('phovea:importer.optionLabel')}" data-type="${this.id}">
        ${allNonInternalIDtypes.map((type) => `<option value="${type.id}" ${current && current.id === this.id && type.name === def.idType ? 'selected="selected"' : ''}>${type.name}</option>`).join('\n')}
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
