// src/modules/auth/components/RegisterForm.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const RegisterForm = ({
  username,
  email,
  password,
  setUsername,
  setEmail,
  setPassword,
  handleSubmit,
  isDarkMode
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validatePassword = (pass) => {
    const validations = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*]/.test(pass)
    };
    return validations;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de username
    if (!username) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validación de contraseña
    const passwordValidations = validatePassword(password);
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!Object.values(passwordValidations).every(Boolean)) {
      newErrors.password = 'La contraseña no cumple con los requisitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [username, email, password]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true
    });
    
    if (validateForm()) {
      handleSubmit(e);
    }
  };

  const ValidationIndicator = ({ condition, text }) => (
    <div className="flex items-center space-x-2 text-sm">
      {condition ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={`${condition ? 'text-green-500' : 'text-red-500'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <form onSubmit={handleLocalSubmit} className="mt-8 space-y-6">
      {/* Username Field */}
      <div className="space-y-1">
        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Nombre de Usuario
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur('username')}
            className={`w-full px-4 py-2 transition-colors duration-200 ease-in-out rounded-lg 
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500' 
                : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-orange-500'}
              ${errors.username && touched.username ? 'border-red-500' : 'border-gray-300'}
              focus:outline-none focus:ring-2`}
            placeholder="Ingresa tu nombre de usuario"
          />
        </div>
        {touched.username && errors.username && (
          <p className="text-sm text-red-500">{errors.username}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1">
        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Email
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-4 py-2 transition-colors duration-200 ease-in-out rounded-lg 
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500' 
                : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-orange-500'}
              ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'}
              focus:outline-none focus:ring-2`}
            placeholder="correo@ejemplo.com"
          />
        </div>
        {touched.email && errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full px-4 py-2 pr-10 transition-colors duration-200 ease-in-out rounded-lg 
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500' 
                : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-orange-500'}
              ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'}
              focus:outline-none focus:ring-2`}
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none`}
          >
            {showPassword ? 
              <EyeOff className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} /> : 
              <Eye className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            }
          </button>
        </div>
        {touched.password && (
          <div className="mt-2 space-y-1">
            {Object.entries(validatePassword(password)).map(([key, valid]) => (
              <ValidationIndicator
                key={key}
                condition={valid}
                text={{
                  length: 'Mínimo 8 caracteres',
                  uppercase: 'Una mayúscula',
                  lowercase: 'Una minúscula',
                  number: 'Un número',
                  special: 'Un carácter especial (!@#$%^&*)'
                }[key]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full py-2 px-4 text-white transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isDarkMode 
            ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
            : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'}`}
      >
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;