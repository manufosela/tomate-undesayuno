import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './menu-selector.js';
import './grupo-resumen.js';
import './modal-system.js';
import { calcularPrecioPedido } from '../data/menu-data.js';
import { grupoService } from '../services/grupo-service.js';
import { modalManager } from './modal-system.js';
import { sessionService } from '../services/session-service.js';

export class PersonasManagerGrupo extends LitElement {
  static properties = {
    groupId: { type: String },
    currentPersonName: { type: String },
    groupData: { type: Object },
    loading: { type: Boolean },
    myItems: { type: Array }
  };

  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }

    .group-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .group-id {
      font-family: monospace;
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      background: #f0f0f0;
      padding: 10px 15px;
      border-radius: 6px;
    }

    .participants {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .participant {
      background: #e8f5e9;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
      border: 2px solid transparent;
    }

    .participant.current {
      background: #4CAF50;
      color: white;
    }

    .my-order-section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      margin: 20px 0;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-success {
      background: #4CAF50;
      color: white;
    }

    .btn-success:hover {
      background: #45a049;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #666;
      border: 2px solid #e0e0e0;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .results {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .person-result {
      padding: 15px;
      margin-bottom: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }

    .person-result h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .items-list {
      margin: 10px 0;
      padding-left: 20px;
    }

    .price-info {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-weight: bold;
      color: #4CAF50;
    }

    .total-section {
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      text-align: center;
    }

    .total-amount {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #667eea;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-ordering {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-completed {
      background: #e3f2fd;
      color: #1976d2;
    }

    .status-paid {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    @media (max-width: 768px) {
      :host {
        padding: 15px;
      }

      .header {
        padding: 20px 15px;
        margin-bottom: 20px;
        position: relative;
      }

      .header h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }

      .header button {
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        padding: 6px 12px !important;
        font-size: 12px !important;
      }

      .group-info {
        flex-direction: column;
        text-align: center;
        padding: 15px;
        gap: 12px;
      }

      .group-id {
        font-size: 16px;
        padding: 8px 12px;
      }

      .participants {
        justify-content: center;
      }

      .participant {
        padding: 6px 10px;
        font-size: 13px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 10px;
        margin: 15px 0;
      }

      .btn {
        width: 100%;
        justify-content: center;
        padding: 12px 20px;
        font-size: 15px;
      }

      .my-order-section {
        padding: 15px;
        margin-bottom: 15px;
      }

      .section-title {
        font-size: 20px;
        margin-bottom: 15px;
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 10px;
      }

      .header {
        padding: 15px 10px;
        margin-bottom: 15px;
      }

      .header h1 {
        font-size: 20px;
      }

      .header p {
        font-size: 14px;
        margin: 5px 0;
      }

      .header button {
        top: 8px !important;
        right: 8px !important;
        padding: 4px 8px !important;
        font-size: 11px !important;
      }

      .group-info {
        padding: 12px;
        gap: 10px;
      }

      .group-id {
        font-size: 14px;
        padding: 6px 10px;
      }

      .participant {
        padding: 4px 8px;
        font-size: 12px;
      }

      .btn {
        padding: 10px 15px;
        font-size: 14px;
      }

      .my-order-section {
        padding: 12px;
      }

      .section-title {
        font-size: 18px;
        margin-bottom: 12px;
      }

      .status-badge {
        padding: 4px 8px;
        font-size: 10px;
      }
    }
  `;

  constructor() {
    super();
    this.groupId = '';
    this.currentPersonName = '';
    this.groupData = null;
    this.loading = false;
    this.myItems = [];
    this.groupListener = null;
    this._isUpdatingFromLocal = false; // Flag para evitar conflictos
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.groupId) {
      this.subscribeToGroup();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.groupListener) {
      this.groupListener();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('groupId') && this.groupId) {
      this.subscribeToGroup();
    }
  }

  async subscribeToGroup() {
    if (this.groupListener) {
      this.groupListener();
    }

    try {
      this.groupListener = await grupoService.onGroupChange(this.groupId, (snapshot) => {
        if (snapshot.exists()) {
          this.groupData = snapshot.val();

          // Solo actualizar items si no estamos actualizando localmente
          if (!this._isUpdatingFromLocal) {
            // Cargar mis items si existen
            if (this.groupData.personas && this.groupData.personas[this.currentPersonName]) {
              const personData = this.groupData.personas[this.currentPersonName];
              // Convertir a array si viene como objeto de Firebase
              if (personData.items) {
                if (Array.isArray(personData.items)) {
                  this.myItems = [...personData.items];
                } else {
                  this.myItems = Object.values(personData.items);
                }
              } else {
                this.myItems = [];
              }
            } else {
              this.myItems = [];
            }
          }
        } else {
          // El grupo no existe o ha sido eliminado
          this.dispatchEvent(new CustomEvent('group-deleted', {
            bubbles: true,
            composed: true
          }));
        }
      });
    } catch (error) {
      console.error('Error suscribiendo al grupo:', error);
    }
  }

  handleItemsChanged(e) {
    const { items } = e.detail;
    console.log('Items cambiados localmente:', items);

    // Marcar que estamos actualizando localmente
    this._isUpdatingFromLocal = true;

    // Actualizar estado local inmediatamente
    this.myItems = [...items];

    // Actualizar en Firebase (sin esperar, para no bloquear la UI)
    grupoService.updatePersonOrder(this.groupId, this.currentPersonName, items)
      .then(() => {
        // Esperar un poco antes de permitir actualizaciones de Firebase de nuevo
        setTimeout(() => {
          this._isUpdatingFromLocal = false;
        }, 1000);
      })
      .catch(error => {
        console.error('Error actualizando pedido:', error);
        this._isUpdatingFromLocal = false;
      });
  }


  calcularTotal() {
    if (!this.groupData || !this.groupData.personas) return '0.00';

    let total = 0;
    Object.values(this.groupData.personas).forEach(persona => {
      if (persona.items) {
        const items = Object.values(persona.items);
        const resultado = calcularPrecioPedido(items);
        if (resultado.total) {
          total += parseFloat(resultado.total);
        }
      }
    });
    return total.toFixed(2);
  }

  async cambiarEstadoGrupo(nuevoEstado) {
    this.loading = true;
    try {
      await grupoService.changeGroupStatus(this.groupId, nuevoEstado);
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
    this.loading = false;
  }

  async handleLogout() {
    const confirmLogout = await modalManager.confirm(
      'Cerrar Sesión',
      '¿Quieres salir de este grupo? Podrás volver a entrar con el mismo nombre.',
      'Salir',
      'Cancelar'
    );

    if (confirmLogout) {
      sessionService.clearSession();
      // Volver a la pantalla de inicio
      this.dispatchEvent(new CustomEvent('back-to-selector', {
        bubbles: true,
        composed: true
      }));
    }
  }

  async copiarGroupId() {
    try {
      await navigator.clipboard.writeText(this.groupId);
      // Mostrar feedback visual
      const btn = this.shadowRoot.querySelector('.group-id');
      if (btn) {
        const originalText = btn.textContent;
        const originalBg = btn.style.background;
        const originalColor = btn.style.color;

        btn.textContent = '✅ ¡Copiado!';
        btn.style.background = '#4CAF50';
        btn.style.color = 'white';
        btn.style.transition = 'all 0.3s';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = originalBg || '#f0f0f0';
          btn.style.color = originalColor || '#667eea';
        }, 2000);
      }
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      await modalManager.info('Error', 'No se pudo copiar el ID al portapapeles');
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div style="font-size: 60px; margin-bottom: 20px;">🍅</div>
          <p>Cargando grupo...</p>
        </div>
      `;
    }

    if (!this.groupData) {
      return html`
        <div class="loading">
          <div style="font-size: 60px; margin-bottom: 20px;">❌</div>
          <p>No se pudo cargar el grupo</p>
        </div>
      `;
    }

    const personas = this.groupData.personas ? Object.values(this.groupData.personas) : [];
    const isPaid = this.groupData.paid || false;

    return html`
      <div class="header">
        <h1><img src="/images/tomatelogo.png" alt="Tómate un desayuno" height="100"/> ${this.groupData.id}</h1>
        <p>Grupo de ${personas.length} persona${personas.length !== 1 ? 's' : ''}</p>
        <button 
          @click=${this.handleLogout}
          style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s;"
          onmouseover="this.style.background='rgba(255,255,255,0.3)'"
          onmouseout="this.style.background='rgba(255,255,255,0.2)'"
        >
          🚪 Salir
        </button>
      </div>

      <div class="group-info">
        <div>
          <div style="font-size: 14px; color: #666; margin-bottom: 5px;">ID del Grupo:</div>
          <div class="group-id" @click=${this.copiarGroupId} style="cursor: pointer;" title="Clic para copiar">
            ${this.groupId}
          </div>
        </div>
        
        ${this.groupData.paid ? html`
          <div>
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Estado:</div>
            <span class="status-badge status-paid">
              💰 Pagado
            </span>
          </div>
        ` : ''}

        <div>
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Participantes:</div>
          <div class="participants">
            ${personas.map(persona => html`
              <span class="participant ${persona.name === this.currentPersonName ? 'current' : ''}">
                ${persona.name}
              </span>
            `)}
          </div>
        </div>
      </div>

      <!-- Resumen del grupo en tiempo real -->
      <grupo-resumen .groupData=${this.groupData}></grupo-resumen>


      ${!isPaid ? html`
        <div class="my-order-section">
          <div class="section-title">
            <span>🍽️</span>
            Mi pedido (${this.currentPersonName})
          </div>
          
          <menu-selector
            .selectedItems=${this.myItems}
            .personName=${this.currentPersonName}
            @items-changed=${this.handleItemsChanged}
          ></menu-selector>
        </div>
      ` : ''}

      ${isPaid ? html`
        <div style="text-align: center; padding: 40px; background: #e8f5e9; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2e7d32; margin-bottom: 10px;">💰 Grupo Pagado</h2>
          <p style="color: #666;">Este grupo ya ha sido pagado y finalizado.</p>
        </div>
      ` : ''}

    `;
  }
}

customElements.define('personas-manager-grupo', PersonasManagerGrupo);