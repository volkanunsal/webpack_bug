import t from 'lib/tcomb-form';

const re = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
const Email = t.refinement(t.String, x => re.test(x));
Email.getValidationErrorMessage = () => 'Please enter a valid email address';

export default Email;
