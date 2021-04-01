import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Clinicians from "./Clinicians/Clinicians";
import Kiddos from "./Kiddos/Kiddos";
import './App.css';

// <link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css">
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">


export default function App() {
    return (
        <Router>
            <header>
                <h1>FAST v0.1</h1>
                <nav>
                    <ul>
                        <li>
                            <Link to="/clinicians">Clinicians</Link>
                        </li>
                        <span>&nbsp;|&nbsp;</span>
                        <li>
                            <Link to="/kiddos">Kiddos</Link>
                        </li>
                    </ul>
                </nav>
            </header>
            {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
            <Switch>
                <Route path="/kiddos">
                    <Kiddos />
                </Route>
                <Route path="/clinicians">
                    <Clinicians />
                </Route>
            </Switch>
        </Router>
    );
}
