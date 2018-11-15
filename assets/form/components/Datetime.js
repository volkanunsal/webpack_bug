import t from 'tcomb-validation';
import { parseNumber } from '../util';
import decorators from './decorators';
import Component from './Component';

const defaultDatetimeValue = Object.freeze([null, null, null]);

@decorators.attrs
@decorators.template('date')
export default class Datetime extends Component {
  static transformer = {
    format: value => {
      if (t.Array.is(value)) {
        return value;
      } else if (t.Date.is(value)) {
        return [value.getFullYear(), value.getMonth(), value.getDate()].map(
          String
        );
      }
      return defaultDatetimeValue;
    },
    parse: value => {
      const numbers = value.map(parseNumber);
      if (numbers.every(t.Number.is)) {
        return new Date(numbers[0], numbers[1], numbers[2]);
      } else if (numbers.every(t.Nil.is)) {
        return null;
      }
      return numbers;
    },
  };

  getOrder() {
    return this.props.options.order || ['M', 'D', 'YY'];
  }

  getLocals() {
    const locals = super.getLocals();
    locals.attrs = this.getAttrs();
    locals.order = this.getOrder();
    return locals;
  }
}
