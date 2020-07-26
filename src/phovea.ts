import {IRegistry, PluginRegistry} from 'phovea_core';
import {EP_PHOVEA_CORE_LOCALE, ILocaleEPDesc} from 'phovea_core';

export default function (registry: IRegistry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./extension_impl'); }, {});
  registry.push('importer_value_type', 'categorical', function () {
    return import('./valuetype/valuetypes').then((v) => v.ValueTypeEditor);
  }, {
    'factory': 'categorical',
    'name': 'Categorical',
    'priority': 30
  });

  registry.push('importer_value_type', 'real', function () {
    return import('./valuetype/valuetypes').then((v) => v.ValueTypeEditor);
  }, {
    'factory': 'numerical',
    'name': 'Float',
    'priority': 10
  });

  registry.push('importer_value_type', 'int', function () {
    return import('./valuetype/valuetypes').then((v) => v.ValueTypeEditor);
  }, {
    'factory': 'numerical',
    'name': 'Integer',
    'priority': 20
  });

  registry.push('importer_value_type', 'string', function () {
    return import('./valuetype/valuetypes').then((v) => v.ValueTypeEditor);
  }, {
    'factory': 'string_',
    'name': 'String',
    'priority': 100
  });

  registry.push('importer_value_type', 'idType', function () {
    return import('./valuetype/idtypes').then((v) => v.IDTypeUtils);
  }, {
    'factory': 'idType',
    'name': 'IDType',
    'priority': 50,
    'implicit': true
  });

  registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaImporterLocaleEN', function () {
    return import('./locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
  }, <ILocaleEPDesc>{
    ns: 'phovea',
  });

}
