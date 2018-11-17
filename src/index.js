import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Geshem from './Geshem';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Geshem />, document.getElementById('root'));

serviceWorker.unregister();
