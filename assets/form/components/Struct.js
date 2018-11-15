import React from 'react';
import t from 'tcomb-validation';
import { humanize, getTypeFromUnion, getComponentOptions } from '../util';
import decorators from './decorators';
import ComponentWithChildRefs from './ComponentWithChildRefs';
import getFormComponent from './getFormComponent';

const noobj = Object.freeze({});

@decorators.templates
export default class Struct extends ComponentWithChildRefs {
  static transformer = {
    format: value => (t.Nil.is(value) ? noobj : value),
    parse: value => value,
  };

  isValueNully() {
    return Object.keys(this.childRefs).every(key =>
      this.childRefs[key].isValueNully()
    );
  }

  removeErrors() {
    this.setState({ hasError: false });
    Object.keys(this.childRefs).forEach(key =>
      this.childRefs[key].removeErrors()
    );
  }

  validate() {
    let value = {};
    let errors = [];
    let result;

    if (this.typeInfo.isMaybe && this.isValueNully()) {
      this.removeErrors();
      return new t.ValidationResult({ errors: [], value: null });
    }

    const props = this.getTypeProps();
    Object.keys(props).forEach(ref => {
      if ({}.hasOwnProperty.call(this.childRefs, ref)) {
        result = this.childRefs[ref].validate();
        errors = errors.concat(result.errors);
        value[ref] = result.value;
      }
    });

    if (errors.length === 0) {
      const InnerType = this.typeInfo.innerType;
      value = this.getTransformer().parse(value);
      value = new InnerType(value);
      if (this.typeInfo.isSubtype) {
        result = t.validate(
          value,
          this.props.type,
          this.getValidationOptions()
        );
        errors = result.errors;
      }
    }

    this.setState({ hasError: errors.length > 0 });
    return new t.ValidationResult({ errors, value });
  }

  onChange = (fieldName, fieldValue, path, kind) => {
    const value = t.mixin({}, this.state.value);
    value[fieldName] = fieldValue;
    this.setState({ value, isPristine: false }, () => {
      this.props.onChange(value, path, kind);
    });
  };

  getTemplate() {
    return this.props.options.template || this.getTemplates().struct;
  }

  getTypeProps() {
    return this.typeInfo.innerType.meta.props;
  }

  getOrder() {
    return this.props.options.order || Object.keys(this.getTypeProps());
  }

  getInputs() {
    const { options, ctx } = this.props;
    const props = this.getTypeProps();
    const auto = this.getAuto();
    const i18n = this.getI18n();
    const config = this.getConfig();
    const templates = this.getTemplates();
    const value = this.state.value;
    const inputs = {};

    Object.keys(props).forEach(prop => {
      if ({}.hasOwnProperty.call(props, prop)) {
        const type = props[prop];
        const propValue = value[prop];
        const propType = getTypeFromUnion(type, propValue);
        const fieldsOptions = options.fields || noobj;
        const propOptions = getComponentOptions(
          fieldsOptions[prop],
          noobj,
          propValue,
          type
        );
        inputs[prop] = React.createElement(
          getFormComponent(propType, propOptions),
          {
            key: ctx.path.concat(prop).join('-'),
            ref: this.setChildRefFor(prop),
            type: propType,
            options: propOptions,
            value: propValue,
            onChange: this.onChange.bind(this, prop),
            ctx: {
              context: ctx.context,
              uidGenerator: ctx.uidGenerator,
              auto,
              config,
              name: ctx.name ? `${ctx.name}[${prop}]` : prop,
              label: humanize(prop),
              i18n,
              templates,
              path: ctx.path.concat(prop),
            },
          }
        );
      }
    });
    return inputs;
  }

  getLocals() {
    const options = this.props.options;
    const locals = super.getLocals();
    locals.order = this.getOrder();
    locals.inputs = this.getInputs();
    locals.className = options.className;
    return locals;
  }
}
