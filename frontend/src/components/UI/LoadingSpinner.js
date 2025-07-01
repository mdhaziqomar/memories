import React from 'react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClass = size === 'small' ? 'spinner-sm' : size === 'large' ? 'spinner-lg' : '';
  
  return (
    <div className="loading">
      <div className="d-flex flex-column align-items-center gap-3">
        <div className={`spinner ${sizeClass}`}></div>
        {message && <p className="text-muted mb-0">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner; 