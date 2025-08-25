import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './menu-selector.js';
import { calcularPrecioPedido } from '../data/menu-data.js';
import { grupoService } from '../services/grupo-service.js';

export class PersonasManager extends LitElement {
  static properties = {
    groupId: { type: String },
    currentPersonName: { type: String },
    groupData: { type: Object },
    showResults: { type: Boolean },
    loading: { type: Boolean }
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

    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }

    .personas-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .person-tab {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .person-tab:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .person-tab.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .person-tab .remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f44336;
      color: white;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .add-person-btn {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
    }

    .add-person-btn:hover {
      background: #45a049;
    }

    .person-name-input {
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 16px;
      margin-right: 10px;
    }

    .person-name-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .content-area {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      min-height: 400px;
    }

    .calculate-btn {
      margin: 30px auto;
      display: block;
      padding: 15px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .calculate-btn:hover {
      transform: scale(1.05);
    }

    .results {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .results h2 {
      color: #667eea;
      margin-top: 0;
    }

    .person-result {
      padding: 15px;
      margin-bottom: 15px;
      background: #f5f5f5;
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

    .total-section h2 {
      margin: 0;
      font-size: 24px;
    }

    .total-amount {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-state h3 {
      color: #666;
    }
  `;

  constructor() {
    super();
    this.personas = [];
    this.activePersonIndex = -1;
    this.showResults = false;
  }

  addPerson() {
    const name = prompt('Nombre de la persona:');
    if (!name) return;
    
    this.personas = [...this.personas, {
      name: name,
      items: []
    }];
    
    this.activePersonIndex = this.personas.length - 1;
  }

  removePerson(index) {
    this.personas = this.personas.filter((_, i) => i !== index);
    if (this.activePersonIndex >= this.personas.length) {
      this.activePersonIndex = this.personas.length - 1;
    }
  }

  selectPerson(index) {
    this.activePersonIndex = index;
    this.showResults = false;
  }

  handleItemsChanged(e, personIndex) {
    const { items } = e.detail;
    this.personas[personIndex].items = items;
    this.personas = [...this.personas];
  }

  calcularCuentas() {
    this.showResults = true;
  }

  calcularTotal() {
    let total = 0;
    this.personas.forEach(persona => {
      const resultado = calcularPrecioPedido(persona.items);
      if (resultado.total) {
        total += parseFloat(resultado.total);
      }
    });
    return total.toFixed(2);
  }

  render() {
    return html`
      <div class="header">
        <h1>🍳 Calculadora de Desayunos</h1>
        <p>Gestiona los pedidos de cada persona y calcula la cuenta total</p>
      </div>

      <div class="personas-tabs">
        ${this.personas.map((persona, index) => html`
          <div 
            class="person-tab ${index === this.activePersonIndex ? 'active' : ''}"
            @click=${() => this.selectPerson(index)}
          >
            ${persona.name}
            ${persona.items.length > 0 ? html`<span> (${persona.items.length})</span>` : ''}
            <span class="remove-btn" @click=${(e) => {
              e.stopPropagation();
              this.removePerson(index);
            }}>×</span>
          </div>
        `)}
        <button class="add-person-btn" @click=${this.addPerson}>
          + Añadir Persona
        </button>
      </div>

      <div class="content-area">
        ${this.activePersonIndex >= 0 && !this.showResults ? html`
          <h2>Pedido de ${this.personas[this.activePersonIndex].name}</h2>
          <menu-selector
            .selectedItems=${this.personas[this.activePersonIndex].items}
            .personName=${this.personas[this.activePersonIndex].name}
            @items-changed=${(e) => this.handleItemsChanged(e, this.activePersonIndex)}
          ></menu-selector>
        ` : ''}

        ${this.activePersonIndex === -1 && !this.showResults ? html`
          <div class="empty-state">
            <h3>👋 ¡Bienvenido!</h3>
            <p>Añade personas para empezar a gestionar los pedidos</p>
          </div>
        ` : ''}

        ${this.showResults ? html`
          <div class="results">
            <h2>📋 Resumen de Pedidos</h2>
            ${this.personas.map(persona => {
              const resultado = calcularPrecioPedido(persona.items);
              return html`
                <div class="person-result">
                  <h3>${persona.name}</h3>
                  ${persona.items.length > 0 ? html`
                    <div class="items-list">
                      ${persona.items.map(item => html`
                        <div>
                          • ${item.producto}
                          ${item.suplementos && item.suplementos.length > 0 ? 
                            html` con ${item.suplementos.join(', ')}` : ''}
                        </div>
                      `)}
                    </div>
                    <div class="price-info">
                      ${resultado.total ? html`
                        Total: ${resultado.total}€
                        ${resultado.desglose ? html`
                          <br>
                          <small>(Combo: ${resultado.desglose.combo}€ + Suplementos: ${resultado.desglose.suplementos}€)</small>
                        ` : ''}
                      ` : html`
                        <span style="color: #f44336;">${resultado.mensaje}</span>
                      `}
                    </div>
                  ` : html`
                    <p style="color: #999;">Sin pedido</p>
                  `}
                </div>
              `;
            })}
            
            <div class="total-section">
              <h2>Total General</h2>
              <div class="total-amount">${this.calcularTotal()}€</div>
            </div>
          </div>
        ` : ''}
      </div>

      ${this.personas.length > 0 && !this.showResults ? html`
        <button class="calculate-btn" @click=${this.calcularCuentas}>
          Calcular Cuentas 🧮
        </button>
      ` : ''}

      ${this.showResults ? html`
        <button class="calculate-btn" @click=${() => this.showResults = false}>
          ← Volver a los Pedidos
        </button>
      ` : ''}
    `;
  }
}

customElements.define('personas-manager', PersonasManager);