import React from "react";

const RegisterForm = ({ username, email, password, confirmPassword, setUsername, setEmail, setPassword, setConfirmPassword, handleSubmit, isDarkMode }) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm">
        <input
          type="text"
          placeholder="Nombre de usuario"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 mt-2`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 mt-2`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

      </div>
      <div>
        <button
          type="submit"
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
        >
          Registrarse
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
