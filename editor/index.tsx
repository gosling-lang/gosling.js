import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import Editor from './editor';
import './index.css';

ReactDOM.render(
    <BrowserRouter>
        <Route component={Editor} />
    </BrowserRouter>,
    document.getElementById('root')
);
