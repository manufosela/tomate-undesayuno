import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class ModalSystem extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    title: { type: String },
    content: { type: String },
    type: { type: String }, // 'info', 'confirm', 'prompt', 'custom'
    confirmText: { type: String },
    cancelText: { type: String },
    promptValue: { type: String },
    promptPlaceholder: { type: String },
    onConfirm: { type: Function },
    onCancel: { type: Function },
    customContent: { type: Object }
  };

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      font-family: system-ui, -apple-system, sans-serif;
    }

    :host([isOpen]) {
      opacity: 1;
      visibility: visible;
    }

    .modal {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      transform: scale(0.7);
      transition: transform 0.3s ease;
    }

    :host([isOpen]) .modal {
      transform: scale(1);
    }

    .modal-header {
      padding: 24px 24px 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 20px;
    }

    .modal-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f5f5f5;
      color: #666;
    }

    .modal-body {
      padding: 0 24px 24px 24px;
    }

    .modal-content {
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .prompt-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 20px;
      transition: border-color 0.2s;
    }

    .prompt-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .modal-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 100px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .custom-content {
      color: #333;
    }

    @media (max-width: 768px) {
      .modal {
        margin: 15px;
        width: calc(100% - 30px);
        max-height: calc(100vh - 30px);
        overflow-y: auto;
      }

      .modal-header {
        padding: 20px 20px 0 20px;
        margin-bottom: 15px;
      }

      .modal-title {
        font-size: 20px;
      }

      .modal-body {
        padding: 0 20px 20px 20px;
      }

      .modal-buttons {
        flex-direction: column;
        gap: 10px;
      }

      .btn {
        width: 100%;
        padding: 12px;
        font-size: 15px;
      }
    }

    @media (max-width: 480px) {
      .modal {
        margin: 10px;
        width: calc(100% - 20px);
        max-height: calc(100vh - 20px);
      }

      .modal-header {
        padding: 15px 15px 0 15px;
        margin-bottom: 12px;
      }

      .modal-title {
        font-size: 18px;
      }

      .close-btn {
        width: 28px;
        height: 28px;
        font-size: 24px;
      }

      .modal-body {
        padding: 0 15px 15px 15px;
      }

      .modal-content {
        font-size: 14px;
        line-height: 1.5;
      }

      .modal-input {
        font-size: 16px; /* Prevent zoom on iOS */
        padding: 10px;
      }

      .btn {
        padding: 10px;
        font-size: 14px;
        border-radius: 6px;
      }

      .modal-buttons {
        gap: 8px;
      }
    }

    @media (max-width: 360px) {
      .modal {
        margin: 5px;
        width: calc(100% - 10px);
      }

      .modal-header {
        padding: 12px 12px 0 12px;
      }

      .modal-title {
        font-size: 16px;
      }

      .modal-body {
        padding: 0 12px 12px 12px;
      }
    }
  `;

  constructor() {
    super();
    this.isOpen = false;
    this.title = '';
    this.content = '';
    this.type = 'info';
    this.confirmText = 'Aceptar';
    this.cancelText = 'Cancelar';
    this.promptValue = '';
    this.promptPlaceholder = '';
    this.onConfirm = null;
    this.onCancel = null;
    this.customContent = null;
  }

  open() {
    console.log('Modal open() llamado');
    this.isOpen = true;
    this.setAttribute('isOpen', '');
    // Trap focus
    setTimeout(() => {
      const firstButton = this.shadowRoot.querySelector('.btn');
      if (firstButton) firstButton.focus();
    }, 100);
  }

  close() {
    this.isOpen = false;
    this.removeAttribute('isOpen');
  }

  handleConfirm() {
    if (this.type === 'prompt') {
      const input = this.shadowRoot.querySelector('.prompt-input');
      const value = input ? input.value.trim() : '';
      if (this.onConfirm) {
        this.onConfirm(value);
      }
    } else {
      if (this.onConfirm) {
        this.onConfirm(true);
      }
    }
    this.close();
  }

  handleCancel() {
    if (this.onCancel) {
      this.onCancel(false);
    }
    this.close();
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.handleCancel();
    } else if (e.key === 'Enter' && this.type === 'prompt') {
      this.handleConfirm();
    }
  }

  handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this.handleCancel();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  render() {
    return html`
      <div class="modal-backdrop" @click=${this.handleBackdropClick}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h2 class="modal-title">${this.title}</h2>
            <button class="close-btn" @click=${this.close}>×</button>
          </div>
          
          <div class="modal-body">
            ${this.type === 'custom' ? html`
              <div class="custom-content">
                ${this.customContent}
              </div>
            ` : html`
              <div class="modal-content">
                ${this.content}
              </div>
            `}
            
            ${this.type === 'prompt' ? html`
              <input 
                type="text" 
                class="prompt-input" 
                .value=${this.promptValue}
                placeholder=${this.promptPlaceholder}
                @input=${(e) => this.promptValue = e.target.value}
              />
            ` : ''}
            
            <div class="modal-buttons">
              ${this.type !== 'info' ? html`
                <button class="btn btn-secondary" @click=${this.handleCancel}>
                  ${this.cancelText}
                </button>
              ` : ''}
              
              <button 
                class="btn ${this.type === 'confirm' && this.title.includes('Eliminar') ? 'btn-danger' : 'btn-primary'}" 
                @click=${this.handleConfirm}
              >
                ${this.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Sistema de modales global
class ModalManager {
  constructor() {
    this.modalElement = null;
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Crear elemento modal si no existe
    if (!this.modalElement) {
      this.modalElement = document.createElement('modal-system');
      document.body.appendChild(this.modalElement);
      console.log('Modal system inicializado');
    }
  }

  // Modal de información
  info(title, content) {
    return new Promise((resolve) => {
      this.modalElement.title = title;
      this.modalElement.content = content;
      this.modalElement.type = 'info';
      this.modalElement.confirmText = 'Entendido';
      this.modalElement.onConfirm = () => resolve(true);
      this.modalElement.onCancel = () => resolve(false);
      this.modalElement.open();
    });
  }

  // Modal de confirmación
  confirm(title, content, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
      this.modalElement.title = title;
      this.modalElement.content = content;
      this.modalElement.type = 'confirm';
      this.modalElement.confirmText = confirmText;
      this.modalElement.cancelText = cancelText;
      this.modalElement.onConfirm = () => resolve(true);
      this.modalElement.onCancel = () => resolve(false);
      this.modalElement.open();
    });
  }

  // Modal de prompt
  prompt(title, content, placeholder = '', defaultValue = '') {
    return new Promise((resolve) => {
      // Asegurar que el modal está inicializado
      if (!this.modalElement) {
        this.init();
      }
      
      console.log('Abriendo modal prompt:', title);
      this.modalElement.title = title;
      this.modalElement.content = content;
      this.modalElement.type = 'prompt';
      this.modalElement.confirmText = 'Aceptar';
      this.modalElement.cancelText = 'Cancelar';
      this.modalElement.promptPlaceholder = placeholder;
      this.modalElement.promptValue = defaultValue;
      this.modalElement.onConfirm = (value) => {
        console.log('Modal confirmado con valor:', value);
        resolve(value);
      };
      this.modalElement.onCancel = () => {
        console.log('Modal cancelado');
        resolve(null);
      };
      this.modalElement.open();
    });
  }

  // Modal personalizado con contenido HTML
  custom(title, htmlContent, confirmText = 'Aceptar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
      this.modalElement.title = title;
      this.modalElement.type = 'custom';
      this.modalElement.customContent = htmlContent;
      this.modalElement.confirmText = confirmText;
      this.modalElement.cancelText = cancelText;
      this.modalElement.onConfirm = () => resolve(true);
      this.modalElement.onCancel = () => resolve(false);
      this.modalElement.open();
    });
  }
}

// Instancia global
export const modalManager = new ModalManager();

// Registrar el componente
customElements.define('modal-system', ModalSystem);