// import React from 'react';

const PrivateRoute = ({ children }) => {
  // Аутентификация отключена, всегда пропускаем
  return children;
};

export default PrivateRoute; 