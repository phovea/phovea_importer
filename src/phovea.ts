import {IRegistry, asResource} from 'phovea_core/src/plugin';
import {EP_PHOVEA_CORE_LOCALE, ILocaleEPDesc} from 'phovea_core/src/extensions';

export default function (registry: IRegistry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./extension_impl'); }, {});
  registry.push('importer_value_type', 'categorical', function () {
    return System.import('./valuetypes');
  }, {
    'factory': 'categorical',
    'name': 'Categorical',
    'priority': 30
  });

  registry.push('importer_value_type', 'real', function () {
    return System.import('./valuetypes');
  }, {
    'factory': 'numerical',
    'name': 'Float',
    'priority': 10
  });

  registry.push('importer_value_type', 'int', function () {
    return System.import('./valuetypes');
  }, {
    'factory': 'numerical',
    'name': 'Integer',
    'priority': 20
  });

  registry.push('importer_value_type', 'string', function () {
    return System.import('./valuetypes');
  }, {
    'factory': 'string_',
    'name': 'String',
    'priority': 100
  });

  registry.push('importer_value_type', 'idType', function () {
    return System.import('./valuetype_idtype');
  }, {
    'factory': 'idType',
    'name': 'IDType',
    'priority': 50,
    'implicit': true
  });

  registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaImporterLocaleEN', function () {
    return System.import('./assets/locales/en/phovea.json').then(asResource);
  }, <ILocaleEPDesc>{
    ns: 'phovea',
  });


}
