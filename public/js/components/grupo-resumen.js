import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { calcularPrecioPedido, calcularPrecioOptimo, TIPOS_BARRITA, PRODUCTOS_CON_PREPARACION } from '../data/menu-data.js';

export class GrupoResumen extends LitElement {
  static properties = {
    groupData: { type: Object },
    isExpanded: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: 20px;
    }

    .resumen-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .resumen-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .resumen-header:hover {
      filter: brightness(1.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .toggle-icon {
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .header-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
    }

    .header-stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
      opacity: 0.9;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .resumen-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .resumen-body.expanded {
      max-height: 1000px;
    }

    .resumen-content {
      padding: 20px;
    }

    .personas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 15px;
      margin-bottom: 25px;
    }

    .persona-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      border-left: 4px solid #667eea;
    }

    .persona-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .persona-items {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .persona-total {
      font-weight: bold;
      color: #4CAF50;
      font-size: 16px;
    }

    .totales-section {
      background: #f0f8ff;
      border-radius: 8px;
      padding: 20px;
      border: 2px solid #e3f2fd;
    }

    .totales-title {
      font-size: 18px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }

    .producto-total {
      background: white;
      padding: 12px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .producto-nombre {
      font-size: 14px;
      color: #333;
      flex: 1;
    }

    .producto-cantidad {
      background: #667eea;
      color: white;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 14px;
      font-weight: bold;
      min-width: 30px;
      text-align: center;
    }

    .total-general {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      border: 2px solid #4CAF50;
    }

    .total-general h3 {
      margin: 0 0 5px 0;
      color: #2e7d32;
      font-size: 18px;
    }

    .total-amount {
      font-size: 32px;
      font-weight: bold;
      color: #4CAF50;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .empty-state h3 {
      margin-bottom: 10px;
      color: #666;
    }

    @media (max-width: 768px) {
      .resumen-container {
        margin-bottom: 15px;
      }

      .resumen-header {
        padding: 15px;
        flex-direction: column;
        gap: 10px;
        text-align: center;
      }

      .header-left {
        justify-content: center;
        gap: 10px;
      }

      .header-title {
        font-size: 16px;
      }

      .header-stats {
        flex-direction: row;
        gap: 15px;
        justify-content: center;
        font-size: 13px;
      }

      .resumen-content {
        padding: 15px;
      }

      .personas-grid {
        grid-template-columns: 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }

      .persona-card {
        padding: 12px;
      }

      .productos-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .producto-total {
        padding: 10px;
      }

      .totales-title {
        font-size: 16px;
        margin-bottom: 12px;
      }

      .total-general {
        padding: 12px;
      }

      .total-general h3 {
        font-size: 16px;
      }

      .total-amount {
        font-size: 28px;
      }
    }

    @media (max-width: 480px) {
      .resumen-header {
        padding: 12px;
        gap: 8px;
      }

      .header-title {
        font-size: 15px;
      }

      .header-stats {
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
      }

      .toggle-icon {
        font-size: 16px;
      }

      .resumen-content {
        padding: 12px;
      }

      .personas-grid {
        gap: 10px;
        margin-bottom: 15px;
      }

      .persona-card {
        padding: 10px;
      }

      .persona-name {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .persona-items {
        font-size: 13px;
        margin-bottom: 6px;
      }

      .persona-total {
        font-size: 15px;
      }

      .productos-grid {
        gap: 6px;
      }

      .producto-total {
        padding: 8px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .producto-nombre {
        font-size: 13px;
      }

      .producto-cantidad {
        padding: 2px 8px;
        font-size: 12px;
        align-self: flex-end;
      }

      .totales-title {
        font-size: 15px;
        margin-bottom: 10px;
      }

      .total-general {
        padding: 10px;
      }

      .total-general h3 {
        font-size: 15px;
      }

      .total-amount {
        font-size: 24px;
      }

      .empty-state {
        padding: 20px 15px;
      }

      .empty-state h3 {
        font-size: 16px;
      }

      .empty-state p {
        font-size: 14px;
      }
    }
  `;

  constructor() {
    super();
    this.groupData = null;
    this.isExpanded = true; // Expandido por defecto
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  getPersonasConPedidos() {
    if (!this.groupData || !this.groupData.personas) return [];
    
    return Object.values(this.groupData.personas).filter(persona => {
      const items = persona.items ? Object.values(persona.items) : [];
      return items.length > 0;
    });
  }

  calcularTotalGeneral() {
    // Recopilar TODOS los items del grupo
    const todosLosItems = [];
    const personas = this.getPersonasConPedidos();
    
    personas.forEach(persona => {
      const items = persona.items ? Object.values(persona.items) : [];
      todosLosItems.push(...items);
    });
    
    // Calcular el precio óptimo del grupo completo usando el algoritmo global
    const resultado = calcularPrecioOptimo(todosLosItems);
    return resultado.total || '0.00';
  }

  agruparProductos() {
    const personas = this.getPersonasConPedidos();
    const productos = {};
    
    personas.forEach(persona => {
      const items = persona.items ? Object.values(persona.items) : [];
      
      items.forEach(item => {
        let nombreCompleto = item.producto;
        
        // Añadir suplementos al nombre si los hay
        if (item.suplementos && item.suplementos.length > 0) {
          nombreCompleto += ` (con ${item.suplementos.join(', ')})`;
        }
        
        if (productos[nombreCompleto]) {
          productos[nombreCompleto]++;
        } else {
          productos[nombreCompleto] = 1;
        }
      });
    });
    
    // Convertir a array y ordenar por cantidad (mayor a menor)
    return Object.entries(productos)
      .sort(([,a], [,b]) => b - a)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));
  }

  calcularCombinacionesOptimas() {
    // Recopilar TODOS los items del grupo
    const todosLosItems = [];
    const personas = this.getPersonasConPedidos();
    
    personas.forEach(persona => {
      const items = persona.items ? Object.values(persona.items) : [];
      todosLosItems.push(...items);
    });
    
    if (todosLosItems.length === 0) return null;
    
    // Usar la nueva función de cálculo óptimo global
    const resultado = calcularPrecioOptimo(todosLosItems);
    
    return resultado;
  }

  formatearItems(items) {
    if (!items || items.length === 0) return 'Sin pedido';
    
    return items.map(item => {
      let texto = `• ${item.producto}`;
      if (item.suplementos && item.suplementos.length > 0) {
        texto += ` (${item.suplementos.join(', ')})`;
      }
      return texto;
    }).join('<br>');
  }

  formatearItemsTemplate(items) {
    if (!items || items.length === 0) {
      return html`<span style="color: #999; font-style: italic;">Sin pedido</span>`;
    }
    
    return items.map(item => {
      let texto = `• `;
      
      // Si es café, mostrar el tipo específico
      if (item.producto === 'Café' && item.opcionCafe) {
        texto += item.opcionCafe;
      } else if (PRODUCTOS_CON_PREPARACION.includes(item.producto) && item.opcionPan) {
        texto += `${item.producto} ${item.opcionPan}`;
      } else {
        texto += item.producto;
      }
      
      if (item.suplementos && item.suplementos.length > 0) {
        texto += ` (${item.suplementos.join(', ')})`;
      }
      return html`<div>${texto}</div>`;
    });
  }

  calcularTotalPersona(items) {
    const resultado = calcularPrecioPedido(items);
    return resultado.total || '0.00';
  }

  render() {
    if (!this.groupData) {
      return html`<div class="empty-state">Cargando resumen del grupo...</div>`;
    }

    const personas = this.getPersonasConPedidos();
    const totalGeneral = this.calcularTotalGeneral();
    const productosAgrupados = this.agruparProductos();
    const combinacionesOptimas = this.calcularCombinacionesOptimas();
    const totalPersonas = this.groupData.personas ? Object.keys(this.groupData.personas).length : 0;

    return html`
      <div class="resumen-container">
        <div class="resumen-header" @click=${this.toggleExpanded}>
          <div class="header-left">
            <span class="toggle-icon ${this.isExpanded ? 'expanded' : ''}">▼</span>
            <h2 class="header-title">📋 Resumen del Grupo</h2>
          </div>
          
          <div class="header-stats">
            <div class="stat-item">
              <span>👥</span>
              <span>${totalPersonas} persona${totalPersonas !== 1 ? 's' : ''}</span>
            </div>
            <div class="stat-item">
              <span>🛒</span>
              <span>${personas.length} con pedido</span>
            </div>
            <div class="stat-item">
              <span>💰</span>
              <span>${totalGeneral}€</span>
            </div>
          </div>
        </div>

        <div class="resumen-body ${this.isExpanded ? 'expanded' : ''}">
          <div class="resumen-content">
            ${personas.length === 0 ? html`
              <div class="empty-state">
                <h3>🤔 Aún no hay pedidos</h3>
                <p>Los pedidos aparecerán aquí cuando las personas seleccionen sus desayunos</p>
              </div>
            ` : html`
              <div class="personas-grid">
                ${personas.map(persona => {
                  const items = persona.items ? Object.values(persona.items) : [];
                  
                  return html`
                    <div class="persona-card">
                      <div class="persona-name">
                        <span>👤</span>
                        ${persona.name}
                      </div>
                      <div class="persona-items">
                        ${this.formatearItemsTemplate(items)}
                      </div>
                    </div>
                  `;
                })}
              </div>

              ${productosAgrupados.length > 0 ? html`
                <div class="totales-section">
                  <div class="totales-title">
                    <span>📊</span>
                    Productos Seleccionados
                  </div>
                  
                  <div class="productos-grid">
                    ${productosAgrupados.map(({ nombre, cantidad }) => html`
                      <div class="producto-total">
                        <span class="producto-nombre">${nombre}</span>
                        <span class="producto-cantidad">${cantidad}</span>
                      </div>
                    `)}
                  </div>

                  ${combinacionesOptimas && combinacionesOptimas.combinacionesFinales ? html`
                    <div style="margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #2196F3;">
                      <div style="font-weight: bold; color: #1976d2; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <span>🧮</span> Combinación Más Económica:
                      </div>
                      
                      ${combinacionesOptimas.combinacionesFinales.map(combo => html`
                        <div style="margin-bottom: 8px; font-size: 14px;">
                          <strong>${combo.descripcion}</strong> - ${combo.precio}€
                        </div>
                      `)}
                      
                      ${combinacionesOptimas.itemsSueltos && combinacionesOptimas.itemsSueltos.length > 0 ? html`
                        ${combinacionesOptimas.itemsSueltos.map(item => html`
                          <div style="margin-bottom: 8px; font-size: 14px; color: #666;">
                            <strong>${item}</strong> - precio individual
                          </div>
                        `)}
                      ` : ''}
                    </div>
                  ` : ''}
                  
                  <div class="total-general">
                    <h3>Total Óptimo del Grupo</h3>
                    <div class="total-amount">${totalGeneral}€</div>
                  </div>
                </div>
              ` : ''}
            `}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('grupo-resumen', GrupoResumen);