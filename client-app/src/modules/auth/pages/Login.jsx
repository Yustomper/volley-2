import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { useTheme } from '../../../context/ThemeContext';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const { formData, setFormData, handleChange, handleSubmit } = useLogin();
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full space-y-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-10 rounded-xl shadow-md`}>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
          Iniciar Sesión
        </h2>
        <LoginForm
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default Login;