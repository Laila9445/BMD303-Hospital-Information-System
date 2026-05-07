import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import SuccessPage from './pages/SuccessPage';
import ContactPage from './pages/Contactpage';
import { HelpButton } from "./components/HelpButton";
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
                {/* Global Help Button */}
                <HelpButton />
            </Router>
        </AuthProvider>
    );
}

export default App;
