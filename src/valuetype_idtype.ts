/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {list as listidtypes} from 'phovea_core/src/idtype';
import {ITypeDefinition, IValueTypeEditor, createDialog} from './valuetypes';

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
function editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const idtype = (<any>definition).idType || 'Custom';
  const existing = listidtypes();
  const idtypes_list = existing.map((type) => `<option value="${type.id}" ${type.id === idtype ? 'selected="selected"' : ''}>${type.name}</option>`).join('\n');

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
            ${idtypes_list} 
          </select>
        </div>
        <div class="form-group">
          <label for="idType_new">New IDType</label>
          <input type="text" class="form-control" id="idType_new" value="${existing.some((i) => i.id === idtype) ? '' : idtype}">
        </div>
    `;
    (<HTMLSelectElement>(dialog.body.querySelector('select'))).addEventListener('change', (e) => {
      (<HTMLInputElement>(dialog.body.querySelector('input'))).disabled = this.selectedIndex !== 0;
    });

    dialog.show();
  });
}

function guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const any_def: any = def;
  if (typeof any_def.idType !== 'undefined') {
    return def;
  }
  any_def.idType = 'Custom';
  //TODO
  return def;
}

function isIDType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
  //TODO guess the first one is it most of the times
  const testSize = Math.min(data.length, sampleSize);
  if (testSize <= 0) {
    return 0;
  }

  let foundIDTypes = 0;
  let validSize = 0;
  for(let i = 0; i < testSize; ++i) {
    let v = accessor(data[i]);

    if (v == null || v.trim().length === 0) {
      continue; //skip empty samples
    }

    if(v.indexOf('ENSG') >= 0) {
      ++foundIDTypes;
    }
    ++validSize;
  }

  return foundIDTypes / validSize;
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
