// src/utils/dateFormatter.js

export const formatDateTime = (isoString) => {
    const dateObj = new Date(isoString);
  
    // Opciones para formatear la fecha (DD/MM/YYYY)
    const dateOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
  
    // Opciones para formatear la hora (HH:MM AM/PM)
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
  
    const formattedDate = dateObj.toLocaleDateString('es-ES', dateOptions);
    const formattedTime = dateObj.toLocaleTimeString('es-ES', timeOptions);
  
    return {
      date: formattedDate,
      time: formattedTime,
    };
  };
  