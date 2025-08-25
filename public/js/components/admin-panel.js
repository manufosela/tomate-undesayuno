import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { grupoService } from '../services/grupo-service.js';
import { calcularPrecioPedido } from '../data/menu-data.js';
import './modal-system.js';
import { modalManager } from './modal-system.js';

export class AdminPanel extends LitElement {
  static properties = {
    grupos: { type: Object },
    loading: { type: Boolean },
    selectedGroup: { type: String },
    showDetails: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .header {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
      position: relative;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }

    .back-btn {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .grupos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .grupo-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .grupo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .grupo-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .grupo-id {
      font-family: monospace;
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
    }

    .grupo-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-ordering {
      background: #fff3cd;
      color: #856404;
    }

    .status-completed {
      background: #cce7ff;
      color: #004085;
    }

    .status-paid {
      background: #e2e3e5;
      color: #383d41;
    }

    .grupo-body {
      padding: 20px;
    }

    .grupo-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .personas-count {
      color: #666;
    }

    .grupo-total {
      font-size: 20px;
      font-weight: bold;
      color: #27ae60;
      text-align: center;
      margin: 15px 0;
    }

    .grupo-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-success:hover {
      background: #229954;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .loading {
      text-align: center;
      padding: 60px;
      color: #3498db;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #ecf0f1;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 60px;
      color: #666;
    }

    .empty-state h3 {
      margin-bottom: 10px;
      color: #444;
    }

    .detail-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .detail-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #e74c3c;
    }

    .persona-detail {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .persona-name {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .items-list {
      margin: 10px 0;
      padding-left: 15px;
    }

    .items-list div {
      margin-bottom: 5px;
      font-size: 14px;
    }

    .price-detail {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #dee2e6;
      font-weight: bold;
      color: #27ae60;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .grupos-grid {
        grid-template-columns: 1fr;
      }
      
      .detail-modal {
        padding: 10px;
      }
      
      .detail-content {
        padding: 20px;
      }
    }
  `;

  constructor() {
    super();
    this.grupos = {};
    this.loading = true;
    this.selectedGroup = '';
    this.showDetails = false;
    this.autoRefreshInterval = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadGroups();
    
    // Auto-refresh cada 30 segundos
    this.autoRefreshInterval = setInterval(() => {
      this.loadGroups();
    }, 30000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  async loadGroups() {
    this.loading = true;
    try {
      this.grupos = await grupoService.getAllGroups();
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
    this.loading = false;
  }

  getStats() {
    const grupos = Object.values(this.grupos);
    const totalGrupos = grupos.length;
    const gruposActivos = grupos.filter(g => !g.paid).length;
    const totalFacturado = grupos.reduce((sum, grupo) => sum + (grupo.total || 0), 0);
    const personasTotal = grupos.reduce((sum, grupo) => {
      return sum + (grupo.personas ? Object.keys(grupo.personas).length : 0);
    }, 0);

    return {
      totalGrupos,
      gruposActivos,
      totalFacturado: totalFacturado.toFixed(2),
      personasTotal
    };
  }

  showGroupDetails(groupId) {
    this.selectedGroup = groupId;
    this.showDetails = true;
  }

  hideDetails() {
    this.showDetails = false;
    this.selectedGroup = '';
  }

  async markAsPaid(groupId) {
    const confirmed = await modalManager.confirm(
      'Marcar como Pagado',
      '¿Marcar este grupo como pagado? Esta acción cambiará el estado del grupo.',
      'Marcar Pagado',
      'Cancelar'
    );
    
    if (confirmed) {
      try {
        await grupoService.markGroupAsPaid(groupId);
        this.loadGroups();
        await modalManager.info('Éxito', 'El grupo ha sido marcado como pagado correctamente.');
      } catch (error) {
        console.error('Error marcando como pagado:', error);
        await modalManager.info('Error', 'No se pudo marcar el grupo como pagado. Inténtalo de nuevo.');
      }
    }
  }

  async deleteGroup(groupId) {
    const confirmed = await modalManager.confirm(
      'Eliminar Grupo',
      `¿Eliminar el grupo ${groupId}? Esta acción no se puede deshacer y eliminará todos los datos del grupo.`,
      'Eliminar',
      'Cancelar'
    );
    
    if (confirmed) {
      try {
        await grupoService.deleteGroup(groupId);
        this.loadGroups();
        await modalManager.info('Grupo Eliminado', 'El grupo ha sido eliminado correctamente.');
      } catch (error) {
        console.error('Error eliminando grupo:', error);
        await modalManager.info('Error', 'No se pudo eliminar el grupo. Inténtalo de nuevo.');
      }
    }
  }


  formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  }

  calcularTotalGrupo(grupo) {
    if (!grupo.personas) return '0.00';
    
    let total = 0;
    Object.values(grupo.personas).forEach(persona => {
      if (persona.items) {
        const items = Array.isArray(persona.items) ? persona.items : Object.values(persona.items);
        const resultado = calcularPrecioPedido(items);
        if (resultado.total) {
          total += parseFloat(resultado.total);
        }
      }
    });
    return total.toFixed(2);
  }

  render() {
    const stats = this.getStats();

    return html`
      <div class="header">
        <h1>🛠️ Panel de Administración</h1>
        <p>Gestión de grupos de desayunos</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.totalGrupos}</div>
          <div class="stat-label">Total Grupos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.gruposActivos}</div>
          <div class="stat-label">Grupos Activos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.personasTotal}</div>
          <div class="stat-label">Total Personas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.totalFacturado}€</div>
          <div class="stat-label">Total Facturado</div>
        </div>
      </div>

      ${this.loading ? html`
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando grupos...</p>
        </div>
      ` : Object.keys(this.grupos).length === 0 ? html`
        <div class="empty-state">
          <div style="font-size: 60px; margin-bottom: 20px;">📋</div>
          <h3>No hay grupos activos</h3>
          <p>Los grupos aparecerán aquí cuando se creen</p>
        </div>
      ` : html`
        <div class="grupos-grid">
          ${Object.entries(this.grupos).map(([id, grupo]) => {
            const personas = grupo.personas ? Object.values(grupo.personas) : [];
            const total = this.calcularTotalGrupo(grupo);
            
            return html`
              <div class="grupo-card">
                <div class="grupo-header">
                  <div class="grupo-id">${id}</div>
                  <span class="grupo-status status-${grupo.paid ? 'paid' : 'active'}">
                    ${grupo.paid ? '💰 Pagado' : '🍽️ Activo'}
                  </span>
                </div>
                
                <div class="grupo-body">
                  <div class="grupo-info">
                    <span class="personas-count">
                      👥 ${personas.length} persona${personas.length !== 1 ? 's' : ''}
                    </span>
                    <span>
                      🕐 ${this.formatTime(grupo.lastActivity)}
                    </span>
                  </div>
                  
                  <div class="grupo-total">${total}€</div>
                  
                  <div class="grupo-actions">
                    <button class="btn btn-primary btn-small" @click=${() => this.showGroupDetails(id)}>
                      👁️ Ver
                    </button>
                    
                    ${!grupo.paid ? html`
                      <button class="btn btn-success btn-small" @click=${() => this.markAsPaid(id)}>
                        💰 Pagado
                      </button>
                    ` : ''}
                    
                    <button class="btn btn-danger btn-small" @click=${() => this.deleteGroup(id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      `}

      ${this.showDetails && this.selectedGroup ? html`
        <div class="detail-modal" @click=${(e) => e.target === e.currentTarget ? this.hideDetails() : null}>
          <div class="detail-content">
            <div class="detail-header">
              <h2>Detalle: ${this.selectedGroup}</h2>
              <button class="close-btn" @click=${this.hideDetails}>×</button>
            </div>
            
            ${(() => {
              const grupo = this.grupos[this.selectedGroup];
              if (!grupo) return html`<p>Grupo no encontrado</p>`;
              
              const personas = grupo.personas ? Object.values(grupo.personas) : [];
              
              return html`
                <div>
                  <p><strong>Estado:</strong> 
                    <span class="grupo-status status-${grupo.paid ? 'paid' : 'active'}">
                      ${grupo.paid ? '💰 Pagado' : '🍽️ Activo'}
                    </span>
                  </p>
                  <p><strong>Creado:</strong> ${this.formatTime(grupo.createdAt)}</p>
                  <p><strong>Última actividad:</strong> ${this.formatTime(grupo.lastActivity)}</p>
                  
                  <h3>Pedidos (${personas.length} personas):</h3>
                  
                  ${personas.map(persona => {
                    const items = persona.items ? (Array.isArray(persona.items) ? persona.items : Object.values(persona.items)) : [];
                    const resultado = calcularPrecioPedido(items);
                    
                    return html`
                      <div class="persona-detail">
                        <div class="persona-name">${persona.name}</div>
                        ${items.length > 0 ? html`
                          <div class="items-list">
                            ${items.map(item => html`
                              <div>
                                • ${item.producto}
                                ${item.suplementos && item.suplementos.length > 0 ? 
                                  html` con ${item.suplementos.join(', ')}` : ''}
                              </div>
                            `)}
                          </div>
                          <div class="price-detail">
                            ${resultado.total ? html`
                              Total: ${resultado.total}€
                            ` : html`
                              <span style="color: #e74c3c;">${resultado.mensaje}</span>
                            `}
                          </div>
                        ` : html`
                          <p style="color: #666; font-style: italic;">Sin pedido</p>
                        `}
                      </div>
                    `;
                  })}
                  
                  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                    <h3>Total: ${this.calcularTotalGrupo(grupo)}€</h3>
                  </div>
                </div>
              `;
            })()}
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('admin-panel', AdminPanel);