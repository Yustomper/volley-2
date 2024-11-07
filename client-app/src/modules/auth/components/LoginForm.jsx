import React from "react";

const LoginForm = ({ formData, handleChange, handleSubmit, isDarkMode }) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm">
        <input
          type="text"
          name="username_or_email"
          placeholder="Nombre de usuario o correo electrónico"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10`}
          value={formData.username_or_email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 mt-2`}
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
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