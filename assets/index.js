import React from 'react';
import ReactDOM from 'react-dom';
import t from './form';

const App = () => {
  return (
    <div>
      <t.form.Form
        type={t.struct({
          person: t.struct({
            name: t.String,
          }),
        })}
        options={{ fields: { person: { label: ' ' } } }}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
