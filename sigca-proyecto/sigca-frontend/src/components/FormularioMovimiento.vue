<template>
  <div class="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-12">
    <h2 class="text-lg font-bold text-gray-800 mb-4">Registrar Movimiento en Almacén</h2>
    <form @submit.prevent="enviarDatos" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Agrupación / Categoría</label>
        <select v-model="categoriaSeleccionada" class="w-full border p-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-semibold">
          <option value="" disabled class="text-gray-500 font-normal">Seleccione...</option>
          <option v-for="cat in catalogos.categorias" :key="cat.id_categoria" :value="cat.id_categoria" class="text-gray-900 font-medium">
            {{ cat.nombre }}
          </option>
        </select>
      </div>
      
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Insumo Específico</label>
        <select v-model="formulario.id_insumo" required :disabled="!categoriaSeleccionada" class="w-full border p-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-semibold disabled:bg-gray-100 disabled:text-gray-400 disabled:font-normal">
          <option value="" disabled class="text-gray-500 font-normal">Seleccione insumo...</option>
          <option v-for="insumo in insumosFiltrados" :key="insumo.id_insumo" :value="insumo.id_insumo" class="text-gray-900 font-medium">
            {{ insumo.nombre }}
          </option>
        </select>
      </div>
      
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-600 mb-1">Masa / Volumen</label>
          <input type="number" v-model.number="formulario.amount" min="0.01" step="0.01" required class="w-full border p-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-semibold placeholder:text-gray-500 placeholder:font-normal" placeholder="0.00" />
        </div>
        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg h-9.5 transition-colors text-sm self-end">Guardar</button>
      </div>

    </form>
    <div v-if="mensaje" class="mt-4 p-3 bg-green-50 text-green-700 font-medium rounded-lg text-sm border border-green-100">{{ mensaje }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const categoriaSeleccionada = ref('');
const mensaje = ref('');
// Eliminamos la dependencia visual de tiposMovimiento
const catalogos = ref({ categorias: [], insumos: [] });

// Forzamos id_tipo a 1 (Entrada) por defecto para que la base de datos lo acepte sin quejarse
const formulario = ref({ id_tipo: 1, id_insumo: '', amount: null, observacion: 'Procesado desde UI' });

onMounted(async () => {
  const token = localStorage.getItem('token_comedor');
  const res = await fetch('http://localhost:3000/api/inventario/catalogos', { headers: { 'Authorization': `Bearer ${token}` }});
  const data = await res.json();
  if (data.exito) {
    catalogos.value = data;
  }
});

const insumosFiltrados = computed(() => {
  formulario.value.id_insumo = ''; 
  if (!categoriaSeleccionada.value) return [];
  return catalogos.value.insumos.filter(i => i.id_categoria === categoriaSeleccionada.value);
});

const enviarDatos = async () => {
  const token = localStorage.getItem('token_comedor');
  const res = await fetch('http://localhost:3000/api/inventario/movimiento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      id_insumo: formulario.value.id_insumo,
      id_tipo: formulario.value.id_tipo, // Viaja el 1 de forma invisible
      cantidad: formulario.value.amount,
      observacion: formulario.value.observacion
    })
  });
  const data = await res.json();
  if (data.exito) {
    mensaje.value = 'Transacción completada e inyectada con éxito en la base de datos local.';
    formulario.value.amount = null;
    setTimeout(() => mensaje.value = '', 3000);
  }
};
</script>