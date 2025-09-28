// ===================================================================
// 1. MAINPAGE.JSX - PÁGINA PRINCIPAL CON AUTENTICACIÓN
// ===================================================================

import React, { useState } from 'react';

/**
 * Componente principal del sistema Project UWU
 * Maneja la autenticación y selección de tipo de usuario
 * Basado en el boceto proporcionado con visión, misión y objetivos
 */
const MainPage = () => {
  // Estado para manejar el proceso de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * Simula el proceso de inicio de sesión
   * En producción, aquí se conectaría con la API de Django
   */
  const handleLogin = (userType) => {
    setSelectedUserType(userType);
    setShowLoginModal(true);
  };

  /**
   * Procesa la autenticación del usuario
   * @param {Object} credentials - Credenciales del usuario
   */
  const processLogin = (credentials) => {
    // Aquí iría la lógica de autenticación con Django
    console.log('Autenticando:', credentials);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    
    // Redirigir según el tipo de usuario
    if (selectedUserType === 'admin') {
      // Navegación a panel de admin se manejará en App.js
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }));
    } else {
      // Navegación a panel de usuario estándar
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'user' }));
    }
  };

  return (
    <div className="main-page-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header Principal */}
      <header style={{
        background: '#ffffff',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo y título */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '2rem',
                color: '#ffffff'
              }}>👤</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#1e293b',
                margin: '0',
                lineHeight: '1.2'
              }}>PROJECT</h1>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#1e293b',
                margin: '0',
                lineHeight: '1.2'
              }}>UWU</h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#64748b',
                margin: '0.25rem 0 0 0',
                fontWeight: '500'
              }}>AQUÍ VA UN LOGO</p>
            </div>
          </div>

          {/* Botones de inicio de sesión */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#64748b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#475569'}
              onMouseOut={(e) => e.target.style.background = '#64748b'}
            >
              <span>🔓</span> INICIAR SESION
            </button>
            
            <button
              onClick={() => handleLogin('user')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#cbd5e1'}
              onMouseOut={(e) => e.target.style.background = '#e2e8f0'}
            >
              <span>👤</span> COMO USUARIO
            </button>
            
            <button
              onClick={() => handleLogin('admin')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#cbd5e1'}
              onMouseOut={(e) => e.target.style.background = '#e2e8f0'}
            >
              <span>⚙️</span> COMO ADMIN
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {/* Sección de Visión y Misión */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {/* Visión */}
          <div style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>👁️</span> Visión
            </h2>
            <p style={{
              color: '#475569',
              lineHeight: '1.6',
              margin: '0'
            }}>
              Convertirse en la plataforma líder en educación y difusión del 
              lenguaje de señas en Latinoamérica, reconocida por su impacto en 
              la eliminación de barreras comunicativas y la construcción de una 
              sociedad más empática, inclusiva y equitativa.
            </p>
          </div>

          {/* Misión */}
          <div style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>🎯</span> Misión
            </h2>
            <p style={{
              color: '#475569',
              lineHeight: '1.6',
              margin: '0'
            }}>
              Brindar un espacio digital inclusivo y accesible que facilite la 
              comunicación entre personas sordas y oyentes, promoviendo el 
              aprendizaje y uso del lenguaje de señas como herramienta 
              fundamental para la integración social, educativa y laboral.
            </p>
          </div>
        </div>

        {/* Objetivos */}
        <div style={{
          background: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🎯</span> Objetivos
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                flexShrink: 0,
                marginTop: '0.125rem'
              }}>1</span>
              <div>
                <strong style={{ color: '#1e293b' }}>Educativos:</strong>
                <span style={{ color: '#475569' }}> Ofrecer cursos, tutoriales y recursos interactivos 
                para aprender y practicar el lenguaje de señas de manera fácil y 
                accesible.</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                flexShrink: 0,
                marginTop: '0.125rem'
              }}>2</span>
              <div>
                <strong style={{ color: '#1e293b' }}>Sociales:</strong>
                <span style={{ color: '#475569' }}> Fomentar la inclusión y la comunicación efectiva entre 
                personas sordas y oyentes en diferentes entornos.</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                flexShrink: 0,
                marginTop: '0.125rem'
              }}>3</span>
              <div>
                <strong style={{ color: '#1e293b' }}>Tecnológicos:</strong>
                <span style={{ color: '#475569' }}> Implementar herramientas digitales innovadoras 
                (vídeos, intérpretes virtuales, chats inclusivos) que faciliten el 
                aprendizaje y la comunicación.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de inicio de sesión */}
      {showLoginModal && (
        <LoginModal 
          userType={selectedUserType}
          onClose={() => setShowLoginModal(false)}
          onLogin={processLogin}
        />
      )}
    </div>
  );
};

/**
 * Modal de inicio de sesión
 * Componente reutilizable para autenticación de usuarios
 */
const LoginModal = ({ userType, onClose, onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username.trim() && credentials.password.trim()) {
      onLogin({ ...credentials, userType });
    }
  };

  const handleChange = (field) => (e) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            Iniciar Sesión {userType === 'admin' ? 'como Admin' : 'como Usuario'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={handleChange('username')}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={handleChange('password')}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: userType === 'admin' ? '#ef4444' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainPage;