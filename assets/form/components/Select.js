import t from 'tcomb-validation';
import { getTypeInfo, getOptionsOfEnum, getComparator } from '../util';
import decorators from './decorators';
import Component from './Component';

const noarr = Object.freeze([]);

@decorators.attrs
@decorators.template('select')
export default class Select extends Component {
  static transformer = nullOption => {
    return {
      format: value =>
        t.Nil.is(value) && nullOption ? nullOption.value : value,
      parse: value => (nullOption && nullOption.value === value ? null : value),
    };
  };

  static multipleTransformer = {
    format: value => (t.Nil.is(value) ? noarr : value),
    parse: value => value,
  };

  getTransformer() {
    const options = this.props.options;
    if (options.transformer) {
      return options.transformer;
    }
    if (this.isMultiple()) {
      return Select.multipleTransformer;
    }
    return Select.transformer(this.getNullOption());
  }

  getNullOption() {
    return this.props.options.nullOption || { value: '', text: '-' };
  }

  isMultiple() {
    return this.typeInfo.innerType.meta.kind === 'list';
  }

  getEnum() {
    return this.isMultiple()
      ? getTypeInfo(this.typeInfo.innerType.meta.type).innerType
      : this.typeInfo.innerType;
  }

  getOptions() {
    const options = this.props.options;
    const items = options.options
      ? options.options.slice()
      : getOptionsOfEnum(this.getEnum());
    if (options.order) {
      items.sort(getComparator(options.order));
    }
    const nullOption = this.getNullOption();
    if (!this.isMultiple() && options.nullOption !== false) {
      items.unshift(nullOption);
    }
    return items;
  }

  getLocals() {
    const locals = super.getLocals();
    locals.attrs = this.getAttrs();
    locals.options = this.getOptions();
    locals.isMultiple = this.isMultiple();
    return locals;
  }
}
