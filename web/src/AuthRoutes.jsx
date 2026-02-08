import { Routes as ReactRoutes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ThemeToggle } from "./components/ThemeToggle";

export function AuthRoutes() {
    return (
        <>
            <ThemeToggle />
            <ReactRoutes>
                <Route path="/login" element={<Login />}/>
                <Route path="/cadastro" element={<Register />}/>
                <Route path="*" element={<Login />}/>
            </ReactRoutes>
        </>
    );
}