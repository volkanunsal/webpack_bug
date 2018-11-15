import React from 'react';
import t from 'tcomb-validation';
import {
  UIDGenerator,
  getTypeFromUnion,
  getComponentOptions,
  SOURCE,
} from '../util';
import getFormComponent from './getFormComponent';

const noobj = Object.freeze({});
const noop = () => {};

export default class Form extends React.Component {
  inputRef = null;

  setInputRef = ref => {
    this.inputRef = ref;
  };

  validate() {
    return this.inputRef.validate();
  }

  getValue() {
    const result = this.validate();
    return result.isValid() ? result.value : null;
  }

  getComponent(path) {
    const points = t.String.is(path) ? path.split('.') : path;
    return points.reduce((input, name) => input.childRefs[name], this.inputRef);
  }

  getSeed() {
    const rii = this._reactInternalInstance;
    if (rii) {
      if (rii._hostContainerInfo) {
        return rii._hostContainerInfo._idCounter;
      }
      if (rii._nativeContainerInfo) {
        return rii._nativeContainerInfo._idCounter;
      }
      if (rii._rootNodeID) {
        return rii._rootNodeID;
      }
    }
    return '0';
  }

  getUIDGenerator() {
    this.uidGenerator = this.uidGenerator || new UIDGenerator(this.getSeed());
    return this.uidGenerator;
  }

  render() {
    const { i18n, templates } = Form;

    if (process.env.NODE_ENV !== 'production') {
      t.assert(
        t.isType(this.props.type),
        `[${SOURCE}] missing required prop type`
      );
      t.assert(
        t.maybe(t.Object).is(this.props.options) ||
          t.Function.is(this.props.options) ||
          t.list(t.maybe(t.Object)).is(this.props.options),
        `[${SOURCE}] prop options, if specified, must be an object, a function returning the options or a list of options for unions`
      );
      t.assert(t.Object.is(templates), `[${SOURCE}] missing templates config`);
      t.assert(t.Object.is(i18n), `[${SOURCE}] missing i18n config`);
    }

    const value = this.props.value;
    const type = getTypeFromUnion(this.props.type, value);
    const options = getComponentOptions(
      this.props.options,
      noobj,
      value,
      this.props.type
    );

    // this is in the render method because I need this._reactInternalInstance._rootNodeID in React ^0.14.0
    // and this._reactInternalInstance._nativeContainerInfo._idCounter in React ^15.0.0
    const uidGenerator = this.getUIDGenerator();

    return React.createElement(getFormComponent(type, options), {
      ref: this.setInputRef,
      type,
      options,
      value,
      onChange: this.props.onChange || noop,
      ctx: this.props.ctx || {
        context: this.props.context,
        uidGenerator,
        auto: 'labels',
        templates,
        i18n,
        path: [],
      },
    });
  }
}
