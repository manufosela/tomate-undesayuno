import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { firebaseService } from '../services/firebase-service.js';
import { grupoService } from '../services/grupo-service.js';
import { sessionService } from '../services/session-service.js';
import './grupo-selector.js';
import './personas-manager-grupo.js';
import './modal-system.js';
import { modalManager } from './modal-system.js';

export class AppController extends LitElement {
  static properties = {
    currentView: { type: String },
    currentGroupId: { type: String },
    currentPersonName: { type: String },
    firebaseReady: { type: Boolean },
    error: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .error-banner {
      background: #f44336;
      color: white;
      padding: 15px;
      text-align: center;
      font-weight: bold;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 18px;
      color: #667eea;
    }
  `;

  constructor() {
    super();
    this.currentView = 'loading';
    this.currentGroupId = '';
    this.currentPersonName = '';
    this.firebaseReady = false;
    this.error = '';
    this.initializeApp();
  }

  async initializeApp() {
    try {
      // Inicializar Firebase (detectar automáticamente emulador y configuración)
      await firebaseService.init();

      // Inicializar servicio de grupos (esperar a que esté listo)
      await grupoService.init();

      this.firebaseReady = true;

      // Verificar si hay sesión activa
      const session = sessionService.getSession();
      if (session) {
        console.log('Sesión encontrada:', session);
        // Verificar que el grupo aún existe
        const groupExists = await grupoService.groupExists(session.groupId);
        if (groupExists) {
          this.currentGroupId = session.groupId;
          this.currentPersonName = session.personName;
          this.currentView = 'personas-manager';
          sessionService.refreshSession();
        } else {
          // El grupo ya no existe, limpiar sesión
          sessionService.clearSession();
          this.currentView = 'grupo-selector';
        }
      } else {
        this.currentView = 'grupo-selector';
      }

    } catch (error) {
      console.error('Error inicializando Firebase:', error);
      this.error = 'Error inicializando la aplicación';
      this.currentView = 'error';
    }
  }

  handleCreateGroup() {
    const grupoSelector = this.shadowRoot.querySelector('grupo-selector');
    if (grupoSelector) {
      grupoSelector.setLoading(true);
    }

    grupoService.createGroup()
      .then(groupId => {
        this.currentGroupId = groupId;
        this.currentView = 'group-created';
      })
      .catch(error => {
        console.error('Error creando grupo:', error);
        if (grupoSelector) {
          grupoSelector.setError('No se pudo crear el grupo. Inténtalo de nuevo.');
        }
      });
  }

  async handleJoinGroup(e) {
    const { groupId, personName } = e.detail;
    const grupoSelector = this.shadowRoot.querySelector('grupo-selector');

    if (grupoSelector) {
      grupoSelector.setLoading(true);
    }

    try {
      // Intentar unirse al grupo
      const result = await grupoService.joinGroup(groupId, personName);
      this.currentGroupId = result.groupId;
      this.currentPersonName = result.personName;

      // Guardar sesión
      sessionService.saveSession(result.groupId, result.personName);

      this.currentView = 'personas-manager';
    } catch (error) {
      console.error('Error uniéndose al grupo:', error);

      // Si el usuario ya existe, permitir volver a entrar
      if (error.message.includes('Ya existe una persona con ese nombre')) {
        const confirmReentrar = await modalManager.confirm(
          'Usuario existente',
          `El nombre "${personName}" ya está en el grupo. ¿Quieres continuar con esta sesión?`,
          'Continuar',
          'Cancelar'
        );

        if (confirmReentrar) {
          this.currentGroupId = groupId;
          this.currentPersonName = personName;

          // Guardar sesión
          sessionService.saveSession(groupId, personName);

          this.currentView = 'personas-manager';
        }
      } else if (grupoSelector) {
        grupoSelector.setError(error.message);
      }
    }
  }

  handleBackToSelector() {
    // No limpiar la sesión aquí, solo cuando el usuario explícitamente salga
    this.currentView = 'grupo-selector';
    this.currentGroupId = '';
    this.currentPersonName = '';
  }

  async handleGroupReady() {
    // Cuando alguien se une al grupo creado, ir al manager
    // Primero necesitamos registrar a la persona en el grupo
    console.log('handleGroupReady llamado con:', this.currentPersonName, this.currentGroupId);

    if (this.currentPersonName && this.currentGroupId) {
      try {
        await grupoService.joinGroup(this.currentGroupId, this.currentPersonName);
        console.log('Unido al grupo exitosamente');

        // Guardar sesión
        sessionService.saveSession(this.currentGroupId, this.currentPersonName);

        this.currentView = 'personas-manager';
      } catch (error) {
        console.error('Error uniéndose al grupo propio:', error);
        await modalManager.info('Error', error.message || 'No se pudo unir al grupo. Inténtalo de nuevo.');
      }
    } else {
      console.error('Faltan datos:', { name: this.currentPersonName, id: this.currentGroupId });
    }
  }

  connectedCallback() {
    super.connectedCallback();

    // Inicializar el sistema de modales
    if (!document.querySelector('modal-system')) {
      const modalElement = document.createElement('modal-system');
      document.body.appendChild(modalElement);
    }

    // Escuchar eventos del DOM
    this.addEventListener('create-group', this.handleCreateGroup);
    this.addEventListener('join-group', this.handleJoinGroup);
    this.addEventListener('back-to-selector', this.handleBackToSelector);
    this.addEventListener('group-ready', this.handleGroupReady);
  }

  render() {
    if (this.error) {
      return html`
        <div class="error-banner">
          ${this.error}
        </div>
      `;
    }

    if (!this.firebaseReady) {
      return html`
        <div class="loading">
          <img src="/images/tomateanimado.gif" alt="Tómate un desayuno" height="64"/> Inicializando aplicación...
        </div>
      `;
    }

    switch (this.currentView) {
      case 'grupo-selector':
        return html`<grupo-selector></grupo-selector>`;

      case 'group-created':
        return html`
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
              <h1 style="color: #333; margin-bottom: 20px;">¡Grupo Creado!</h1>
              <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">ID del Grupo:</div>
                <div style="font-size: 32px; font-weight: bold; color: #4CAF50; font-family: monospace;">${this.currentGroupId}</div>
              </div>
              <p style="color: #666; margin-bottom: 30px;">Comparte este ID con tu grupo para que se unan</p>
              <button 
                @click=${async () => {
            await navigator.clipboard.writeText(this.currentGroupId);
            const btn = this.shadowRoot.querySelector('#copy-btn');
            const originalText = btn.textContent;
            btn.textContent = '✅ ¡Copiado!';
            btn.style.background = '#27ae60';
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.background = '#4CAF50';
            }, 2000);
          }}
                id="copy-btn"
                style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-right: 10px; transition: all 0.3s;"
              >
                📋 Copiar ID
              </button>
              <button 
                @click=${async () => {
            console.log('Botón continuar clickeado');
            const personName = await modalManager.prompt(
              'Unirse al Grupo',
              'Introduce tu nombre para unirte al grupo:',
              'Tu nombre'
            );
            console.log('Nombre recibido:', personName);
            if (personName && personName.trim()) {
              this.currentPersonName = personName.trim();
              await this.handleGroupReady();
            }
          }}
                style="padding: 15px 30px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;"
              >
                Continuar
              </button>
            </div>
          </div>
        `;

      case 'personas-manager':
        return html`
          <personas-manager-grupo 
            .groupId=${this.currentGroupId}
            .currentPersonName=${this.currentPersonName}
          ></personas-manager-grupo>
        `;

      default:
        return html`
          <div class="loading">
            Cargando...
          </div>
        `;
    }
  }
}

customElements.define('app-controller', AppController);