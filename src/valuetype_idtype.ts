/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {list as listidtypes, isInternalIDType} from 'phovea_core/src/idtype';
import {ITypeDefinition, IValueTypeEditor, createDialog} from './valuetypes';
import * as plugins from 'phovea_core/src/plugin';

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
function editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const idtype = (<any>definition).idType || 'Custom';
  const existing = listidtypes().filter((d) => !isInternalIDType(d));
  const idtypeList = existing.map((type) => `<option value="${type.id}" ${type.id === idtype ? 'selected="selected"' : ''}>${type.name}</option>`).join('\n');

  return new Promise((resolve) => {
    const dialog = createDialog('Edit IDType', 'idtype', () => {
      const selectedIndex = (<HTMLSelectElement>dialog.body.querySelector('select')).selectedIndex;
      const idType = selectedIndex <= 0 ? (<HTMLInputElement>dialog.body.querySelector('input')).value : existing[selectedIndex - 1].id;
      dialog.hide();
      definition.type = 'idType';
      (<any>definition).idType = idType;
      resolve(definition);
    });
    dialog.body.innerHTML = `
       <div class="form-group">
          <label for="idType">IDType</label>
          <select id="idType" class="form-control">
            <option value=""></option>
            ${idtypeList} 
          </select>
        </div>
        <div class="form-group">
          <label for="idType_new">New IDType</label>
          <input type="text" class="form-control" id="idType_new" value="${existing.some((i) => i.id === idtype) ? '' : idtype}">
        </div>
    `;
    (<HTMLSelectElement>(dialog.body.querySelector('select'))).addEventListener('change', function (e) {
      (<HTMLInputElement>(dialog.body.querySelector('input'))).disabled = (<HTMLSelectElement>this).selectedIndex !== 0;
    });

    dialog.show();
  });
}

async function guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const anyDef: any = def;
  if (typeof anyDef.idType !== 'undefined') {
    return def;
  }

  const pluginPromise = executePlugins(data, accessor, Math.min(data.length, 100));
  const {idTypes, results} = await pluginPromise;

  const maxConfidence = Math.max(...results);

  anyDef.idType = maxConfidence > 0.7? idTypes[results.indexOf(maxConfidence)] : 'Custom';

  return def;
}

async function isIDType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
  const pluginPromise = executePlugins(data, accessor, sampleSize);

  const {results} = await pluginPromise;
  return Math.max(...results);
}

async function executePlugins(data: any[], accessor: (row: any) => string, sampleSize: number) {
  const pluginPromises: Promise<number>[] = [];
  const idTypes: string[] = [];
  plugins.list('idTypeDetector').forEach((pluginDesc) => {
    idTypes.push(pluginDesc.idType);
    pluginPromises.push(pluginDesc.load().then((factory) => {
      const plugin = factory.factory();
      return plugin.detectIDType(data, accessor, sampleSize);
    }));
  });

  const results = await Promise.all(pluginPromises);
  return {
    idTypes,
    results
  };
}

function parseIDType(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
  //TODO check all ids
  return [];
}

export function idType(): IValueTypeEditor {
  return {
    isType: isIDType,
    parse: parseIDType,
    guessOptions: guessIDType,
    edit: editIDType
  };
}
