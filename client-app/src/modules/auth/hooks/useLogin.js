// client-app/src/modules/auth/hooks/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export function useLogin() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
            toast.success('Inicio de sesión exitoso');
            navigate('/');
        } catch (error) {
            toast.error(error);
        }
    };

    return {
        formData,
        handleChange,
        handleSubmit,
    };
}
