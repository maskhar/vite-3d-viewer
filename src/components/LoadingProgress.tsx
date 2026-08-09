import React from 'react';

interface LoadingProgressProps {
  progress?: number;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ progress = 0 }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: 'white',
      zIndex: 10,
    }}>
      <div style={{
        width: '200px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '10px',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#6366f1',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <p style={{ fontSize: '14px', margin: 0 }}>
        Loading 3D Model... {Math.round(progress)}%
      </p>
    </div>
  );
};

export default LoadingProgress;
