// ===================================================================
// APP.JS - SISTEMA PRINCIPAL ESCALABLE Y MODULAR
// ===================================================================

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import MainPage from './MainPage';
import AdminPageVowels from './AdminPageVowels';
import AdminPageNumbers from './AdminPageNumbers';

// ===================================================================
// CONTEXTO GLOBAL DE LA APLICACIÓN
// ===================================================================

/**
 * Contexto para manejar el estado global de la aplicación
 * Proporciona autenticación, navegación y configuración
 */
const AppContext = createContext();

/**
 * Hook personalizado para usar el contexto de la aplicación
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
};

// ===================================================================
// CONSTANTES Y CONFIGURACIÓN DEL SISTEMA
// ===================================================================

/**
 * Rutas disponibles en el sistema
 * Estructura escalable para agregar nuevas páginas
 */
const ROUTES = {
  MAIN: 'main',
  ADMIN: {
    BASE: 'admin',
    VOWELS: 'admin/vowels',
    NUMBERS: 'admin/numbers',
    DASHBOARD: 'admin/dashboard',  // Para futuras funcionalidades
    USERS: 'admin/users',          // Gestión de usuarios
    SETTINGS: 'admin/settings'     // Configuraciones
  },
  USER: {
    BASE: 'user',
    DASHBOARD: 'user/dashboard',   // Panel del usuario
    PROFILE: 'user/profile',       // Perfil del usuario
    LESSONS: 'user/lessons',       // Lecciones disponibles
    PROGRESS: 'user/progress'      // Progreso del aprendizaje
  },
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    FORGOT_PASSWORD: 'auth/forgot'
  }
};

/**
 * Tipos de usuario en el sistema
 */
const USER_TYPES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

/**
 * Estados de autenticación
 */
const AUTH_STATES = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  LOADING: 'loading',
  ERROR: 'error'
};

// ===================================================================
// PROVEEDOR DEL CONTEXTO GLOBAL
// ===================================================================

/**
 * Proveedor del contexto de la aplicación
 * Maneja el estado global, autenticación y navegación
 */
const AppProvider = ({ children }) => {
  // Estados principales de la aplicación
  const [currentRoute, setCurrentRoute] = useState(ROUTES.MAIN);
  const [authState, setAuthState] = useState(AUTH_STATES.UNAUTHENTICATED);
  const [currentUser, setCurrentUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  // Estados específicos para administración
  const [adminPage, setAdminPage] = useState('vowels');
  const [userPage, setUserPage] = useState('dashboard');

  /**
   * Simula la verificación de autenticación al cargar la app
   * En producción, verificaría token en localStorage/sessionStorage
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setAppLoading(true);
        
        // Simular verificación de token (reemplazar con lógica real)
        const savedAuth = localStorage.getItem('uwu_auth');
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          setCurrentUser(authData.user);
          setAuthState(AUTH_STATES.AUTHENTICATED);
          
          // Redirigir según el tipo de usuario
          if (authData.user.type === USER_TYPES.ADMIN) {
            setCurrentRoute(ROUTES.ADMIN.VOWELS);
          } else {
            setCurrentRoute(ROUTES.USER.DASHBOARD);
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setAppError('Error al verificar la sesión');
        localStorage.removeItem('uwu_auth'); // Limpiar datos corruptos
      } finally {
        setAppLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Función para autenticar usuario
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} userType - Tipo de usuario (admin/user)
   */
  const login = useCallback(async (credentials, userType) => {
    try {
      setAuthState(AUTH_STATES.LOADING);
      setAppError(null);

      // Simular llamada a API de Django (reemplazar con lógica real)
      const response = await simulateApiLogin(credentials, userType);
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          username: credentials.username,
          type: userType,
          token: response.token,
          loginTime: new Date().toISOString()
        };

        setCurrentUser(userData);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('uwu_auth', JSON.stringify({ user: userData }));

        // Navegación según tipo de usuario
        if (userType === USER_TYPES.ADMIN) {
          navigateTo(ROUTES.ADMIN.VOWELS);
        } else {
          navigateTo(ROUTES.USER.DASHBOARD);
        }

        return { success: true };
      } else {
        throw new Error(response.message || 'Error de autenticación');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setAuthState(AUTH_STATES.ERROR);
      setAppError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Función para cerrar sesión
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
    setCurrentRoute(ROUTES.MAIN);
    localStorage.removeItem('uwu_auth');
    
    // Limpiar estados específicos
    setAdminPage('vowels');
    setUserPage('dashboard');
    setAppError(null);
  }, []);

  /**
   * Función de navegación centralizada
   * @param {string} route - Ruta a navegar
   */
  const navigateTo = useCallback((route) => {
    setCurrentRoute(route);
    setAppError(null);

    // Lógica específica para diferentes rutas
    if (route.startsWith('admin/')) {
      const adminSection = route.split('/')[1];
      setAdminPage(adminSection);
    } else if (route.startsWith('user/')) {
      const userSection = route.split('/')[1];
      setUserPage(userSection);
    }
  }, []);

  /**
   * Verificar si el usuario tiene permisos para una ruta
   * @param {string} route - Ruta a verificar
   */
  const hasPermission = useCallback((route) => {
    if (!currentUser) return false;

    // Rutas de admin solo para administradores
    if (route.startsWith('admin/') && currentUser.type !== USER_TYPES.ADMIN) {
      return false;
    }

    // Rutas de usuario para usuarios autenticados
    if (route.startsWith('user/') && currentUser.type === USER_TYPES.GUEST) {
      return false;
    }

    return true;
  }, [currentUser]);

  // Valor del contexto que se proporciona a toda la aplicación
  const contextValue = {
    // Estados
    currentRoute,
    authState,
    currentUser,
    appLoading,
    appError,
    adminPage,
    userPage,

    // Acciones
    login,
    logout,
    navigateTo,
    hasPermission,
    
    // Setters para componentes específicos
    setAdminPage,
    setUserPage,
    setAppError,

    // Constantes
    ROUTES,
    USER_TYPES,
    AUTH_STATES
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ===================================================================
// FUNCIONES AUXILIARES
// ===================================================================

/**
 * Simula la autenticación con API de Django
 * En producción, reemplazar con llamada real a /api/auth/login/
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} userType - Tipo de usuario
 */
const simulateApiLogin = async (credentials, userType) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simular validación básica
  if (credentials.username && credentials.password) {
    return {
      success: true,
      user: {
        id: Math.floor(Math.random() * 1000),
        username: credentials.username,
        type: userType
      },
      token: `fake_jwt_token_${Date.now()}`,
      message: 'Login exitoso'
    };
  } else {
    return {
      success: false,
      message: 'Credenciales inválidas'
    };
  }
};

// ===================================================================
// COMPONENTES DE NAVEGACIÓN
// ===================================================================

/**
 * Barra de navegación para administradores
 * Componente escalable que puede expandirse con nuevas funcionalidades
 */
const AdminNavigation = () => {
  const { currentRoute, adminPage, navigateTo, logout } = useAppContext();

  const adminRoutes = [
    { key: 'vowels', label: 'Vocales', route: ROUTES.ADMIN.VOWELS },
    { key: 'numbers', label: 'Números', route: ROUTES.ADMIN.NUMBERS },
    // Preparado para futuras funcionalidades
    // { key: 'dashboard', label: 'Dashboard', route: ROUTES.ADMIN.DASHBOARD },
    // { key: 'users', label: 'Usuarios', route: ROUTES.ADMIN.USERS },
    // { key: 'settings', label: 'Configuración', route: ROUTES.ADMIN.SETTINGS }
  ];

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      zIndex: 1000, 
      background: '#1e293b', 
      padding: '10px',
      borderRadius: '0 0 0 8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    }}>
      {/* Botón de inicio */}
      <button 
        onClick={() => navigateTo(ROUTES.MAIN)}
        style={{ 
          margin: '5px', 
          padding: '8px 16px', 
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}
        title="Volver al inicio"
      >
        🏠 Inicio
      </button>

      {/* Botones de navegación de admin */}
      {adminRoutes.map(({ key, label, route }) => (
        <button 
          key={key}
          onClick={() => navigateTo(route)}
          style={{ 
            margin: '5px', 
            padding: '8px 16px', 
            background: currentRoute === route ? '#3b82f6' : '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s ease'
          }}
          title={`Ir a ${label}`}
        >
          {label}
        </button>
      ))}

      {/* Botón de cerrar sesión */}
      <button 
        onClick={logout}
        style={{ 
          margin: '5px', 
          padding: '8px 16px', 
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}
        title="Cerrar sesión"
      >
        🚪 Salir
      </button>
    </nav>
  );
};

/**
 * Barra de navegación para usuarios estándar
 * Preparada para funcionalidades futuras del panel de usuario
 */
const UserNavigation = () => {
  const { navigateTo, logout } = useAppContext();

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      zIndex: 1000, 
      background: '#059669', 
      padding: '10px',
      borderRadius: '0 0 0 8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    }}>
      {/* Botón de inicio */}
      <button 
        onClick={() => navigateTo(ROUTES.MAIN)}
        style={{ 
          margin: '5px', 
          padding: '8px 16px', 
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}
      >
        🏠 Inicio
      </button>

      {/* Botón de cerrar sesión */}
      <button 
        onClick={logout}
        style={{ 
          margin: '5px', 
          padding: '8px 16px', 
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}
      >
        🚪 Salir
      </button>
    </nav>
  );
};

// ===================================================================
// COMPONENTES DE PÁGINA
// ===================================================================

/**
 * Panel de usuario estándar
 * Componente base que puede expandirse con funcionalidades de aprendizaje
 */
const UserDashboard = () => {
  const { currentUser, navigateTo } = useAppContext();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '2rem',
      paddingTop: '4rem' // Espacio para la navegación
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#166534',
            marginBottom: '0.5rem'
          }}>
            Bienvenido, {currentUser?.username}
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#065f46'
          }}>
            Panel de Usuario - Project UWU
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Tarjetas de funcionalidad futura */}
          <div style={{
            background: '#f0fdf4',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Lecciones</h3>
            <p style={{ color: '#065f46', fontSize: '0.875rem' }}>
              Aprende lenguaje de señas con nuestras lecciones interactivas
            </p>
            <button style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Próximamente
            </button>
          </div>

          <div style={{
            background: '#f0fdf4',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Mi Progreso</h3>
            <p style={{ color: '#065f46', fontSize: '0.875rem' }}>
              Seguimiento de tu aprendizaje y logros alcanzados
            </p>
            <button style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Próximamente
            </button>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            El panel de usuario está en desarrollo. Pronto tendrás acceso a 
            lecciones interactivas, seguimiento de progreso y mucho más.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de error para rutas no encontradas
 */
const NotFoundPage = () => {
  const { navigateTo } = useAppContext();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '1rem' }}>
          Página no encontrada
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          La página que buscas no existe o no tienes permisos para acceder a ella.
        </p>
        <button 
          onClick={() => navigateTo(ROUTES.MAIN)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ===================================================================

/**
 * Componente principal que maneja toda la lógica de navegación y renderizado
 * Arquitectura escalable para agregar nuevas funcionalidades
 */
const AppContent = () => {
  const { 
    currentRoute, 
    authState, 
    appLoading, 
    appError, 
    hasPermission,
    navigateTo 
  } = useAppContext();

  // Mostrar spinner de carga inicial
  if (appLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b' }}>Cargando Project UWU...</p>
        </div>
      </div>
    );
  }

  // Mostrar errores globales de la aplicación
  if (appError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
            Error de la Aplicación
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            {appError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Recargar Aplicación
          </button>
        </div>
      </div>
    );
  }

  // Verificar permisos para la ruta actual
  if (currentRoute !== ROUTES.MAIN && !hasPermission(currentRoute)) {
    return <NotFoundPage />;
  }

  // Router principal de la aplicación
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case ROUTES.MAIN:
        return <MainPage />;

      // Rutas de administración
      case ROUTES.ADMIN.VOWELS:
        return (
          <>
            <AdminNavigation />
            <AdminPageVowels />
          </>
        );

      case ROUTES.ADMIN.NUMBERS:
        return (
          <>
            <AdminNavigation />
            <AdminPageNumbers />
          </>
        );

      // Rutas de usuario
      case ROUTES.USER.DASHBOARD:
        return (
          <>
            <UserNavigation />
            <UserDashboard />
          </>
        );

      // Ruta no encontrada
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="App">
      {/* Estilos para animaciones */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {renderCurrentPage()}
    </div>
  );
};

// ===================================================================
// COMPONENTE RAÍZ EXPORTADO
// ===================================================================

/**
 * Componente App principal que envuelve toda la aplicación
 * con el proveedor de contexto global
 */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;