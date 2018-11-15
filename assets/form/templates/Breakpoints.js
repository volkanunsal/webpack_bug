import t from 'tcomb';

const Positive = t.refinement(t.Number, n => n % 1 === 0 && n >= 0, 'Positive');

const Cols = t.tuple([Positive, Positive], 'Cols');

const Breakpoints = t.struct(
  {
    xs: t.maybe(Cols),
    sm: t.maybe(Cols),
    md: t.maybe(Cols),
    lg: t.maybe(Cols),
  },
  'Breakpoints'
);
const hasOwn = Object.prototype.hasOwnProperty;

function getBreakpointsClassName(breakpoints) {
  const className = {};
  Object.keys(breakpoints).forEach(size => {
    if (hasOwn.call(breakpoints, size)) {
      className['col-' + size + '-' + breakpoints[size]] = true;
    }
  });
  return className;
}

function getOffsetsClassName(breakpoints) {
  const className = {};
  Object.keys(breakpoints).forEach(size => {
    if (hasOwn.call(breakpoints, size)) {
      className['col-' + size + '-offset-' + (12 - breakpoints[size])] = true;
    }
  });
  return className;
}

Breakpoints.prototype.getBreakpoints = function getBreakpoints(colIndex) {
  const breakpoints = {};
  this.forEach(size => {
    if (hasOwn.call(this, size) && !t.Nil.is(this[size])) {
      breakpoints[size] = this[size][colIndex];
    }
  });
  return breakpoints;
};

Breakpoints.prototype.getLabelClassName = function getLabelClassName() {
  return getBreakpointsClassName(this.getBreakpoints(0));
};

Breakpoints.prototype.getInputClassName = function getInputClassName() {
  return getBreakpointsClassName(this.getBreakpoints(1));
};

Breakpoints.prototype.getOffsetClassName = function getOffsetClassName() {
  return t.mixin(
    getOffsetsClassName(this.getBreakpoints(1)),
    getBreakpointsClassName(this.getBreakpoints(1))
  );
};

export default Breakpoints;
