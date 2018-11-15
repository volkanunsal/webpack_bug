/*@flow*/
import t from 'tcomb-validation';
import components from './components';
import templates from './templates';
import i18n from './i18n/en';

t.form = components;
t.form.Form.i18n = i18n;
t.form.Form.templates = templates;

export default t;
