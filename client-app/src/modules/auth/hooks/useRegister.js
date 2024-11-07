import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../auth/services/api';


export default function useRegister() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
       
        const userData = {
          username,
          email,
          password
        };
    
        try {
          // Usa el servicio API para registrar al usuario
          await api.register(userData);
    
          toast.success('Cuenta creada con éxito');
    
          // Esperar 4 segundos antes de redirigir  
          setTimeout(() => {                                        
            navigate('/login');
          }, 4000);
        } catch (error) {
          console.log(error);
          if (error.response) {
            toast.error(error.response.data.detail);
          } else {
            toast.error('Error al procesar la solicitud');
          }
        }
      }; 

      return {
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        handleSubmit
      }






}