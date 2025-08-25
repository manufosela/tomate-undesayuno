import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { authService } from '../services/auth-service.js';

/**
 * AdminLogin - Componente de login para el panel de administración
 * Implementa el patrón de Separation of Concerns
 */
export class AdminLogin extends LitElement {
  static properties = {
    loading: { type: Boolean },
    error: { type: String }
  };

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }

    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .subtitle {
      color: #7f8c8d;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
      border: 1px solid #fcc;
    }

    .google-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: white;
      color: #444;
      padding: 12px 24px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      max-width: 280px;
    }

    .google-btn:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #4285f4;
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
    }

    .google-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .google-icon {
      margin-right: 12px;
      width: 20px;
      height: 20px;
    }

    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4285f4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .security-notice {
      margin-top: 30px;
      padding: 15px;
      background: #f0f4f8;
      border-radius: 6px;
      font-size: 12px;
      color: #5a6c7d;
      line-height: 1.5;
    }

    .security-notice strong {
      color: #2c3e50;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 30px 20px;
      }

      h1 {
        font-size: 24px;
      }
    }
  `;

  constructor() {
    super();
    this.loading = false;
    this.error = '';
  }

  async handleGoogleLogin() {
    this.loading = true;
    this.error = '';

    try {
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        // Emitir evento de login exitoso
        this.dispatchEvent(new CustomEvent('login-success', {
          detail: { user: result.user },
          bubbles: true,
          composed: true
        }));
      } else {
        this.error = result.error || 'Error al iniciar sesión';
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.error = 'Error inesperado al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="login-container">
        <img src="/images/tomatelogo.png" alt="Logo" class="logo">
        
        <h1>Panel de Administración</h1>
        <p class="subtitle">Acceso exclusivo para administradores</p>

        ${this.error ? html`
          <div class="error-message">
            ${this.error}
          </div>
        ` : ''}

        <button 
          class="google-btn" 
          @click=${this.handleGoogleLogin}
          ?disabled=${this.loading}
        >
          ${this.loading ? html`
            <span class="loading-spinner"></span>
            Iniciando sesión...
          ` : html`
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          `}
        </button>

        <div class="security-notice">
          <strong>Acceso Restringido</strong><br>
          Solo los usuarios autorizados pueden acceder al panel de administración.
          Tu intento de acceso será registrado por seguridad.
        </div>
      </div>
    `;
  }
}

customElements.define('admin-login', AdminLogin);