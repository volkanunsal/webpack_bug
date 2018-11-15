import React from 'react';
import t from 'tcomb-validation';
import {
  move,
  getTypeInfo,
  getTypeFromUnion,
  getComponentOptions,
} from '../util';
import decorators from './decorators';
import ComponentWithChildRefs from './ComponentWithChildRefs';
import getFormComponent from './getFormComponent';

const noobj = Object.freeze({});
const noarr = Object.freeze([]);

function toSameLength(value, keys, uidGenerator) {
  if (value.length === keys.length) {
    return keys;
  }
  const ret = [];
  for (let i = 0, len = value.length; i < len; i++) {
    ret[i] = keys[i] || uidGenerator.next();
  }
  return ret;
}

@decorators.templates
export default class List extends ComponentWithChildRefs {
  static transformer = {
    format: value => (t.Nil.is(value) ? noarr : value),
    parse: value => value,
  };

  constructor(props) {
    super(props);
    this.state.keys = this.state.value.map(() => props.ctx.uidGenerator.next());
  }

  componentWillReceiveProps(props) {
    if (props.type !== this.props.type) {
      this.typeInfo = getTypeInfo(props.type);
    }
    const value = this.getTransformer().format(props.value);
    this.setState({
      value,
      keys: toSameLength(value, this.state.keys, props.ctx.uidGenerator),
    });
  }

  isValueNully() {
    return this.state.value.length === 0;
  }

  removeErrors() {
    this.setState({ hasError: false });
    Object.keys(this.childRefs).forEach(key =>
      this.childRefs[key].removeErrors()
    );
  }

  validate() {
    let value = [];
    let errors = [];
    let result;

    if (this.typeInfo.isMaybe && this.isValueNully()) {
      this.removeErrors();
      return new t.ValidationResult({ errors: [], value: null });
    }

    for (let i = 0, len = this.state.value.length; i < len; i++) {
      result = this.childRefs[i].validate();
      errors = errors.concat(result.errors);
      value.push(result.value);
    }

    // handle subtype
    if (this.typeInfo.isSubtype && errors.length === 0) {
      value = this.getTransformer().parse(value);
      result = t.validate(value, this.props.type, this.getValidationOptions());
      errors = result.errors;
    }

    this.setState({ hasError: errors.length > 0 });
    return new t.ValidationResult({ errors, value });
  }

  onChange = (value, keys, path, kind) => {
    const allkeys = toSameLength(value, keys, this.props.ctx.uidGenerator);
    this.setState({ value, keys: allkeys, isPristine: false }, () => {
      this.props.onChange(value, path, kind);
    });
  };

  addItem = () => {
    const value = this.state.value.concat(undefined);
    const keys = this.state.keys.concat(this.props.ctx.uidGenerator.next());
    this.onChange(
      value,
      keys,
      this.props.ctx.path.concat(value.length - 1),
      'add'
    );
  };

  onItemChange(itemIndex, itemValue, path, kind) {
    const value = this.state.value.slice();
    value[itemIndex] = itemValue;
    this.onChange(value, this.state.keys, path, kind);
  }

  removeItem(i) {
    const value = this.state.value.slice();
    value.splice(i, 1);
    const keys = this.state.keys.slice();
    keys.splice(i, 1);
    this.onChange(value, keys, this.props.ctx.path.concat(i), 'remove');
  }

  moveUpItem(i) {
    if (i > 0) {
      this.onChange(
        move(this.state.value.slice(), i, i - 1),
        move(this.state.keys.slice(), i, i - 1),
        this.props.ctx.path.concat(i),
        'moveUp'
      );
    }
  }

  moveDownItem(i) {
    if (i < this.state.value.length - 1) {
      this.onChange(
        move(this.state.value.slice(), i, i + 1),
        move(this.state.keys.slice(), i, i + 1),
        this.props.ctx.path.concat(i),
        'moveDown'
      );
    }
  }

  getTemplate() {
    return this.props.options.template || this.getTemplates().list;
  }

  getItems() {
    const { options, ctx } = this.props;
    const auto = this.getAuto();
    const i18n = this.getI18n();
    const config = this.getConfig();
    const templates = this.getTemplates();
    const value = this.state.value;
    return value.map((itemValue, i) => {
      const type = this.typeInfo.innerType.meta.type;
      const itemType = getTypeFromUnion(type, itemValue);
      const itemOptions = getComponentOptions(
        options.item,
        noobj,
        itemValue,
        type
      );
      const ItemComponent = getFormComponent(itemType, itemOptions);
      const buttons = [];
      if (!options.disableRemove) {
        buttons.push({
          type: 'remove',
          label: i18n.remove,
          click: this.removeItem.bind(this, i),
        });
      }
      if (!options.disableOrder) {
        buttons.push({
          type: 'move-up',
          label: i18n.up,
          click: this.moveUpItem.bind(this, i),
        });
      }
      if (!options.disableOrder) {
        buttons.push({
          type: 'move-down',
          label: i18n.down,
          click: this.moveDownItem.bind(this, i),
        });
      }
      return {
        input: React.createElement(ItemComponent, {
          ref: this.setChildRefFor(i),
          type: itemType,
          options: itemOptions,
          value: itemValue,
          onChange: this.onItemChange.bind(this, i),
          ctx: {
            context: ctx.context,
            uidGenerator: ctx.uidGenerator,
            auto,
            config,
            i18n,
            name: ctx.name ? `${ctx.name}[${i}]` : String(i),
            templates,
            path: ctx.path.concat(i),
          },
        }),
        key: this.state.keys[i],
        buttons,
      };
    });
  }

  getLocals() {
    const options = this.props.options;
    const i18n = this.getI18n();
    const locals = super.getLocals();
    locals.add = options.disableAdd
      ? null
      : {
          type: 'add',
          label: i18n.add,
          click: this.addItem,
        };
    locals.items = this.getItems();
    locals.className = options.className;
    return locals;
  }
}
