// Estructura de datos del menú del bar

export const DESAYUNO_1 = [
  'Croissant',
  'Napolitana de chocolate',
  'Napolitana de crema',
  'Donut de chocolate',
  'Donut de azúcar',
  'Palmera de chocolate',
  'Palmera de azúcar',
  'Porras (2 uds)',
  'Churros (3 uds)',
  'Pincho de tortilla de patatas'
];

export const TIPOS_BARRITA = [
  'Super barrita',
  'Chapata',
  'Integral',
  'Mollete',
  'Multisemillas',
  'Centeno',
  'Pan de molde'
];

export const SUPLEMENTOS_BARRITA = {
  'Jamón York': 1.30,
  'Queso': 1.30,
  'Pavo': 1.30,
  'Jamón Serrano': 1.50,
  'Guacamole': 0.80
};

export const DESAYUNO_2 = [
  'Tostadas sin gluten',
  'Croissant a la plancha',
  'Croissant mixto (+0.30€)',
  'Sandwich J.York y queso',
  'Sandwich de pollo desmechado',
  'Montado de J.York y queso',
  'Montado de J.Serrano (+0.30€/tomate)',
  'Montado de salchichón cular',
  'Montado de chorizo cular',
  'Montado de pavo',
  'Montado tortilla de patatas',
  'Montado de bacon a la plancha (+0.30€ si es con queso)'
];

export const BEBIDAS_COMBO = {
  'Café': 3.30,
  'Infusión': 3.30,
  'Cola-cao': 3.50,
  'Refresco': 4.00,
  'Cerveza 1/5': 4.30,
  'Cerveza botellín': 4.30
};

// Opciones de preparación del café
export const OPCIONES_CAFE = [
  'Café con leche',
  'Cortado', 
  'Café solo',
  'Café solo con hielo',
  'Café con leche sin lactosa',
  'Café con leche de avena',
  'Café con leche de almendras'
];

// Opciones de preparación para panes/barritas
export const OPCIONES_PAN = [
  'Con tomate y aceite',
  'Con aceite',
  'Con mermelada y mantequilla'
];

// Productos que pueden tener opciones de preparación
export const PRODUCTOS_CON_PREPARACION = [
  ...TIPOS_BARRITA,
  'Tostadas sin gluten'
];

export const SUPLEMENTO_ZUMO = {
  'Zumo de naranja natural': 1.50
};

// Productos con suplemento directo incluido en el nombre
export const SUPLEMENTOS_ESPECIALES = {
  'Croissant mixto': 0.30,
  'Montado de J.Serrano con tomate': 0.30,
  'Montado de bacon a la plancha con queso': 0.30
};

// Categorías para organizar mejor la UI
export const CATEGORIAS = {
  desayuno1: 'Desayuno 1 - Bollería y más',
  barritas: 'Barritas de pan',
  desayuno2: 'Desayuno 2 - Tostadas y montados',
  bebidas: 'Bebidas',
  suplementos: 'Suplementos'
};

// Función helper para obtener todos los productos del Desayuno 1 incluyendo barritas
export function getProductosDesayuno1() {
  return [...DESAYUNO_1, ...TIPOS_BARRITA];
}

// Función para verificar si un producto es válido para combo
export function esProductoCombinable(producto) {
  return DESAYUNO_1.includes(producto) || 
         TIPOS_BARRITA.includes(producto) || 
         DESAYUNO_2.includes(producto);
}

// Función para calcular la combinación más económica de TODOS los productos del grupo
export function calcularPrecioOptimo(todosLosItems) {
  if (!todosLosItems || todosLosItems.length === 0) {
    return { total: '0.00', combosUsados: [], itemsSueltos: [] };
  }
  
  // Separar productos y bebidas combinables
  const productosCombo = [];
  const bebidasCombo = [];
  const itemsNoCombinable = [];
  let suplementosTotal = 0;
  const suplementosDetalle = [];
  
  todosLosItems.forEach(item => {
    if (esProductoCombinable(item.producto)) {
      productosCombo.push(item);
    } else if (BEBIDAS_COMBO.hasOwnProperty(item.producto)) {
      bebidasCombo.push(item);
    } else if (item.producto === 'Zumo de naranja natural') {
      // El zumo es un SUPLEMENTO, no un item suelto
      suplementosTotal += SUPLEMENTO_ZUMO['Zumo de naranja natural'];
      suplementosDetalle.push(item.producto);
    } else {
      itemsNoCombinable.push(item);
    }
    
    // Calcular suplementos adicionales (solo si el producto puede llevar suplementos)
    if (item.suplementos && TIPOS_BARRITA.includes(item.producto)) {
      // Solo los tipos de barrita pueden llevar suplementos de barrita
      item.suplementos.forEach(sup => {
        if (SUPLEMENTOS_BARRITA[sup]) {
          suplementosTotal += SUPLEMENTOS_BARRITA[sup];
          suplementosDetalle.push(`${sup} (con ${item.producto})`);
        }
      });
    }
    
    if (SUPLEMENTOS_ESPECIALES[item.producto]) {
      suplementosTotal += SUPLEMENTOS_ESPECIALES[item.producto];
      suplementosDetalle.push(`${item.producto} (suplemento especial)`);
    }
  });
  
  // Distribuir suplementos de forma inteligente entre los combos
  const combinacionesFinales = [];
  const numCombos = Math.min(productosCombo.length, bebidasCombo.length);
  
  // Contar zumos disponibles para distribuir
  let zumosDisponibles = todosLosItems.filter(item => item.producto === 'Zumo de naranja natural').length;
  
  // Ordenar productos para priorizar los que tienen suplementos
  productosCombo.sort((a, b) => {
    const suplementosA = (a.suplementos && a.suplementos.length) || 0;
    const suplementosB = (b.suplementos && b.suplementos.length) || 0;
    return suplementosB - suplementosA; // Productos con más suplementos primero
  });
  
  // Crear las combinaciones
  for (let i = 0; i < numCombos; i++) {
    const producto = productosCombo[i];
    const bebida = bebidasCombo[i];
    const precioBase = BEBIDAS_COMBO[bebida.producto];
    
    // Determinar el nombre de la bebida (si es café, usar el tipo específico)
    const nombreBebida = bebida.producto === 'Café' && bebida.opcionCafe ? 
      bebida.opcionCafe : bebida.producto;
    
    // Determinar el nombre del producto (si tiene preparación, incluirla)
    const nombreProducto = PRODUCTOS_CON_PREPARACION.includes(producto.producto) && producto.opcionPan ?
      `${producto.producto} ${producto.opcionPan}` : producto.producto;
    
    let combinacion = `${nombreBebida} + ${nombreProducto}`;
    let precioTotal = precioBase;
    
    
    // Añadir suplementos específicos de este producto (jamón, queso, etc.)
    if (producto.suplementos && TIPOS_BARRITA.includes(producto.producto)) {
      producto.suplementos.forEach(sup => {
        if (SUPLEMENTOS_BARRITA[sup]) {
          combinacion += ` + ${sup}`;
          precioTotal += SUPLEMENTOS_BARRITA[sup];
        }
      });
    }
    
    // Distribuir zumos (máximo 1 por combo)
    if (zumosDisponibles > 0) {
      combinacion += ` + Zumo de naranja natural`;
      precioTotal += SUPLEMENTO_ZUMO['Zumo de naranja natural'];
      zumosDisponibles--;
    }
    
    // Añadir suplementos especiales del producto
    if (SUPLEMENTOS_ESPECIALES[producto.producto]) {
      precioTotal += SUPLEMENTOS_ESPECIALES[producto.producto];
    }
    
    combinacionesFinales.push({
      descripcion: combinacion,
      precio: precioTotal.toFixed(2)
    });
  }
  
  // Items que no pudieron formar combo
  const itemsSobrantes = [];
  if (productosCombo.length > bebidasCombo.length) {
    for (let i = bebidasCombo.length; i < productosCombo.length; i++) {
      itemsSobrantes.push(productosCombo[i].producto);
    }
  }
  if (bebidasCombo.length > productosCombo.length) {
    for (let i = productosCombo.length; i < bebidasCombo.length; i++) {
      itemsSobrantes.push(bebidasCombo[i].producto);
    }
  }
  
  // Añadir items no combinables a los sobrantes
  itemsSobrantes.push(...itemsNoCombinable.map(item => item.producto));
  
  // Añadir zumos sobrantes si los hay
  for (let i = 0; i < zumosDisponibles; i++) {
    itemsSobrantes.push('Zumo de naranja natural');
  }
  
  const totalFinal = combinacionesFinales.reduce((sum, combo) => sum + parseFloat(combo.precio), 0);
  
  return {
    total: totalFinal.toFixed(2),
    tieneCombo: combinacionesFinales.length > 0,
    combinacionesFinales: combinacionesFinales,
    itemsSueltos: itemsSobrantes
  };
}

// Función para calcular el precio de un pedido
export function calcularPrecioPedido(items) {
  let total = 0;
  let tieneCombo = false;
  let precioBebidaCombo = 0;
  let suplementos = 0;
  
  // Verificar si hay combo válido
  const productosCombo = items.filter(item => 
    esProductoCombinable(item.producto)
  );
  
  const bebidasCombo = items.filter(item => 
    BEBIDAS_COMBO.hasOwnProperty(item.producto)
  );
  
  if (productosCombo.length > 0 && bebidasCombo.length > 0) {
    // Hay combo válido
    tieneCombo = true;
    precioBebidaCombo = BEBIDAS_COMBO[bebidasCombo[0].producto];
    total = precioBebidaCombo;
    
    // Añadir suplementos
    items.forEach(item => {
      // Suplementos de barrita (solo si el producto es un tipo de barrita)
      if (item.suplementos && TIPOS_BARRITA.includes(item.producto)) {
        item.suplementos.forEach(sup => {
          if (SUPLEMENTOS_BARRITA[sup]) {
            suplementos += SUPLEMENTOS_BARRITA[sup];
          }
        });
      }
      
      // Suplementos especiales del producto
      if (SUPLEMENTOS_ESPECIALES[item.producto]) {
        suplementos += SUPLEMENTOS_ESPECIALES[item.producto];
      }
      
      // Zumo de naranja
      if (item.producto === 'Zumo de naranja natural') {
        suplementos += SUPLEMENTO_ZUMO['Zumo de naranja natural'];
      }
    });
    
    total += suplementos;
  } else {
    // No hay combo, cobrar por separado
    // Esta parte requeriría precios individuales que no están en el fichero
    // Por ahora retornamos null para indicar que se debe cobrar por separado
    return {
      total: null,
      tieneCombo: false,
      mensaje: 'Se cobra por separado (precios individuales no especificados)'
    };
  }
  
  return {
    total: total.toFixed(2),
    tieneCombo: true,
    desglose: {
      combo: precioBebidaCombo.toFixed(2),
      suplementos: suplementos.toFixed(2)
    }
  };
}