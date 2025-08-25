import { firebaseService } from './firebase-service.js';

class GrupoService {
  constructor() {
    this.database = null;
    this.activeGroupCleanupTimers = new Map();
  }

  async init() {
    // Esperar a que Firebase esté inicializado
    await this.ensureFirebaseReady();
    this.database = firebaseService.getDatabase();
  }

  async ensureFirebaseReady() {
    // Esperar hasta que Firebase esté inicializado
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!firebaseService.getDatabase() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!firebaseService.getDatabase()) {
      throw new Error('Firebase no pudo inicializarse después de varios intentos');
    }
  }

  checkDatabaseReady() {
    if (!this.database) {
      console.warn('GrupoService: Base de datos no inicializada. Llamando init()...');
      // Intentar obtener la referencia de la base de datos
      this.database = firebaseService.getDatabase();
    }
    
    if (!this.database) {
      throw new Error('Base de datos Firebase no está disponible');
    }
    
    return true;
  }

  // Genera un ID único TOMATE-xxxxx
  async generateUniqueGroupId() {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const randomNum = Math.floor(Math.random() * 100000);
      const paddedNum = randomNum.toString().padStart(5, '0');
      const groupId = `TOMATE-${paddedNum}`;
      
      // Verificar si el ID ya existe
      const exists = await this.groupExists(groupId);
      if (!exists) {
        return groupId;
      }
      
      attempts++;
    }
    
    throw new Error('No se pudo generar un ID único después de varios intentos');
  }

  // Verifica si un grupo existe
  async groupExists(groupId) {
    const { get, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const snapshot = await get(ref(this.database, `desayunos/${groupId}`));
      return snapshot.exists();
    } catch (error) {
      console.error('Error verificando existencia del grupo:', error);
      return false;
    }
  }

  // Crear un nuevo grupo
  async createGroup() {
    const { set, ref, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const groupId = await this.generateUniqueGroupId();
      const groupData = {
        id: groupId,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        paid: false, // Solo indicamos si está pagado o no
        personas: {},
        total: 0,
        createdBy: 'anonymous'
      };

      await set(ref(this.database, `desayunos/${groupId}`), groupData);
      
      // Programar eliminación automática si no hay actividad
      this.scheduleGroupCleanup(groupId);
      
      return groupId;
    } catch (error) {
      console.error('Error creando grupo:', error);
      throw new Error('No se pudo crear el grupo');
    }
  }

  // Unirse a un grupo existente
  async joinGroup(groupId, personName) {
    const { get, set, ref, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      // Verificar que el grupo existe y está activo
      const groupSnapshot = await get(ref(this.database, `desayunos/${groupId}`));
      
      if (!groupSnapshot.exists()) {
        throw new Error('El grupo no existe o ha expirado');
      }

      const groupData = groupSnapshot.val();
      if (groupData.paid === true) {
        throw new Error('Este grupo ya ha sido pagado');
      }

      // Verificar que el nombre no esté ya usado
      if (groupData.personas && groupData.personas[personName]) {
        throw new Error('Ya existe una persona con ese nombre en el grupo');
      }

      // Añadir la persona al grupo
      const personData = {
        name: personName,
        items: {},
        joinedAt: serverTimestamp(),
        total: 0
      };

      await set(ref(this.database, `desayunos/${groupId}/personas/${personName}`), personData);
      await set(ref(this.database, `desayunos/${groupId}/lastActivity`), serverTimestamp());

      // Cancelar limpieza automática ya que hay actividad
      this.cancelGroupCleanup(groupId);
      
      return { groupId, personName };
    } catch (error) {
      console.error('Error uniéndose al grupo:', error);
      throw error;
    }
  }

  // Actualizar pedido de una persona
  async updatePersonOrder(groupId, personName, items) {
    const { set, ref, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const personRef = ref(this.database, `desayunos/${groupId}/personas/${personName}`);
      const total = await this.calculatePersonTotal(items);
      await set(personRef, {
        name: personName,
        items: items,
        updatedAt: serverTimestamp(),
        total: total
      });

      // Actualizar actividad del grupo
      await set(ref(this.database, `desayunos/${groupId}/lastActivity`), serverTimestamp());
      
      // Recalcular total del grupo
      await this.updateGroupTotal(groupId);

    } catch (error) {
      console.error('Error actualizando pedido:', error);
      throw new Error('No se pudo actualizar el pedido');
    }
  }

  // Calcular total de una persona
  async calculatePersonTotal(items) {
    const { calcularPrecioPedido } = await import('../data/menu-data.js');
    const resultado = calcularPrecioPedido(items);
    return resultado.total ? parseFloat(resultado.total) : 0;
  }

  // Actualizar total del grupo
  async updateGroupTotal(groupId) {
    const { get, set, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      const personasSnapshot = await get(ref(this.database, `desayunos/${groupId}/personas`));
      
      if (personasSnapshot.exists()) {
        const personas = personasSnapshot.val();
        let total = 0;
        for (const persona of Object.values(personas)) {
          if (persona.items) {
            const personTotal = await this.calculatePersonTotal(persona.items);
            total += personTotal;
          }
        }

        await set(ref(this.database, `desayunos/${groupId}/total`), total);
      }
    } catch (error) {
      console.error('Error actualizando total del grupo:', error);
    }
  }

  // Obtener datos del grupo en tiempo real
  async onGroupChange(groupId, callback) {
    const { onValue, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    const groupRef = ref(this.database, `desayunos/${groupId}`);
    return onValue(groupRef, callback);
  }

  // Marcar grupo como pagado
  async markGroupAsPaid(groupId) {
    const { set, ref, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      await set(ref(this.database, `desayunos/${groupId}/paid`), true);
      await set(ref(this.database, `desayunos/${groupId}/paidAt`), serverTimestamp());
      await set(ref(this.database, `desayunos/${groupId}/lastActivity`), serverTimestamp());
    } catch (error) {
      console.error('Error marcando como pagado:', error);
      throw new Error('No se pudo marcar el grupo como pagado');
    }
  }

  // Programar eliminación automática del grupo (5 minutos)
  scheduleGroupCleanup(groupId) {
    const cleanupTime = 5 * 60 * 1000; // 5 minutos en millisegundos
    
    const timer = setTimeout(async () => {
      try {
        const { get, remove, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
        
        // Verificar si el grupo aún existe y no tiene personas
        const groupSnapshot = await get(ref(this.database, `desayunos/${groupId}`));
        
        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.val();
          const hasPersonas = groupData.personas && Object.keys(groupData.personas).length > 0;
          
          if (!hasPersonas) {
            await remove(ref(this.database, `desayunos/${groupId}`));
            console.log(`Grupo ${groupId} eliminado por inactividad`);
          }
        }
        
        this.activeGroupCleanupTimers.delete(groupId);
      } catch (error) {
        console.error('Error en limpieza automática:', error);
      }
    }, cleanupTime);

    this.activeGroupCleanupTimers.set(groupId, timer);
  }

  // Cancelar eliminación automática
  cancelGroupCleanup(groupId) {
    const timer = this.activeGroupCleanupTimers.get(groupId);
    if (timer) {
      clearTimeout(timer);
      this.activeGroupCleanupTimers.delete(groupId);
    }
  }

  // Obtener todos los grupos (para admin)
  async getAllGroups() {
    const { get, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      // Verificar que la base de datos esté lista
      this.checkDatabaseReady();
      
      const snapshot = await get(ref(this.database, 'desayunos'));
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // No hay grupos aún, devolver objeto vacío
      console.log('ℹ️  No hay grupos en la base de datos todavía');
      return {};
    } catch (error) {
      console.error('Error obteniendo todos los grupos:', error);
      
      // Si es un error de base de datos no inicializada, dar más contexto
      if (error.message.includes('_checkNotDeleted') || error.message.includes('null')) {
        console.error('💥 La base de datos Firebase no está inicializada correctamente');
        console.error('   Asegúrate de que Firebase esté configurado y la conexión sea estable');
      }
      
      return {};
    }
  }

  // Marcar grupo como pagado (método simplificado para mantener compatibilidad)
  async markAsPaid(groupId) {
    return this.markGroupAsPaid(groupId);
  }

  // Eliminar grupo manualmente
  async deleteGroup(groupId) {
    const { remove, ref } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
    
    try {
      await remove(ref(this.database, `desayunos/${groupId}`));
      this.cancelGroupCleanup(groupId);
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      throw new Error('No se pudo eliminar el grupo');
    }
  }
}

export const grupoService = new GrupoService();