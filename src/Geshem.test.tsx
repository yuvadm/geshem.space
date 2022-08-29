import React from 'react';
import ReactDOM from 'react-dom';
import Geshem from './Geshem';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Geshem />, div);
  ReactDOM.unmountComponentAtNode(div);
});
