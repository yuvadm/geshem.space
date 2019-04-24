import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Geshem';
import * as serviceWorker from './serviceWorker';

console.log()

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
