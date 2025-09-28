import React, { useState, useEffect, useCallback } from 'react';

// ===================================================================
// CONSTANTES Y CONFIGURACIÓN DEL SISTEMA DE NÚMEROS
// ===================================================================

/**
 * Configuración principal de la API Django
 * Define las URLs base y endpoints específicos para el manejo de números
 */
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api', // URL base del backend Django
  ENDPOINTS: {
    NUMBERS_LIST: '/lista/numeros/',       // GET: Obtener lista de números disponibles (1-9)
    SAVE_NUMBER: '/guardar/numeros/'       // POST: Guardar registro cuando se selecciona un número
  },
  TIMEOUT: 10000 // Timeout de 10 segundos para peticiones HTTP
};

/**
 * Datos de respaldo para los números del 1 al 9
 * Se usan cuando la API de Django no está disponible o no devuelve datos
 */
const FALLBACK_NUMBERS = [
  { id: 1, number: 1, title: 'NÚMERO 1', content: 'Primer número natural. Representa la unidad básica.' },
  { id: 2, number: 2, title: 'NÚMERO 2', content: 'Segundo número natural. Primer número par.' },
  { id: 3, number: 3, title: 'NÚMERO 3', content: 'Tercer número natural. Primer número impar mayor que 1.' },
  { id: 4, number: 4, title: 'NÚMERO 4', content: 'Cuarto número natural. Primer cuadrado perfecto mayor que 1.' },
  { id: 5, number: 5, title: 'NÚMERO 5', content: 'Quinto número natural. Número primo.' },
  { id: 6, number: 6, title: 'NÚMERO 6', content: 'Sexto número natural. Primer número perfecto.' },
  { id: 7, number: 7, title: 'NÚMERO 7', content: 'Séptimo número natural. Número primo.' },
  { id: 8, number: 8, title: 'NÚMERO 8', content: 'Octavo número natural. Primer cubo perfecto mayor que 1.' },
  { id: 9, number: 9, title: 'NÚMERO 9', content: 'Noveno número natural. Último dígito del sistema decimal.' }
];

/**
 * Estados posibles de los elementos de número
 * Define los diferentes estados visuales y de interacción
 */
const NUMBER_STATES = {
  NORMAL: 'normal',           // Estado normal sin selección
  SELECTED: 'selected',       // Número seleccionado por el usuario
  PROCESSING: 'processing',   // Enviando datos al servidor Django
  SUCCESS: 'success',         // Guardado exitosamente
  ERROR: 'error'              // Error al guardar
};

// ===================================================================
// SERVICIOS DE API PARA COMUNICACIÓN CON DJANGO
// ===================================================================

/**
 * Clase que maneja todas las operaciones relacionadas con la API Django
 * Centraliza las peticiones HTTP para mantener el código organizado
 */
class NumberService {
  /**
   * Obtiene la lista de números desde el backend Django
   * @returns {Promise<Array>} Array de objetos número o datos de respaldo
   */
  static async fetchNumbers() {
    try {
      // Realizar petición GET al endpoint de lista de números
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NUMBERS_LIST}`, {
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
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_NUMBERS;
    } catch (error) {
      // En caso de error, usar datos de respaldo y registrar el error
      console.warn('Error fetching numbers, using fallback data:', error);
      return FALLBACK_NUMBERS;
    }
  }

  /**
   * Guarda un registro de número seleccionado en el backend Django
   * @param {Object} numberData - Datos del número a guardar
   * @returns {Promise<Object>} Respuesta del servidor Django
   */
  static async saveNumberRecord(numberData) {
    try {
      // Preparar los datos en el formato esperado por Django
      const payload = {
        id_numero: numberData.id,             // ID del número
        numero_valor: numberData.number,      // Valor numérico (1-9)
        nombre_numero: numberData.title,      // Título del número
        timestamp: new Date().toISOString()   // Timestamp actual en formato ISO
      };

      // Realizar petición POST al endpoint de guardado
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_NUMBER}`, {
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
      console.error('Error saving number record:', error);
      throw error;
    }
  }
}

// ===================================================================
// HOOKS PERSONALIZADOS PARA MANEJO DE ESTADO
// ===================================================================

/**
 * Hook personalizado para manejar el estado de los números
 * Encapsula toda la lógica relacionada con obtener y mantener la lista de números
 * @returns {Object} Estado de números, loading, error y función de recarga
 */
const useNumbers = () => {
  // Estados locales para manejar los datos de números
  const [numbers, setNumbers] = useState([]);        // Lista de números (1-9)
  const [loading, setLoading] = useState(true);      // Estado de carga
  const [error, setError] = useState(null);          // Estado de error

  /**
   * Función para obtener los números del servidor Django
   * useCallback evita recrear la función en cada render
   */
  const fetchNumbers = useCallback(async () => {
    try {
      setLoading(true);  // Activar estado de carga
      setError(null);    // Limpiar errores previos
      
      // Obtener datos del servicio
      const numbersData = await NumberService.fetchNumbers();
      setNumbers(numbersData);
    } catch (err) {
      // Manejar errores y establecer datos de respaldo
      setError('No se pudo cargar la lista de números. Usando datos de respaldo.');
      setNumbers(FALLBACK_NUMBERS);
    } finally {
      setLoading(false); // Desactivar estado de carga siempre
    }
  }, []); // Sin dependencias, la función no cambia

  // Efecto para cargar los números al montar el componente
  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  // Retornar el estado y la función de recarga
  return { numbers, loading, error, refetch: fetchNumbers };
};

/**
 * Hook personalizado para manejar la selección y guardado de números
 * Gestiona el estado de selección y la comunicación con Django
 * @returns {Object} Estado seleccionado, función de selección e indicadores
 */
const useNumberSelection = () => {
  // Estado del número seleccionado y su estado de procesamiento
  const [selectedNumber, setSelectedNumber] = useState(null);    // Número actualmente seleccionado
  const [numberStates, setNumberStates] = useState({});         // Estados individuales de cada número
  const [isProcessing, setIsProcessing] = useState(false);      // Indicador de procesamiento

  /**
   * Función para seleccionar un número y guardarlo en Django
   * @param {Object} numberData - Datos del número seleccionado
   */
  const selectNumber = useCallback(async (numberData) => {
    // Evitar múltiples selecciones simultáneas
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setSelectedNumber(numberData);

      // Actualizar estado del número específico a "procesando"
      setNumberStates(prev => ({
        ...prev,
        [numberData.id]: NUMBER_STATES.PROCESSING
      }));

      // Intentar guardar en el servidor Django
      await NumberService.saveNumberRecord(numberData);
      
      // Actualizar estado a éxito
      setNumberStates(prev => ({
        ...prev,
        [numberData.id]: NUMBER_STATES.SUCCESS
      }));

      // Resetear estado después de 2 segundos
      setTimeout(() => {
        setNumberStates(prev => ({
          ...prev,
          [numberData.id]: NUMBER_STATES.NORMAL
        }));
        setSelectedNumber(null);
      }, 2000);

    } catch (error) {
      // Manejar error y mostrar estado de error
      setNumberStates(prev => ({
        ...prev,
        [numberData.id]: NUMBER_STATES.ERROR
      }));

      // Resetear estado después de 3 segundos (más tiempo para mostrar error)
      setTimeout(() => {
        setNumberStates(prev => ({
          ...prev,
          [numberData.id]: NUMBER_STATES.NORMAL
        }));
        setSelectedNumber(null);
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return { 
    selectedNumber, 
    numberStates, 
    selectNumber, 
    isProcessing 
  };
};

// ===================================================================
// COMPONENTES UI
// ===================================================================

/**
 * Componente de spinner de carga
 * Se muestra mientras se están cargando los números desde Django
 */
const LoadingSpinner = () => (
  <div className="loading-container" role="status" aria-label="Cargando">
    <div className="loading-spinner"></div>
    <p className="loading-text">Cargando lista de números...</p>
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
 * Mantiene el mismo diseño que la página de vocales para consistencia
 */
const AdminSidebar = () => (
  <aside className="sidebar" style={{
    width: '300px',
    background: '#1e293b',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  }}>
    {/* Header con información del usuario admin */}
    <header className="admin-header" style={{
      textAlign: 'center',
      marginBottom: '3rem',
      paddingBottom: '1.5rem',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h1 className="role-title" style={{
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '0.75rem',
        letterSpacing: '0.05em'
      }}>ERES UN ADMIN</h1>
      <p className="welcome-message" style={{
        fontSize: '0.875rem',
        color: '#94a3b8',
        lineHeight: '1.5',
        fontWeight: '500'
      }}>
        ACABAS DE INGRESAR AL PROJECT UWU COMO ADMINISTRADOR
      </p>
    </header>
    
    {/* Sección de cámara (placeholder para funcionalidad futura) */}
    <section className="camera-section" style={{
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="camera-placeholder" aria-label="Área de cámara" style={{
        width: '100%',
        height: '350px',
        background: 'linear-gradient(145deg, #2d3748, #1a202c)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        border: '2px dashed rgba(255, 255, 255, 0.2)',
        transition: 'all 0.2s ease-in-out'
      }}>
        <span className="camera-icon" style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>📹</span>
        <p style={{
          color: '#94a3b8',
          fontWeight: '600',
          fontSize: '1.125rem'
        }}>AQUÍ VA LA CÁMARA</p>
      </div>
      
      {/* Botón para iniciar cámara */}
      <button 
        type="button"
        className="start-camera-button"
        onClick={() => console.log('Iniciar cámara - Funcionalidad pendiente')}
        aria-label="Iniciar cámara"
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        INICIAR CÁMARA
      </button>
    </section>
  </aside>
);

/**
 * Componente individual para cada número
 * Representa un número del 1 al 9 con su estado visual correspondiente
 * @param {Object} number - Objeto con datos del número (id, number, title, content)
 * @param {string} state - Estado actual del número (normal, selected, processing, etc.)
 * @param {Function} onSelect - Función a ejecutar cuando se selecciona el número
 */
const NumberCard = React.memo(({ number, state, onSelect }) => {
  /**
   * Manejador del clic en el número
   * useCallback evita que se recree la función en cada render
   */
  const handleClick = useCallback(() => {
    // Solo permitir selección si no está procesando
    if (state !== NUMBER_STATES.PROCESSING) {
      onSelect(number);
    }
  }, [number, onSelect, state]);

  // Determinar las clases CSS basadas en el estado
  const getCardClasses = () => {
    const baseClass = 'number-card';
    const stateClass = `number-card--${state}`;
    const clickableClass = state !== NUMBER_STATES.PROCESSING ? 'number-card--clickable' : '';
    
    return `${baseClass} ${stateClass} ${clickableClass}`.trim();
  };

  // Obtener el texto de estado para mostrar al usuario
  const getStateText = () => {
    switch (state) {
      case NUMBER_STATES.PROCESSING:
        return 'Procesando...';
      case NUMBER_STATES.SUCCESS:
        return '¡Guardado!';
      case NUMBER_STATES.ERROR:
        return 'Error';
      default:
        return number.title;
    }
  };

  return (
    <article 
      className={getCardClasses()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar ${number.title}`}
      aria-disabled={state === NUMBER_STATES.PROCESSING}
      style={{
        // Estilos inline básicos para funcionalidad inmediata
        background: state === NUMBER_STATES.SUCCESS ? '#dcfce7' : 
                   state === NUMBER_STATES.ERROR ? '#fee2e2' : 
                   state === NUMBER_STATES.PROCESSING ? '#f3f4f6' : '#ffffff',
        border: `2px solid ${
          state === NUMBER_STATES.SUCCESS ? '#10b981' : 
          state === NUMBER_STATES.ERROR ? '#ef4444' : 
          state === NUMBER_STATES.PROCESSING ? '#8b5cf6' : '#e2e8f0'
        }`,
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: state !== NUMBER_STATES.PROCESSING ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease-in-out',
        minHeight: '150px',
        position: 'relative'
      }}
    >
      {/* Área de visualización del número */}
      <div className="number-display" style={{
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <span className="number-value" style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          color: '#ffffff'
        }}>{number.number}</span>
      </div>
      
      {/* Información del número */}
      <div className="number-info">
        <h3 className="number-title" style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>{getStateText()}</h3>
        {/* Mostrar contenido solo en estado normal */}
        {state === NUMBER_STATES.NORMAL && (
          <p className="number-description" style={{
            fontSize: '0.875rem',
            color: '#64748b',
            lineHeight: '1.4',
            textAlign: 'center'
          }}>{number.content}</p>
        )}
      </div>

      {/* Indicador visual de estado */}
      <div className="number-status-indicator" style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem'
      }}>
        {state === NUMBER_STATES.PROCESSING && (
          <div className="spinner-small" style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e2e8f0',
            borderTop: '2px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        )}
        {state === NUMBER_STATES.SUCCESS && <span className="success-icon">✅</span>}
        {state === NUMBER_STATES.ERROR && <span className="error-icon">❌</span>}
      </div>
    </article>
  );
});

// Asignar nombre al componente para debugging
NumberCard.displayName = 'NumberCard';

/**
 * Componente contenedor para la grilla de números
 * Organiza los números del 1 al 9 en una grilla de 3x3 como se muestra en el boceto
 * @param {Array} numbers - Array de objetos número
 * @param {Object} numberStates - Estados actuales de cada número
 * @param {Function} onSelectNumber - Función para manejar la selección de números
 */
const NumbersGrid = ({ numbers, numberStates, onSelectNumber }) => {
  // Mostrar estado vacío si no hay números
  if (!numbers.length) {
    return (
      <div className="empty-state" style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#64748b',
        fontSize: '1.125rem'
      }}>
        <p>No hay números disponibles</p>
      </div>
    );
  }

  // Renderizar grilla de números organizados del 1 al 9
  return (
    <div className="numbers-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: '1.5rem',
      maxWidth: '600px',
      margin: '0 auto',
      aspectRatio: '1'
    }}>
      {numbers.map((number) => (
        <NumberCard 
          key={number.id} 
          number={number}
          state={numberStates[number.id] || NUMBER_STATES.NORMAL}
          onSelect={onSelectNumber}
        />
      ))}
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

/**
 * Componente principal de la aplicación de números
 * Punto de entrada que coordina todos los demás componentes
 * Maneja el estado global y renderiza condicionalmente
 */
const AdminPageNumbers = () => {
  // Usar hooks personalizados para obtener datos y manejar selección
  const { numbers, loading, error } = useNumbers();
  const { selectedNumber, numberStates, selectNumber, isProcessing } = useNumberSelection();

  // Mostrar spinner mientras se cargan los datos
  if (loading) {
    return <LoadingSpinner />;
  }

  // Renderizar la interfaz principal cuando ya tenemos los datos
  return (
    <div className="admin-page-container" style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Sidebar izquierdo con información de admin */}
      <AdminSidebar />
      
      {/* Panel principal de contenido */}
      <main className="content-panel" style={{
        flex: '1',
        padding: '3rem',
        overflowY: 'auto'
      }}>
        {/* Header del contenido */}
        <header className="content-header" style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 className="page-title" style={{
            fontSize: '1.875rem',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>Administración de Números</h1>
          <p className="page-subtitle" style={{
            fontSize: '1.125rem',
            color: '#64748b',
            fontWeight: '500'
          }}>Selecciona y gestiona números del 1 al 9</p>
        </header>

        {/* Mostrar mensaje de error si existe */}
        {error && <ErrorMessage message={error} />}
        
        {/* Información del número seleccionado */}
        {selectedNumber && (
          <div className="selected-info" style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#dbeafe',
            borderRadius: '12px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <p>Número seleccionado: <strong>{selectedNumber.title}</strong></p>
          </div>
        )}
        
        {/* Grilla principal de números */}
        <NumbersGrid 
          numbers={numbers}
          numberStates={numberStates}
          onSelectNumber={selectNumber}
        />
        
        {/* Indicador de procesamiento global */}
        {isProcessing && (
          <div className="global-processing" style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f3f4f6',
            borderRadius: '12px',
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            <p>Enviando datos al servidor...</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Exportar el componente principal como export por defecto
export default AdminPageNumbers;