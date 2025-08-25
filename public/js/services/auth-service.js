import { firebaseService } from './firebase-service.js';

/**
 * AuthService - Servicio de autenticación siguiendo principio Single Responsibility
 * Maneja toda la lógica de autenticación con Google y verificación de permisos
 */
class AuthService {
  constructor() {
    this.auth = null;
    this.database = null;
    this.currentUser = null;
    this.authStateListeners = new Set();
  }

  /**
   * Inicializa el servicio de autenticación
   */
  async init() {
    this.auth = firebaseService.getAuth();
    this.database = firebaseService.getDatabase();
    
    // Configurar listener de estado de autenticación
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js');
    
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
  }

  /**
   * Inicia sesión con Google
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   */
  async signInWithGoogle() {
    const { signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      // Verificar si el usuario está autorizado
      const isAuthorized = await this.checkUserAuthorization(user.email);
      
      if (!isAuthorized) {
        // Si no está autorizado, cerrar sesión inmediatamente
        await this.signOut();
        return {
          success: false,
          error: 'Usuario no autorizado para acceder al panel de administración'
        };
      }
      
      // Registrar acceso en la base de datos
      await this.logUserAccess(user);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
      
    } catch (error) {
      console.error('Error en inicio de sesión con Google:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Por favor, permite popups para este sitio';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verifica si un email está autorizado para acceder al panel admin
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>}
   */
  async checkUserAuthorization(email) {
    const { get, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const authorizedUsersRef = ref(this.database, 'authorizedUsers');
      const snapshot = await get(authorizedUsersRef);
      
      if (!snapshot.exists()) {
        console.warn('No hay usuarios autorizados configurados');
        return false;
      }
      
      const authorizedUsers = snapshot.val();
      
      // Soportar tanto array como objeto
      if (Array.isArray(authorizedUsers)) {
        return authorizedUsers.includes(email);
      } else if (typeof authorizedUsers === 'object') {
        return Object.values(authorizedUsers).includes(email);
      }
      
      return false;
      
    } catch (error) {
      console.error('Error verificando autorización:', error);
      return false;
    }
  }

  /**
   * Registra el acceso del usuario en la base de datos
   * @param {Object} user - Usuario de Firebase
   */
  async logUserAccess(user) {
    const { set, ref, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const accessLog = {
        email: user.email,
        displayName: user.displayName,
        uid: user.uid,
        lastAccess: serverTimestamp(),
        userAgent: navigator.userAgent
      };
      
      await set(ref(this.database, `adminAccessLogs/${user.uid}`), accessLog);
    } catch (error) {
      console.error('Error registrando acceso:', error);
      // No bloqueamos el login si falla el registro
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<void>}
   */
  async signOut() {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js');
    
    try {
      await signOut(this.auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  }

  /**
   * Obtiene el usuario actual
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Verifica si el usuario actual está autorizado
   * @returns {Promise<boolean>}
   */
  async isCurrentUserAuthorized() {
    if (!this.currentUser) {
      return false;
    }
    
    return await this.checkUserAuthorization(this.currentUser.email);
  }

  /**
   * Suscribe un listener a cambios en el estado de autenticación
   * @param {Function} callback - Función a ejecutar cuando cambie el estado
   * @returns {Function} Función para desuscribirse
   */
  onAuthStateChange(callback) {
    this.authStateListeners.add(callback);
    
    // Llamar inmediatamente con el estado actual
    callback(this.currentUser);
    
    // Retornar función para desuscribirse
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  /**
   * Notifica a todos los listeners sobre cambios en el estado de autenticación
   * @param {Object|null} user - Usuario actual o null
   */
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error en listener de auth state:', error);
      }
    });
  }

  /**
   * Espera hasta que el estado de autenticación esté listo
   * @returns {Promise<Object|null>}
   */
  async waitForAuth() {
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js');
    
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Obtiene la lista de usuarios autorizados (solo para super admin)
   * @returns {Promise<Array<string>>}
   */
  async getAuthorizedUsers() {
    const { get, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const snapshot = await get(ref(this.database, 'authorizedUsers'));
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const data = snapshot.val();
      
      if (Array.isArray(data)) {
        return data;
      } else if (typeof data === 'object') {
        return Object.values(data);
      }
      
      return [];
    } catch (error) {
      console.error('Error obteniendo usuarios autorizados:', error);
      return [];
    }
  }

  /**
   * Añade un usuario autorizado (solo para super admin)
   * @param {string} email - Email del usuario a autorizar
   * @returns {Promise<boolean>}
   */
  async addAuthorizedUser(email) {
    const { get, set, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      // Verificar que el usuario actual es super admin
      if (!await this.isCurrentUserAuthorized()) {
        throw new Error('No tienes permisos para realizar esta acción');
      }
      
      const authorizedUsersRef = ref(this.database, 'authorizedUsers');
      const snapshot = await get(authorizedUsersRef);
      
      let users = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        users = Array.isArray(data) ? data : Object.values(data);
      }
      
      if (!users.includes(email)) {
        users.push(email);
        await set(authorizedUsersRef, users);
      }
      
      return true;
    } catch (error) {
      console.error('Error añadiendo usuario autorizado:', error);
      return false;
    }
  }

  /**
   * Elimina un usuario autorizado (solo para super admin)
   * @param {string} email - Email del usuario a desautorizar
   * @returns {Promise<boolean>}
   */
  async removeAuthorizedUser(email) {
    const { get, set, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      // Verificar que el usuario actual es super admin
      if (!await this.isCurrentUserAuthorized()) {
        throw new Error('No tienes permisos para realizar esta acción');
      }
      
      const authorizedUsersRef = ref(this.database, 'authorizedUsers');
      const snapshot = await get(authorizedUsersRef);
      
      if (!snapshot.exists()) {
        return false;
      }
      
      let users = [];
      const data = snapshot.val();
      users = Array.isArray(data) ? data : Object.values(data);
      
      const filteredUsers = users.filter(u => u !== email);
      
      if (filteredUsers.length !== users.length) {
        await set(authorizedUsersRef, filteredUsers);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error eliminando usuario autorizado:', error);
      return false;
    }
  }
}

// Exportar instancia única (Singleton)
export const authService = new AuthService();