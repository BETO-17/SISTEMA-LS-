import React, { useState, useEffect, useCallback } from 'react';

// ===================================================================
// CONSTANTES Y CONFIGURACIÓN
// ===================================================================

/**
 * Configuración principal de la API
 * Contiene las URLs base y endpoints específicos para comunicarse con Django
 */
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api', // URL base del backend Django
  ENDPOINTS: {
    VOWELS_LIST: '/lista/vocales/',       // GET: Obtener lista de vocales
    SAVE_VOWEL: '/guardar/letras/'        // POST: Guardar registro de vocal
  },
  TIMEOUT: 10000 // Timeout de 10 segundos para peticiones HTTP
};

/**
 * Datos de respaldo para las vocales
 * Se usan cuando la API no está disponible o no devuelve datos
 */
const FALLBACK_VOWELS = [
  { id: 1, title: 'LETRA A', content: 'Primera vocal del alfabeto español. Vocal abierta central.' },
  { id: 2, title: 'LETRA E', content: 'Segunda vocal del alfabeto. Vocal media anterior.' },
  { id: 3, title: 'LETRA I', content: 'Tercera vocal del alfabeto. Vocal cerrada anterior.' },
  { id: 4, title: 'LETRA O', content: 'Cuarta vocal del alfabeto. Vocal media posterior.' },
  { id: 5, title: 'LETRA U', content: 'Quinta vocal del alfabeto. Vocal cerrada posterior.' }
];

/**
 * Estados posibles del botón de guardar
 * Define los diferentes textos y estados visuales del botón
 */
const BUTTON_STATES = {
  IDLE: 'Guardar',        // Estado inicial, listo para hacer clic
  LOADING: 'Guardando...', // Mientras se procesa la petición
  SUCCESS: '¡Guardado! ✅', // Cuando se guarda exitosamente
  ERROR: 'Error ❌'        // Cuando ocurre un error
};

// ===================================================================
// SERVICIOS DE API
// ===================================================================

/**
 * Clase que maneja todas las operaciones relacionadas con la API
 * Centraliza las peticiones HTTP para mantener el código organizado
 */
class VowelService {
  /**
   * Obtiene la lista de vocales desde el backend Django
   * @returns {Promise<Array>} Array de objetos vocal o datos de respaldo
   */
  static async fetchVowels() {
    try {
      // Realizar petición GET al endpoint de lista de vocales
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOWELS_LIST}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT) // Cancelar si tarda más del timeout
      });

      // Verificar si la respuesta es exitosa (código 200-299)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Convertir la respuesta a JSON
      const data = await response.json();
      
      // Retornar datos válidos o fallback si está vacío
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_VOWELS;
    } catch (error) {
      // En caso de error, usar datos de respaldo y registrar el error
      console.warn('Error fetching vowels, using fallback data:', error);
      return FALLBACK_VOWELS;
    }
  }

  /**
   * Guarda un registro de vocal en el backend
   * @param {Object} vowelData - Datos de la vocal a guardar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  static async saveVowelRecord(vowelData) {
    try {
      // Preparar los datos en el formato esperado por Django
      const payload = {
        id_vocal: vowelData.id,           // ID de la vocal
        nombre_vocal: vowelData.title,    // Nombre/título de la vocal
        timestamp: new Date().toISOString() // Timestamp actual en formato ISO
      };

      // Realizar petición POST al endpoint de guardado
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_VOWEL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),      // Convertir payload a JSON
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Registrar el error y propagarlo para que sea manejado por el componente
      console.error('Error saving vowel record:', error);
      throw error;
    }
  }
}

// ===================================================================
// HOOKS PERSONALIZADOS
// ===================================================================

/**
 * Hook personalizado para manejar el estado de las vocales
 * Encapsula toda la lógica relacionada con obtener y mantener la lista de vocales
 * @returns {Object} Estado de vocales, loading, error y función de recarga
 */
const useVowels = () => {
  // Estados locales para manejar los datos de vocales
  const [vowels, setVowels] = useState([]);     // Lista de vocales
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [error, setError] = useState(null);      // Estado de error

  /**
   * Función para obtener las vocales del servidor
   * useCallback evita recrear la función en cada render
   */
  const fetchVowels = useCallback(async () => {
    try {
      setLoading(true);  // Activar estado de carga
      setError(null);    // Limpiar errores previos
      
      // Obtener datos del servicio
      const vowelsData = await VowelService.fetchVowels();
      setVowels(vowelsData);
    } catch (err) {
      // Manejar errores y establecer datos de respaldo
      setError('No se pudo cargar la lista de vocales. Usando datos de respaldo.');
      setVowels(FALLBACK_VOWELS);
    } finally {
      setLoading(false); // Desactivar estado de carga siempre
    }
  }, []); // Sin dependencias, la función no cambia

  // Efecto para cargar las vocales al montar el componente
  useEffect(() => {
    fetchVowels();
  }, [fetchVowels]);

  // Retornar el estado y la función de recarga
  return { vowels, loading, error, refetch: fetchVowels };
};

/**
 * Hook personalizado para manejar el guardado de vocales
 * Gestiona el estado del botón y la lógica de guardado
 * @returns {Object} Estado del botón, función de guardado e indicador de carga
 */
const useVowelSave = () => {
  // Estado del botón (idle, loading, success, error)
  const [buttonState, setButtonState] = useState(BUTTON_STATES.IDLE);

  /**
   * Función para guardar una vocal
   * @param {Object} vowelData - Datos de la vocal a guardar
   */
  const saveVowel = useCallback(async (vowelData) => {
    setButtonState(BUTTON_STATES.LOADING); // Cambiar a estado de carga

    try {
      // Intentar guardar en el servidor
      await VowelService.saveVowelRecord(vowelData);
      setButtonState(BUTTON_STATES.SUCCESS); // Mostrar éxito
      
      // Resetear a estado inicial después de 2 segundos
      setTimeout(() => {
        setButtonState(BUTTON_STATES.IDLE);
      }, 2000);
    } catch (error) {
      setButtonState(BUTTON_STATES.ERROR); // Mostrar error
      
      // Resetear a estado inicial después de 3 segundos (más tiempo para que se vea el error)
      setTimeout(() => {
        setButtonState(BUTTON_STATES.IDLE);
      }, 3000);
    }
  }, []); // Sin dependencias

  return { 
    buttonState, 
    saveVowel, 
    isLoading: buttonState === BUTTON_STATES.LOADING 
  };
};

// ===================================================================
// COMPONENTES UI
// ===================================================================

/**
 * Componente de spinner de carga
 * Se muestra mientras se están cargando las vocales desde el servidor
 */
const LoadingSpinner = () => (
  <div className="loading-container" role="status" aria-label="Cargando">
    <div className="loading-spinner"></div>
    <p className="loading-text">Cargando lista de vocales...</p>
  </div>
);

/**
 * Componente para mostrar mensajes de error
 * @param {string} message - Mensaje de error a mostrar
 */
const ErrorMessage = ({ message }) => (
  <div className="error-message" role="alert">
    <span className="error-icon">⚠️</span>
    <span>{message}</span>
  </div>
);

/**
 * Componente del sidebar izquierdo con información de admin y área de cámara
 * Contiene el header de bienvenida y la sección de cámara (funcionalidad futura)
 */
const AdminSidebar = () => (
  <aside className="sidebar">
    {/* Header con información del usuario admin */}
    <header className="admin-header">
      <h1 className="role-title">ERES UN ADMIN</h1>
      <p className="welcome-message">
        ACABAS DE INGRESAR AL PROJECT UWU COMO ADMIN
      </p>
    </header>
    
    {/* Sección de cámara (placeholder para funcionalidad futura) */}
    <section className="camera-section">
      <div className="camera-placeholder" aria-label="Área de cámara">
        <span className="camera-icon">📹</span>
        <p>AQUÍ VA LA CÁMARA</p>
      </div>
      <button 
        type="button"
        className="start-camera-button"
        onClick={() => console.log('Iniciar cámara - Funcionalidad pendiente')}
        aria-label="Iniciar cámara"
      >
        INICIAR CÁMARA
      </button>
    </section>
  </aside>
);

/**
 * Componente individual para cada tarjeta de vocal
 * Memoizado para optimizar el rendimiento - solo se re-renderiza si sus props cambian
 * @param {Object} vowel - Objeto con datos de la vocal (id, title, content)
 */
const VowelCard = React.memo(({ vowel }) => {
  // Hook personalizado para manejar el guardado de esta vocal específica
  const { buttonState, saveVowel, isLoading } = useVowelSave();

  /**
   * Manejador del clic en el botón de guardar
   * useCallback evita que se recree la función en cada render
   */
  const handleSaveClick = useCallback(() => {
    saveVowel(vowel); // Llamar a la función de guardado con los datos de la vocal
  }, [saveVowel, vowel]);

  return (
    <article className="vowel-card">
      {/* Área de imagen con la letra de la vocal */}
      <div className="vowel-image" aria-hidden="true">
        <span className="vowel-letter">
          {/* Extraer la letra del título (ej: "LETRA A" -> "A") */}
          {vowel.title.split(' ')[1] || '?'}
        </span>
      </div>
      
      {/* Contenido principal de la tarjeta */}
      <div className="vowel-content">
        <h2 className="vowel-title">{vowel.title}</h2>
        <p className="vowel-description">{vowel.content}</p>
        
        {/* Botón de guardar con estados dinámicos */}
        <button
          type="button"
          className={`save-button ${buttonState.toLowerCase().replace(/[^a-z]/g, '-')}`}
          onClick={handleSaveClick}
          disabled={isLoading}
          aria-label={`Guardar información de ${vowel.title}`}
        >
          {buttonState}
        </button>
      </div>
    </article>
  );
});

// Asignar nombre al componente para debugging
VowelCard.displayName = 'VowelCard';

/**
 * Componente contenedor para la lista de vocales
 * Maneja el caso cuando no hay vocales disponibles
 * @param {Array} vowels - Array de objetos vocal
 */
const VowelsList = ({ vowels }) => {
  // Mostrar estado vacío si no hay vocales
  if (!vowels.length) {
    return (
      <div className="empty-state">
        <p>No hay vocales disponibles</p>
      </div>
    );
  }

  // Renderizar grid de vocales
  return (
    <div className="vowels-grid">
      {vowels.map((vowel) => (
        <VowelCard 
          key={vowel.id}  // Key único para React
          vowel={vowel}   // Pasar datos completos de la vocal
        />
      ))}
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

/**
 * Componente principal de la aplicación
 * Punto de entrada que coordina todos los demás componentes
 * Maneja el estado global de carga y renderiza condicionalmente
 */
const AdminPageVowels = () => {
  // Usar el hook personalizado para obtener datos de vocales
  const { vowels, loading, error } = useVowels();

  // Mostrar spinner mientras se cargan los datos
  if (loading) {
    return <LoadingSpinner />;
  }

  // Renderizar la interfaz principal cuando ya tenemos los datos
  return (
    <div className="admin-page-container">
      {/* Sidebar izquierdo con información de admin */}
      <AdminSidebar />
      
      {/* Panel principal de contenido */}
      <main className="content-panel">
        {/* Header del contenido */}
        <header className="content-header">
          <h1 className="page-title">Administración de Vocales</h1>
          <p className="page-subtitle">Gestiona y guarda información de las vocales</p>
        </header>

        {/* Mostrar mensaje de error si existe */}
        {error && <ErrorMessage message={error} />}
        
        {/* Lista principal de vocales */}
        <VowelsList vowels={vowels} />
      </main>
    </div>
  );
};

// Exportar el componente principal como export por defecto
export default AdminPageVowels;

// ===================================================================
// ESTILOS CSS INTEGRADOS
// ===================================================================

const styles = `
/* ===================================================================
   VARIABLES CSS Y RESET
   =================================================================== */

:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  
  --background-main: #f8fafc;
  --background-card: #ffffff;
  --background-sidebar: #1e293b;
  
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-light: #ffffff;
  
  --border-color: #e2e8f0;
  --border-radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  --transition: all 0.2s ease-in-out;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-main);
}

/* ===================================================================
   LAYOUT PRINCIPAL
   =================================================================== */

.admin-page-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background-main) 0%, #e2e8f0 100%);
}

/* ===================================================================
   SIDEBAR
   =================================================================== */

.sidebar {
  width: 300px;
  background: var(--background-sidebar);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.admin-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.role-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--text-light);
  margin-bottom: var(--spacing-sm);
  letter-spacing: 0.05em;
}

.welcome-message {
  font-size: var(--font-size-sm);
  color: #94a3b8;
  line-height: 1.5;
  font-weight: 500;
}

.camera-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.camera-placeholder {
  width: 100%;
  height: 350px;
  background: linear-gradient(145deg, #2d3748, #1a202c);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  transition: var(--transition);
}

.camera-placeholder:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.camera-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.camera-placeholder p {
  color: #94a3b8;
  font-weight: 600;
  font-size: var(--font-size-lg);
}

.start-camera-button {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.start-camera-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.start-camera-button:active {
  transform: translateY(0);
}

/* ===================================================================
   PANEL DE CONTENIDO
   =================================================================== */

.content-panel {
  flex: 1;
  padding: var(--spacing-2xl);
  overflow-y: auto;
}

.content-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===================================================================
   GRID DE VOCALES
   =================================================================== */

.vowels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.vowel-card {
  background: var(--background-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.vowel-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.vowel-image {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.vowel-letter {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--text-light);
}

.vowel-content {
  text-align: center;
}

.vowel-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.vowel-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  font-size: var(--font-size-base);
}

/* ===================================================================
   BOTONES
   =================================================================== */

.save-button {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.save-button.guardar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--text-light);
}

.save-button.guardando {
  background: var(--warning-color);
  color: var(--text-light);
  cursor: not-allowed;
}

.save-button.guardado-✅ {
  background: var(--success-color);
  color: var(--text-light);
}

.save-button.error-❌ {
  background: var(--error-color);
  color: var(--text-light);
}

.save-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ===================================================================
   ESTADOS DE CARGA Y ERROR
   =================================================================== */

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--background-main);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-lg);
}

.loading-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-weight: 500;
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--border-radius);
  color: #dc2626;
  margin-bottom: var(--spacing-lg);
  font-weight: 500;
}

.error-icon {
  font-size: var(--font-size-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

/* ===================================================================
   ANIMACIONES
   =================================================================== */

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.vowel-card {
  animation: fadeIn 0.5s ease-out;
}

/* ===================================================================
   RESPONSIVE DESIGN
   =================================================================== */

@media (max-width: 768px) {
  .admin-page-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: var(--spacing-lg);
  }
  
  .camera-placeholder {
    height: 120px;
  }
  
  .content-panel {
    padding: var(--spacing-lg);
  }
  
  .vowels-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .vowel-card {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .content-panel {
    padding: var(--spacing-md);
  }
  
  .page-title {
    font-size: var(--font-size-2xl);
  }
  
  .vowel-image {
    width: 60px;
    height: 60px;
  }
  
  .vowel-letter {
    font-size: var(--font-size-xl);
  }
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}