import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import api from "../services/api";

export function useLogin() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await api.login(formData);
            const { token } = response.data;
            
            await login(token);
            toast.success('Inicio de sesión exitoso');
            
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.error || 'Error en el inicio de sesión');
            } else if (error.request) {
                toast.error('No se pudo conectar con el servidor');
            } else {
                toast.error('Error al procesar la solicitud');
            }
        }
    };

    return {
        formData,
        setFormData,
        handleChange,
        handleSubmit,
        isDarkMode
    }
}