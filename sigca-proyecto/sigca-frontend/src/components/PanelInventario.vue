<template>
  <div class="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <div class="flex justify-between items-center mb-6 border-b pb-4">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Panel Central de Existencias</h2>
        <p class="text-xs text-gray-500">Métricas analíticas en tiempo real de consumo interno</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="borrarDatosInventario" 
          class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
        >
          🗑️ Borrar Datos (Reset)
        </button>
        <button @click="cargarInventario" class="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors text-xs">
          ↻ Actualizar Datos
        </button>
      </div>
    </div>
    <div v-if="cargando" class="text-center py-10 text-gray-400 font-medium">Procesando proyecciones de almacenamiento...</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b">
            <th class="p-4 font-semibold">Insumo Alimenticio</th>
            <th class="p-4 font-semibold text-right">Existencia Actual</th>
            <th class="p-4 font-semibold text-center bg-blue-50/50">Proyección Mensual (30D)</th>
            <th class="p-4 font-semibold text-center bg-orange-50/50">Ritmo Reciente (7D)</th>
            <th class="p-4 font-semibold text-center">Estado de Stock</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm divide-y">
          <tr v-for="item in inventario" :key="item.id_insumo" class="hover:bg-gray-50/80 transition-colors">
            <td class="p-4">
              <p class="font-bold text-gray-900">{{ item.producto }}</p>
              <p class="text-xs text-gray-400">{{ item.categoria }}</p>
            </td>
            <td class="p-4 text-right font-bold text-gray-800">{{ item.stock_actual }} <span class="text-xs text-gray-400 font-normal">{{ item.unidad }}</span></td>
            <td class="p-4 text-center font-mono text-blue-700 font-semibold bg-blue-50/20">
              {{ item.dias_restantes_mensual ? item.dias_restantes_mensual + ' días' : 'Recolectando datos...' }}
            </td>
            <td class="p-4 text-center font-mono bg-orange-50/20">
              <span :class="item.dias_restantes_semanal && item.dias_restantes_semanal < item.dias_restantes_mensual ? 'text-red-600 font-bold' : 'text-gray-700 font-semibold'">
                {{ item.dias_restantes_semanal ? item.dias_restantes_semanal + ' días' : 'Recolectando datos...' }}
                <span v-if="item.dias_restantes_semanal && item.dias_restantes_semanal < item.dias_restantes_mensual" class="text-xs ml-1" title="Aceleración del consumo semanal">↓</span>
              </span>
            </td>
            <td class="p-4 text-center">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap', item.estado_stock === 'ÓPTIMO' ? 'bg-green-50 text-green-700' : item.estado_stock === 'ALERTA' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700 border border-red-100']">
                {{ item.estado_stock }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const inventario = ref([]);
const cargando = ref(true);
const token = localStorage.getItem('token_comedor');

const cargarInventario = async () => {
  cargando.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/inventario/estado', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.exito) {
      inventario.value = data.datos.map(item => {
        let estado = 'AGOTADO';
        if (item.stock_actual > 20) estado = 'ÓPTIMO';
        else if (item.stock_actual > 0) estado = 'ALERTA';

        return {
          ...item,
          producto: item.insumo,
          dias_restantes_mensual: item.dias_restantes_mensual || null,
          dias_restantes_semanal: item.dias_restantes_semanal || null,
          estado_stock: item.estado_stock || estado
        };
      });
    }
  } catch (err) { console.error(err); } finally { cargando.value = false; }
};

// Lógica de Vacuación de Inventario
const borrarDatosInventario = async () => {
  if (confirm("⚠️ ¿Estás seguro de vaciar todo el historial de movimientos? El inventario volverá a 0 KG.")) {
    try {
      const res = await fetch('http://localhost:3000/api/inventario/movimiento/vaciar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.exito) {
        alert(data.mensaje);
        cargarInventario(); // Recarga la tabla limpia
      }
    } catch (err) { console.error(err); }
  }
};

onMounted(cargarInventario);
</script>