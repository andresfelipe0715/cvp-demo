import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import Footer from './Components/layout/Footer/Footer.jsx';
import RouteWatcher from './utils/hooks/RouteWatcher.jsx';

require('../assets/styles/general/main.css');

export function App() {
    const [open, setOpen] = useState(false);

    return (<>
       
            <Router>
            <RouteWatcher setOpen={setOpen} />  {/* this is to see the route changes */}

            <Routes>
                <Route path="/dashboard/*" element={<Dashboard open={open} setOpen={setOpen} />} />
                <Route path="/login" element={<Login />} />
            </Routes>

            <Footer open={open} />
        </Router>
        
    </>

    );
}

const container = document.getElementById('content');
const root = createRoot(container);
root.render(<App />);