import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { 
  DESAYUNO_1, 
  DESAYUNO_2, 
  TIPOS_BARRITA, 
  SUPLEMENTOS_BARRITA,
  BEBIDAS_COMBO,
  SUPLEMENTO_ZUMO,
  CATEGORIAS,
  OPCIONES_CAFE,
  OPCIONES_PAN,
  PRODUCTOS_CON_PREPARACION
} from '../data/menu-data.js';

export class MenuSelector extends LitElement {
  static properties = {
    selectedItems: { type: Array },
    personName: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .category {
      margin-bottom: 30px;
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .category-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }

    .item-button {
      padding: 12px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-button:hover {
      border-color: #4CAF50;
      background: #f9f9f9;
    }

    .item-button.selected {
      background: #4CAF50;
      color: white;
      border-color: #45a049;
    }

    .suplementos-section {
      margin-top: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .cafe-options-section {
      margin-top: 15px;
      padding: 15px;
      background: #f0f8ff;
      border-radius: 6px;
      border-left: 4px solid #2196F3;
    }

    .cafe-option {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .cafe-option input[type="radio"] {
      margin-right: 8px;
      transform: scale(1.1);
    }

    .pan-options-section {
      margin-top: 15px;
      padding: 15px;
      background: #fff8dc;
      border-radius: 6px;
      border-left: 4px solid #daa520;
    }

    .pan-option {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .pan-option input[type="radio"] {
      margin-right: 8px;
      transform: scale(1.1);
    }

    .suplemento-checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .suplemento-checkbox input {
      margin-right: 10px;
    }

    .suplemento-checkbox label {
      cursor: pointer;
    }

    .price-tag {
      color: #666;
      font-size: 12px;
      margin-left: 5px;
    }

    .selected-items {
      margin-top: 20px;
      padding: 15px;
      background: #e8f5e9;
      border-radius: 6px;
    }

    .selected-items h3 {
      margin-top: 0;
      color: #2e7d32;
    }

    .selected-item {
      padding: 5px 0;
      border-bottom: 1px solid #c8e6c9;
    }

    .remove-button {
      background: #f44336;
      color: white;
      border: none;
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
      font-size: 12px;
    }

    .remove-button:hover {
      background: #d32f2f;
    }

    /* Media queries para responsive design */
    @media (max-width: 768px) {
      :host {
        padding: 15px;
      }

      .items-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px;
      }

      .category {
        padding: 12px;
        margin-bottom: 20px;
      }

      .category-title {
        font-size: 16px;
        margin-bottom: 12px;
      }

      .item-button {
        padding: 10px 8px;
        font-size: 13px;
        min-height: 44px;
      }

      .cafe-options-section,
      .pan-options-section {
        padding: 12px;
        margin-top: 12px;
      }

      .suplementos-section {
        padding: 12px;
        margin-top: 15px;
      }

      .selected-items {
        padding: 12px;
        margin-top: 15px;
      }

      .remove-button {
        padding: 4px 8px;
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 10px;
      }

      .items-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 6px;
      }

      .category {
        padding: 10px;
        margin-bottom: 15px;
      }

      .category-title {
        font-size: 15px;
        margin-bottom: 10px;
      }

      .item-button {
        padding: 8px 6px;
        font-size: 12px;
        min-height: 40px;
      }

      .price-tag {
        display: block;
        margin-top: 2px;
        font-size: 10px;
      }

      .cafe-option,
      .pan-option {
        font-size: 13px;
        margin-bottom: 6px;
      }

      .suplemento-checkbox {
        margin-bottom: 6px;
      }

      .suplemento-checkbox label {
        font-size: 13px;
      }

      .selected-item {
        font-size: 13px;
        padding: 8px 0;
      }
    }
  `;

  constructor() {
    super();
    this.selectedItems = [];
    this.personName = '';
  }

  toggleItem(producto, categoria) {
    console.log('Toggle item:', producto, categoria);
    const index = this.selectedItems.findIndex(item => 
      item.producto === producto && item.categoria === categoria
    );
    
    if (index === -1) {
      // Añadir item
      const newItem = {
        producto,
        categoria,
        suplementos: []
      };
      
      // Si es café, añadir la opción por defecto
      if (producto === 'Café') {
        newItem.opcionCafe = 'Café con leche';
      }
      
      // Si es un producto con preparación, añadir la opción por defecto
      if (PRODUCTOS_CON_PREPARACION.includes(producto)) {
        newItem.opcionPan = 'Con tomate y aceite';
      }
      
      this.selectedItems = [...this.selectedItems, newItem];
      console.log('Item añadido:', producto);
    } else {
      // Quitar item
      this.selectedItems = this.selectedItems.filter((_, i) => i !== index);
      console.log('Item quitado:', producto);
    }
    
    console.log('Items actuales:', this.selectedItems);
    this.requestUpdate();
    
    this.dispatchEvent(new CustomEvent('items-changed', {
      detail: { items: this.selectedItems, person: this.personName }
    }));
  }

  toggleSuplemento(producto, suplemento) {
    const item = this.selectedItems.find(i => i.producto === producto);
    if (!item) return;
    
    // Asegurar que suplementos existe
    if (!item.suplementos) {
      item.suplementos = [];
    }
    
    const index = item.suplementos.indexOf(suplemento);
    if (index === -1) {
      item.suplementos.push(suplemento);
    } else {
      item.suplementos.splice(index, 1);
    }
    
    this.selectedItems = [...this.selectedItems];
    this.dispatchEvent(new CustomEvent('items-changed', {
      detail: { items: this.selectedItems, person: this.personName }
    }));
  }

  isItemSelected(producto) {
    return this.selectedItems.some(item => item.producto === producto);
  }

  isSupplementoSelected(producto, suplemento) {
    const item = this.selectedItems.find(i => i.producto === producto);
    return item && item.suplementos && item.suplementos.includes(suplemento);
  }

  changeOpcionCafe(opcion) {
    const cafeIndex = this.selectedItems.findIndex(item => item.producto === 'Café');
    if (cafeIndex !== -1) {
      this.selectedItems[cafeIndex].opcionCafe = opcion;
      this.selectedItems = [...this.selectedItems];
      this.dispatchEvent(new CustomEvent('items-changed', {
        detail: { items: this.selectedItems, person: this.personName }
      }));
    }
  }

  getOpcionCafeSelected() {
    const cafeItem = this.selectedItems.find(item => item.producto === 'Café');
    return cafeItem ? cafeItem.opcionCafe : 'Café con leche';
  }

  changeOpcionPan(producto, opcion) {
    const panIndex = this.selectedItems.findIndex(item => item.producto === producto);
    if (panIndex !== -1) {
      this.selectedItems[panIndex].opcionPan = opcion;
      this.selectedItems = [...this.selectedItems];
      this.dispatchEvent(new CustomEvent('items-changed', {
        detail: { items: this.selectedItems, person: this.personName }
      }));
    }
  }

  getOpcionPanSelected(producto) {
    const panItem = this.selectedItems.find(item => item.producto === producto);
    return panItem ? panItem.opcionPan : 'Con tomate y aceite';
  }

  removeItem(index) {
    this.selectedItems = this.selectedItems.filter((_, i) => i !== index);
    this.dispatchEvent(new CustomEvent('items-changed', {
      detail: { items: this.selectedItems, person: this.personName }
    }));
  }

  renderCategory(title, items, categoryKey) {
    return html`
      <div class="category">
        <div class="category-title">${title}</div>
        <div class="items-grid">
          ${items.map(item => html`
            <button 
              class="item-button ${this.isItemSelected(item) ? 'selected' : ''}"
              @click=${() => this.toggleItem(item, categoryKey)}
            >
              ${item}
            </button>
          `)}
        </div>
        
        ${(categoryKey === 'barritas' || categoryKey === 'desayuno2') && this.selectedItems.some(i => PRODUCTOS_CON_PREPARACION.includes(i.producto)) ? html`
          <!-- Opciones de preparación del pan -->
          ${this.selectedItems.filter(i => PRODUCTOS_CON_PREPARACION.includes(i.producto)).map(item => html`
            <div class="pan-options-section">
              <div style="font-weight: bold; margin-bottom: 10px;">Preparación de ${item.producto}:</div>
              ${OPCIONES_PAN.map(opcion => html`
                <div class="pan-option">
                  <input 
                    type="radio" 
                    id="${item.producto}-${opcion.replace(/\s+/g, '-')}"
                    name="pan-option-${item.producto}"
                    ?checked=${this.getOpcionPanSelected(item.producto) === opcion}
                    @change=${() => this.changeOpcionPan(item.producto, opcion)}
                  />
                  <label for="${item.producto}-${opcion.replace(/\s+/g, '-')}">
                    ${opcion}
                  </label>
                </div>
              `)}
            </div>
          `)}
          
          ${categoryKey === 'barritas' && this.selectedItems.some(i => TIPOS_BARRITA.includes(i.producto)) ? html`
            <div class="suplementos-section">
              <div style="font-weight: bold; margin-bottom: 10px;">Suplementos para barrita:</div>
              ${Object.entries(SUPLEMENTOS_BARRITA).map(([sup, precio]) => {
                const barrita = this.selectedItems.find(i => TIPOS_BARRITA.includes(i.producto));
                return barrita ? html`
                  <div class="suplemento-checkbox">
                    <input 
                      type="checkbox" 
                      id="${sup}"
                      ?checked=${this.isSupplementoSelected(barrita.producto, sup)}
                      @change=${() => this.toggleSuplemento(barrita.producto, sup)}
                    />
                    <label for="${sup}">
                      ${sup} <span class="price-tag">(+${precio}€)</span>
                    </label>
                  </div>
                ` : '';
              })}
            </div>
          ` : ''}
        ` : ''}
      </div>
    `;
  }

  render() {
    return html`
      ${this.renderCategory(CATEGORIAS.desayuno1, DESAYUNO_1, 'desayuno1')}
      ${this.renderCategory('Barritas de Pan', TIPOS_BARRITA, 'barritas')}
      ${this.renderCategory(CATEGORIAS.desayuno2, DESAYUNO_2, 'desayuno2')}
      
      <div class="category">
        <div class="category-title">Bebidas</div>
        <div class="items-grid">
          ${Object.entries(BEBIDAS_COMBO).map(([bebida, precio]) => html`
            <button 
              class="item-button ${this.isItemSelected(bebida) ? 'selected' : ''}"
              @click=${() => this.toggleItem(bebida, 'bebidas')}
            >
              ${bebida} <span class="price-tag">(${precio}€)</span>
            </button>
          `)}
        </div>
        
        ${this.isItemSelected('Café') ? html`
          <div class="cafe-options-section">
            <div style="font-weight: bold; margin-bottom: 10px;">Tipo de café:</div>
            ${OPCIONES_CAFE.map(opcion => html`
              <div class="cafe-option">
                <input 
                  type="radio" 
                  id="${opcion.replace(/\s+/g, '-')}"
                  name="cafe-option"
                  ?checked=${this.getOpcionCafeSelected() === opcion}
                  @change=${() => this.changeOpcionCafe(opcion)}
                />
                <label for="${opcion.replace(/\s+/g, '-')}">
                  ${opcion}
                </label>
              </div>
            `)}
          </div>
        ` : ''}
      </div>
      
      <div class="category">
        <div class="category-title">Extras</div>
        <div class="items-grid">
          <button 
            class="item-button ${this.isItemSelected('Zumo de naranja natural') ? 'selected' : ''}"
            @click=${() => this.toggleItem('Zumo de naranja natural', 'extras')}
          >
            Zumo de naranja natural <span class="price-tag">(+1.50€)</span>
          </button>
        </div>
      </div>
      
      ${this.selectedItems.length > 0 ? html`
        <div class="selected-items">
          <h3>Selección actual:</h3>
          ${this.selectedItems.map((item, index) => html`
            <div class="selected-item">
              ${item.producto === 'Café' ? 
                item.opcionCafe || 'Café con leche' : 
                PRODUCTOS_CON_PREPARACION.includes(item.producto) ? 
                  `${item.producto} ${item.opcionPan || 'Con tomate y aceite'}` : 
                  item.producto
              }
              ${item.suplementos && item.suplementos.length > 0 ? html`
                <span> con: ${item.suplementos.join(', ')}</span>
              ` : ''}
              <button class="remove-button" @click=${() => this.removeItem(index)}>
                Quitar
              </button>
            </div>
          `)}
        </div>
      ` : ''}
    `;
  }
}

customElements.define('menu-selector', MenuSelector);