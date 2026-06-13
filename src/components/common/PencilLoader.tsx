import React from 'react';

const PencilLoader = () => {
  return (
    <div className="modern-loader">
      <div className="spinner-ring"></div>
      <div className="spinner-ring-inner"></div>
      <style jsx>{`
        .modern-loader {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 60px;
          height: 60px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: #2563eb; /* Blue 600 */
          border-right-color: #7c3aed; /* Violet 600 */
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.3);
        }

        .spinner-ring-inner {
          position: absolute;
          width: 65%;
          height: 65%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-bottom-color: #e11d48; /* Rose 600 */
          border-left-color: #be123c; /* Rose 700 */
          animation: spin-reverse 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default PencilLoader;

