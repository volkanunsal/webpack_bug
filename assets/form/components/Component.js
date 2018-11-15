import React from 'react';
import t from 'tcomb-validation';
import { merge, getTypeInfo, isArraysShallowDiffers } from '../util';

const SOURCE = 'tcomb-form';
const noobj = Object.freeze({});

export default class Component extends React.Component {
  static transformer = {
    format: value => (t.Nil.is(value) ? null : value),
    parse: value => value,
  };

  constructor(props) {
    super(props);
    this.typeInfo = getTypeInfo(props.type);
    this.state = {
      isPristine: true,
      hasError: false,
      value: this.getTransformer().format(props.value),
    };
  }

  getTransformer() {
    return this.props.options.transformer || this.constructor.transformer;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    const nextPath = Boolean(nextProps.ctx) && nextProps.ctx.path;
    const curPath = Boolean(props.ctx) && props.ctx.path;

    const should =
      nextState.value !== state.value ||
      nextState.hasError !== state.hasError ||
      nextProps.options !== props.options ||
      nextProps.type !== props.type ||
      isArraysShallowDiffers(nextPath, curPath);

    return should;
  }

  componentWillReceiveProps(props) {
    if (props.type !== this.props.type) {
      this.typeInfo = getTypeInfo(props.type);
    }
    const value = this.getTransformer().format(props.value);
    this.setState({ value });
  }

  onChange = value => {
    this.setState({ value, isPristine: false }, () => {
      this.props.onChange(value, this.props.ctx.path);
    });
  };

  getValidationOptions() {
    const context = this.props.context || this.props.ctx.context;
    return {
      path: this.props.ctx.path,
      context: t.mixin(t.mixin({}, context), { options: this.props.options }),
    };
  }

  getValue() {
    return this.getTransformer().parse(this.state.value);
  }

  isValueNully() {
    return t.Nil.is(this.getValue());
  }

  removeErrors() {
    this.setState({ hasError: false });
  }

  validate() {
    const result = t.validate(
      this.getValue(),
      this.props.type,
      this.getValidationOptions()
    );
    this.setState({ hasError: !result.isValid() });
    return result;
  }

  getAuto() {
    return this.props.options.auto || this.props.ctx.auto;
  }

  getI18n() {
    return this.props.options.i18n || this.props.ctx.i18n;
  }

  getDefaultLabel() {
    const label = this.props.ctx.label;
    if (label) {
      const suffix = this.typeInfo.isMaybe
        ? this.getI18n().optional
        : this.getI18n().required;
      return label + suffix;
    }
  }

  getLabel() {
    let label = this.props.options.label || this.props.options.legend;
    if (t.Nil.is(label) && this.getAuto() === 'labels') {
      label = this.getDefaultLabel();
    }
    return label;
  }

  getError() {
    if (this.hasError()) {
      const error =
        this.props.options.error || this.typeInfo.getValidationErrorMessage;
      if (t.Function.is(error)) {
        const { path, context } = this.getValidationOptions();
        return error(this.getValue(), path, context);
      }
      return error;
    }
  }

  hasError() {
    return this.props.options.hasError || this.state.hasError;
  }

  getConfig() {
    return merge(this.props.ctx.config, this.props.options.config);
  }

  getId() {
    const attrs = this.props.options.attrs || noobj;
    if (attrs.id) {
      return attrs.id;
    }
    if (!this.uid) {
      this.uid = this.props.ctx.uidGenerator.next();
    }
    return this.uid;
  }

  getName() {
    return this.props.options.name || this.props.ctx.name || this.getId();
  }

  getLocals() {
    const options = this.props.options;
    const value = this.state.value;
    return {
      typeInfo: this.typeInfo,
      path: this.props.ctx.path,
      isPristine: this.state.isPristine,
      error: this.getError(),
      hasError: this.hasError(),
      label: this.getLabel(),
      onChange: this.onChange,
      config: this.getConfig(),
      value,
      disabled: options.disabled,
      help: options.help,
      context: this.props.ctx.context,
    };
  }

  render() {
    const locals = this.getLocals();
    if (process.env.NODE_ENV !== 'production') {
      // getTemplate is the only required implementation when extending Component
      t.assert(
        t.Function.is(this.getTemplate),
        `[${SOURCE}] missing getTemplate method of component ${
          this.constructor.name
        }`
      );
    }
    const template = this.getTemplate();
    return template(locals);
  }
}
