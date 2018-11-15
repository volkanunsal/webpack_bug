import t from 'lib/tcomb-form';

export const Password = t.refinement(t.String, x => x.length >= 8, 'Password');
export const PasswordConfirmation = t.refinement(
  Password,
  () => true,
  'PasswordConfirmation'
);

Password.getValidationErrorMessage = () =>
  'Password must have at least 8 characters';
PasswordConfirmation.getValidationErrorMessage = () =>
  'Password confirmation must match password.';

export default Password;
