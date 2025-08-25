// Servicio de gestión de sesión con localStorage
class SessionService {
  constructor() {
    this.SESSION_BASE_KEY = 'tomate-desayuno-session';
    // Generar un ID único para esta ventana/pestaña del navegador
    this.sessionId = this.generateSessionId();
    this.SESSION_KEY = `${this.SESSION_BASE_KEY}-${this.sessionId}`;
    
    // Limpiar sesiones expiradas al inicializar
    this.cleanupExpiredSessions();
  }

  // Generar un ID único para esta sesión de navegador
  generateSessionId() {
    // Usar sessionStorage que es único por pestaña
    let sessionId = sessionStorage.getItem('tomate-session-id');
    
    if (!sessionId) {
      // Generar un ID único usando timestamp + random
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('tomate-session-id', sessionId);
    }
    
    return sessionId;
  }

  // Guardar sesión
  saveSession(groupId, personName) {
    const sessionData = {
      groupId,
      personName,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      console.log('Sesión guardada:', sessionData);
      return true;
    } catch (error) {
      console.error('Error guardando sesión:', error);
      return false;
    }
  }

  // Obtener sesión actual
  getSession() {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Verificar que la sesión no sea muy antigua (24 horas)
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms
      if (Date.now() - session.timestamp > maxAge) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error leyendo sesión:', error);
      return null;
    }
  }

  // Limpiar sesión
  clearSession() {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      console.log('Sesión eliminada');
      return true;
    } catch (error) {
      console.error('Error eliminando sesión:', error);
      return false;
    }
  }

  // Verificar si hay sesión activa
  hasActiveSession() {
    return this.getSession() !== null;
  }

  // Actualizar timestamp de la sesión
  refreshSession() {
    const session = this.getSession();
    if (session) {
      session.timestamp = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  // Limpiar sesiones expiradas (opcional, para mantener limpio el localStorage)
  cleanupExpiredSessions() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.SESSION_BASE_KEY)) {
        try {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            if (Date.now() - session.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Si no se puede parsear, eliminar la clave
          localStorage.removeItem(key);
        }
      }
    });
  }
}

export const sessionService = new SessionService();