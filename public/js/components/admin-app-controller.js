import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { firebaseService } from '../services/firebase-service.js';
import { authService } from '../services/auth-service.js';
import './admin-login.js';
import './admin-panel.js';
import './modal-system.js';

/**
 * AdminAppController - Controlador principal para el panel de administración
 * Implementa el patrón Controller y maneja el flujo de autenticación
 */
export class AdminAppController extends LitElement {
  static properties = {
    currentView: { type: String },
    user: { type: Object },
    loading: { type: Boolean },
    error: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .loading-content {
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e0e0e0;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: #667eea;
      font-size: 18px;
    }

    .user-header {
      background: white;
      padding: 15px 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #667eea;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: bold;
      color: #2c3e50;
    }

    .user-email {
      font-size: 12px;
      color: #7f8c8d;
    }

    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }

    .error-message {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 500px;
      text-align: center;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .error-title {
      color: #e74c3c;
      margin-bottom: 10px;
    }

    .error-description {
      color: #666;
      margin-bottom: 20px;
    }

    .retry-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 30px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
    }

    .retry-btn:hover {
      background: #2980b9;
    }
  `;

  constructor() {
    super();
    this.currentView = 'loading';
    this.user = null;
    this.loading = true;
    this.error = '';
    this.unsubscribeAuth = null;
  }

  async connectedCallback() {
    super.connectedCallback();
    
    // Inicializar el sistema de modales
    if (!document.querySelector('modal-system')) {
      const modalElement = document.createElement('modal-system');
      document.body.appendChild(modalElement);
    }

    // Inicializar servicios
    await this.initializeServices();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    // Limpiar suscripciones
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  async initializeServices() {
    try {
      // Inicializar Firebase (detectar automáticamente emulador y configuración)
      await firebaseService.init();
      
      // Inicializar servicio de autenticación
      await authService.init();

      // Escuchar cambios de autenticación
      this.unsubscribeAuth = authService.onAuthStateChange(async (user) => {
        await this.handleAuthStateChange(user);
      });

      // Esperar a que se resuelva el estado inicial
      const currentUser = await authService.waitForAuth();
      await this.handleAuthStateChange(currentUser);

    } catch (error) {
      console.error('Error inicializando servicios:', error);
      this.error = 'Error al inicializar la aplicación';
      this.currentView = 'error';
      this.loading = false;
    }
  }

  async handleAuthStateChange(user) {
    this.loading = true;

    if (user) {
      // Usuario autenticado, verificar autorización
      const isAuthorized = await authService.checkUserAuthorization(user.email);
      
      if (isAuthorized) {
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        this.currentView = 'admin';
      } else {
        // Usuario no autorizado, cerrar sesión
        await authService.signOut();
        this.user = null;
        this.currentView = 'login';
      }
    } else {
      // No hay usuario autenticado
      this.user = null;
      this.currentView = 'login';
    }

    this.loading = false;
  }

  handleLoginSuccess(e) {
    const { user } = e.detail;
    this.user = user;
    this.currentView = 'admin';
  }

  async handleLogout() {
    try {
      await authService.signOut();
      this.user = null;
      this.currentView = 'login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  handleRetry() {
    this.error = '';
    this.currentView = 'loading';
    this.initializeServices();
  }

  renderUserHeader() {
    if (!this.user) return '';

    return html`
      <div class="user-header">
        <div class="user-info">
          ${this.user.photoURL ? html`
            <img src="${this.user.photoURL}" alt="Avatar" class="user-avatar">
          ` : html`
            <div class="user-avatar" style="background: #667eea; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
              ${this.user.email ? this.user.email[0].toUpperCase() : 'A'}
            </div>
          `}
          <div class="user-details">
            <span class="user-name">${this.user.displayName || 'Administrador'}</span>
            <span class="user-email">${this.user.email}</span>
          </div>
        </div>
        <button class="logout-btn" @click=${this.handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    `;
  }

  render() {
    if (this.loading && this.currentView === 'loading') {
      return html`
        <div class="loading-container">
          <div class="loading-content">
            <div class="spinner"></div>
            <div class="loading-text">Verificando autenticación...</div>
          </div>
        </div>
      `;
    }

    if (this.currentView === 'error') {
      return html`
        <div class="error-container">
          <div class="error-message">
            <div class="error-icon">⚠️</div>
            <h2 class="error-title">Error de Inicialización</h2>
            <p class="error-description">${this.error}</p>
            <button class="retry-btn" @click=${this.handleRetry}>
              Reintentar
            </button>
          </div>
        </div>
      `;
    }

    switch (this.currentView) {
      case 'login':
        return html`
          <admin-login @login-success=${this.handleLoginSuccess}></admin-login>
        `;

      case 'admin':
        return html`
          ${this.renderUserHeader()}
          <admin-panel></admin-panel>
        `;

      default:
        return html`
          <div class="loading-container">
            <div class="loading-content">
              <div class="spinner"></div>
            </div>
          </div>
        `;
    }
  }
}

customElements.define('admin-app-controller', AdminAppController);