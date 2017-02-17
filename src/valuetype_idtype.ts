/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {list as listidtypes, isInternalIDType} from 'phovea_core/src/idtype';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import {ITypeDefinition, IValueTypeEditor, createDialog} from './valuetypes';

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

function guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const anyDef: any = def;
  if (typeof anyDef.idType !== 'undefined') {
    return def;
  }
  anyDef.idType = 'Custom';
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
  const values = [];

  for(let i = 0; i < testSize; ++i) {
    const v = accessor(data[i]);

    if (v == null || v.trim().length === 0) {
      continue; //skip empty samples
    }

    if(v.indexOf('ENSG') >= 0) {
      ++foundIDTypes;
    }
    values.push(v);
    ++validSize;
  }

  if(foundIDTypes) {
    return foundIDTypes / validSize;
  }

  const param = {
    entity_name: 'celllinename',
    schema: 'cellline',
    table_name: 'cellline',
    query: `'${values.join('\',\'')}'`
  };

  getAPIJSON('/targid/db/bioinfodb/check_id_types', param).then((result) => {
    console.log('RESULT', result);
    console.log('TEST', result[0].matches / validSize);
  }, (reason) => console.error('Could not fetch', reason));
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
