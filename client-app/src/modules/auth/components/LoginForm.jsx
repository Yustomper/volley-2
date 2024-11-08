import React, { useState } from "react";

const LoginForm = ({ formData, handleChange, handleSubmit, isDarkMode }) => {
  const [loginError, setLoginError] = useState(false);

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      setLoginError(false);
    } catch (error) {
      setLoginError(true);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleLocalSubmit}>
      <div className="rounded-md shadow-sm">
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario o correo electrónico"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} ${loginError ? 'border-red-500' : ''} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10`}
          value={formData.username}
          onChange={(e) => {
            handleChange(e);
            setLoginError(false);
          }}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} ${loginError ? 'border-red-500' : ''} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 mt-2`}
          value={formData.password}
          onChange={(e) => {
            handleChange(e);
            setLoginError(false);
          }}
          required
        />
      </div>
      
      {loginError && (
        <div className={`text-sm text-red-500 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'} p-2 rounded-md`}>
          Usuario o contraseña incorrectos
        </div>
      )}

      <div>
        <button
          type="submit"
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
        >
          Iniciar Sesión
        </button>
      </div>
    </form>
  );
};

export default LoginForm;