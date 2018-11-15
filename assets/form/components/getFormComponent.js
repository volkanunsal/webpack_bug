import t from 'tcomb-validation';
import { SOURCE } from '../util';
import Textbox from './Textbox';
import Checkbox from './Checkbox';
import Select from './Select';
import Datetime from './Datetime';
import Struct from './Struct';
import List from './List';

export default function getFormComponent(type, options) {
  if (options.factory) {
    return options.factory;
  }
  if (type.getTcombFormFactory) {
    return type.getTcombFormFactory(options);
  }
  const name = t.getTypeName(type);
  switch (type.meta.kind) {
    case 'irreducible':
      if (type === t.Boolean) {
        return Checkbox; // eslint-disable-line no-use-before-define
      } else if (type === t.Date) {
        return Datetime; // eslint-disable-line no-use-before-define
      }
      return Textbox; // eslint-disable-line no-use-before-define
    case 'struct':
    case 'interface':
      return Struct; // eslint-disable-line no-use-before-define
    case 'list':
      return List; // eslint-disable-line no-use-before-define
    case 'enums':
      return Select; // eslint-disable-line no-use-before-define
    case 'maybe':
    case 'subtype':
      return getFormComponent(type.meta.type, options);
    default:
      t.fail(`[${SOURCE}] unsupported kind ${type.meta.kind} for type ${name}`);
  }
}
