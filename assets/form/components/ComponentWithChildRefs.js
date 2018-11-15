import Component from './Component';

export default class ComponentWithChildRefs extends Component {
  childRefs = {};

  setChildRefFor = prop => ref => {
    if (ref) {
      this.childRefs[prop] = ref;
    } else {
      delete this.childRefs[prop];
    }
  };
}
