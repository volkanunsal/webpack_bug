import t from 'tcomb-validation';
import { merge } from '../util';

export default {
  template(name) {
    return Component => {
      // NOTE: This uses babel-plugin-proposal-decorators "legacy" syntax.
      // At some point in the future, we must adapt it to the future syntax.
      Component.prototype.getTemplate = function getTemplate() {
        return this.props.options.template || this.props.ctx.templates[name];
      };
    };
  },

  attrs(Component) {
    Component.prototype.getAttrs = function getAttrs() {
      const attrs = t.mixin({}, this.props.options.attrs);
      attrs.id = this.getId();
      attrs.name = this.getName();
      return attrs;
    };
  },

  templates(Component) {
    Component.prototype.getTemplates = function getTemplates() {
      return merge(this.props.ctx.templates, this.props.options.templates);
    };
  },
};
