import { useLocation } from "react-router-dom";
import React, { useEffect } from "react";
export default function RouteWatcher({ setOpen }) {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/login') {
            setOpen(false);
        } else if (location.pathname === '/dashboard') {
            setOpen(true);
        }
    }, [location, setOpen]);

    return null;
}