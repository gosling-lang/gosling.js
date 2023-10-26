import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route } from 'react-router-dom';
import Editor from './Editor';
import './index.css';
import 'higlass/dist/hglib.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <BrowserRouter>
        <Route component={Editor} />
    </BrowserRouter>
);
