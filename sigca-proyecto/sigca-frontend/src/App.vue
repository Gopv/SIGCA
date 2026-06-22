<template>
  <div class="min-h-screen bg-gray-50/50">
    <Login v-if="!autenticado" @loginExitoso="autenticado = true" />
    <div v-else>
      <nav class="bg-white border-b border-gray-100 py-4 px-6 mb-4 shadow-sm">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-600"></div>
            <span class="font-bold text-gray-800 tracking-wide text-lg">SIGCA — UNELLEZ VIPI</span>
          </div>
          <button @click="cerrarSesion" class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">Cerrar Sesión Activa</button>
        </div>
      </nav>
      
      <Taquilla />

      <PanelInventario />
      <FormularioMovimiento />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Login from './components/Login.vue';
import PanelInventario from './components/PanelInventario.vue';
import FormularioMovimiento from './components/FormularioMovimiento.vue';
// Importamos el archivo de la taquilla
import Taquilla from './components/Taquilla.vue';

const autenticado = ref(false);

onMounted(() => {
  if (localStorage.getItem('token_comedor')) autenticado.value = true;
});

const cerrarSesion = () => {
  localStorage.removeItem('token_comedor');
  autenticado.value = false;
};
</script>