import t from 'tcomb-validation';
import { getTypeInfo, toNull, parseNumber } from '../util';
import decorators from './decorators';
import Component from './Component';

const noobj = Object.freeze({});

@decorators.attrs
@decorators.template('textbox')
export default class Textbox extends Component {
  static transformer = {
    format: value => (t.Nil.is(value) ? '' : value),
    parse: toNull,
  };

  static numberTransformer = {
    format: value => (t.Nil.is(value) ? '' : String(value)),
    parse: parseNumber,
  };

  getTransformer() {
    const options = this.props.options;
    if (options.transformer) {
      return options.transformer;
    } else if (this.typeInfo.innerType === t.Number) {
      return Textbox.numberTransformer;
    }
    return Textbox.transformer;
  }

  componentWillReceiveProps(props) {
    if (props.type !== this.props.type) {
      this.typeInfo = getTypeInfo(props.type);
    }
    const value = this.getTransformer().format(props.value);
    this.setState({ value });
  }

  getPlaceholder() {
    const attrs = this.props.options.attrs || noobj;
    let placeholder = attrs.placeholder;
    if (t.Nil.is(placeholder) && this.getAuto() === 'placeholders') {
      placeholder = this.getDefaultLabel();
    }
    return placeholder;
  }

  getLocals() {
    const locals = super.getLocals();
    locals.attrs = this.getAttrs();
    locals.attrs.placeholder = this.getPlaceholder();
    locals.type = this.props.options.type || 'text';
    return locals;
  }
}
