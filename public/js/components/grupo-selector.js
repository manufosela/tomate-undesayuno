import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './modal-system.js';
import { modalManager } from './modal-system.js';

export class GrupoSelector extends LitElement {
  static properties = {
    loading: { type: Boolean },
    error: { type: String },
    showJoinForm: { type: Boolean }
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .header {
      margin-bottom: 40px;
    }

    // .logo {
    //   font-size: 60px;
    //   margin-bottom: 20px;
    // }

    h1 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: bold;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }

    .option-button {
      padding: 20px;
      border: 2px solid #667eea;
      background: white;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .option-button:hover {
      background: #667eea;
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .option-button.primary {
      background: #667eea;
      color: white;
    }

    .option-button.primary:hover {
      background: #5a6fd8;
    }

    .join-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .input-group {
      text-align: left;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    input {
      width: 100%;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .form-buttons button {
      flex: 1;
      padding: 15px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .error {
      background: #ffe6e6;
      color: #d32f2f;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #d32f2f;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #667eea;
      font-weight: 600;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e0e0e0;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .admin-link {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #f0f0f0;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 20px;
    }

    .admin-link:hover {
      background: #667eea;
      color: white;
    }

    @media (max-width: 768px) {
      :host {
        padding: 15px;
      }

      .container {
        padding: 30px 20px;
        margin: 0;
        max-width: 100%;
      }

      .header {
        margin-bottom: 30px;
      }

      .logo {
        font-size: 50px;
        margin-bottom: 15px;
      }

      h1 {
        font-size: 24px;
      }

      .subtitle {
        font-size: 15px;
      }

      .option-button {
        padding: 18px;
        font-size: 16px;
      }

      .input-group {
        margin-bottom: 15px;
      }

      .form-input {
        padding: 12px;
        font-size: 15px;
      }

      .btn {
        padding: 12px 20px;
        font-size: 15px;
      }

      .admin-link {
        top: 15px;
        right: 15px;
        padding: 8px;
        font-size: 18px;
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 10px;
      }

      .container {
        padding: 20px 15px;
        border-radius: 12px;
      }

      .header {
        margin-bottom: 25px;
      }

      .logo {
        font-size: 40px;
        margin-bottom: 12px;
      }

      h1 {
        font-size: 20px;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 14px;
      }

      .options {
        gap: 15px;
        margin-bottom: 25px;
      }

      .option-button {
        padding: 15px;
        font-size: 15px;
        border-radius: 10px;
      }

      .input-group {
        margin-bottom: 12px;
      }

      .form-input {
        padding: 10px;
        font-size: 14px;
        border-radius: 6px;
      }

      .btn {
        padding: 10px 15px;
        font-size: 14px;
        border-radius: 6px;
      }

      .actions {
        gap: 10px;
      }

      .error {
        padding: 12px;
        font-size: 14px;
      }

      .loading {
        gap: 8px;
        font-size: 14px;
      }

      .admin-link {
        top: 10px;
        right: 10px;
        padding: 6px;
        font-size: 16px;
      }
    }

    @media (max-width: 360px) {
      .container {
        padding: 15px 10px;
      }

      .logo {
        font-size: 35px;
      }

      h1 {
        font-size: 18px;
      }

      .option-button {
        padding: 12px;
        font-size: 14px;
      }

      .btn {
        padding: 8px 12px;
        font-size: 13px;
      }
    }
  `;

  constructor() {
    super();
    this.loading = false;
    this.error = '';
    this.showJoinForm = false;
  }

  showCreateGroup() {
    this.loading = true;
    this.error = '';

    this.dispatchEvent(new CustomEvent('create-group', {
      bubbles: true,
      composed: true
    }));
  }

  showJoinGroupForm() {
    this.showJoinForm = true;
    this.error = '';
  }

  hideJoinForm() {
    this.showJoinForm = false;
    this.error = '';
  }

  handleJoinGroup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const groupId = formData.get('groupId').toUpperCase();
    const personName = formData.get('personName').trim();

    if (!groupId || !personName) {
      this.error = 'Por favor, completa todos los campos';
      return;
    }

    // Validar formato del ID
    if (!groupId.match(/^TOMATE-\d{5}$/)) {
      this.error = 'El ID debe tener el formato TOMATE-12345';
      return;
    }

    this.loading = true;
    this.error = '';

    this.dispatchEvent(new CustomEvent('join-group', {
      detail: { groupId, personName },
      bubbles: true,
      composed: true
    }));
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
    this.loading = false;
  }

  render() {
    return html`

      <div class="container">
        <div class="header">
          <div class="logo"><img src="/images/tomateanimado.gif" alt="Tómate un desayuno" height="150"/></div>
          <h1>Tomate un Desayuno</h1>
          <p class="subtitle">Gestiona los pedidos de tu grupo de forma fácil</p>
        </div>

        ${this.error ? html`
          <div class="error">
            ${this.error}
          </div>
        ` : ''}

        ${this.loading ? html`
          <div class="loading">
            <div class="spinner"></div>
            Procesando...
          </div>
        ` : ''}

        ${!this.showJoinForm && !this.loading ? html`
          <div class="options">
            <button class="option-button primary" @click=${this.showCreateGroup}>
              <span>🎯</span>
              Crear grupo de desayuno
            </button>
            
            <button class="option-button" @click=${this.showJoinGroupForm}>
              <span>👥</span>
              Unirse a grupo de desayuno
            </button>
          </div>
        ` : ''}

        ${this.showJoinForm && !this.loading ? html`
          <form @submit=${this.handleJoinGroup} class="join-form">
            <div class="input-group">
              <label for="groupId">ID del Grupo</label>
              <input 
                type="text" 
                id="groupId" 
                name="groupId" 
                placeholder="TOMATE-12345"
                pattern="TOMATE-[0-9]{5}"
                title="Formato: TOMATE-12345"
                required
              />
            </div>
            
            <div class="input-group">
              <label for="personName">Tu nombre</label>
              <input 
                type="text" 
                id="personName" 
                name="personName" 
                placeholder="Escribe tu nombre"
                required
              />
            </div>

            <div class="form-buttons">
              <button type="button" class="btn-secondary" @click=${this.hideJoinForm}>
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                Unirse al grupo
              </button>
            </div>
          </form>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('grupo-selector', GrupoSelector);