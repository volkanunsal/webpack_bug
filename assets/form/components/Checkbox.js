import t from 'tcomb-validation';
import decorators from './decorators';
import Component from './Component';

@decorators.attrs
@decorators.template('checkbox')
export default class Checkbox extends Component {
  static transformer = {
    format: value => (t.Nil.is(value) ? false : value),
    parse: value => value,
  };

  getLocals() {
    const locals = super.getLocals();
    locals.attrs = this.getAttrs();
    // checkboxes must always have a label
    locals.label = locals.label || this.getDefaultLabel();
    return locals;
  }
}
