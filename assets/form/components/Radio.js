import t from 'tcomb-validation';
import { getComparator, getOptionsOfEnum } from '../util';
import decorators from './decorators';
import Component from './Component';

@decorators.attrs
@decorators.template('radio')
export default class Radio extends Component {
  static transformer = {
    format: value => (t.Nil.is(value) ? null : value),
    parse: value => value,
  };

  getOptions() {
    const options = this.props.options;
    const items = options.options
      ? options.options.slice()
      : getOptionsOfEnum(this.typeInfo.innerType);
    if (options.order) {
      items.sort(getComparator(options.order));
    }
    return items;
  }

  getLocals() {
    const locals = super.getLocals();
    locals.attrs = this.getAttrs();
    locals.options = this.getOptions();
    return locals;
  }
}
