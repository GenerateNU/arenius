import React from 'react';

const LoadingSpinner = ({ size = 60, className = '', color = '#1B3520' }) => {
  return (
    <div 
      className={`relative ${className}`} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        animation: 'spin 3s infinite linear'
      }}
    >
      <div 
        className="absolute w-full h-full" 
        style={{ animation: 'spin1 3s infinite cubic-bezier(0.785, 0.135, 0.150, 0.860)' }}
      >
        <div 
          className="block rounded-tl-none rounded-br-none rounded-tr-2xl rounded-bl-2xl"
          style={{ 
            width: '48%', 
            height: '48%', 
            backgroundColor: color 
          }}
        ></div>
      </div>
      <div 
        className="absolute w-full h-full" 
        style={{ animation: 'spin2 3s infinite cubic-bezier(0.785, 0.135, 0.150, 0.860)' }}
      >
        <div 
          className="block rounded-tl-none rounded-br-none rounded-tr-2xl rounded-bl-2xl"
          style={{ 
            width: '48%', 
            height: '48%', 
            backgroundColor: color 
          }}
        ></div>
      </div>
      <div 
        className="absolute w-full h-full" 
        style={{ animation: 'spin3 3s infinite cubic-bezier(0.785, 0.135, 0.150, 0.860)' }}
      >
        <div 
          className="block rounded-tl-none rounded-br-none rounded-tr-2xl rounded-bl-2xl"
          style={{ 
            width: '48%', 
            height: '48%', 
            backgroundColor: color 
          }}
        ></div>
      </div>
      <div 
        className="absolute w-full h-full" 
        style={{ animation: 'spin4 3s infinite cubic-bezier(0.785, 0.135, 0.150, 0.860)' }}
      >
        <div 
          className="block rounded-tl-none rounded-br-none rounded-tr-2xl rounded-bl-2xl"
          style={{ 
            width: '48%', 
            height: '48%', 
            backgroundColor: color 
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin1 {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(0deg); }
          70% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin2 {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(270deg); }
          70% { transform: rotate(270deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin3 {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(180deg); }
          70% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin4 {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(90deg); }
          70% { transform: rotate(90deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;