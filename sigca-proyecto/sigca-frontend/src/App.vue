<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-orange-500/30 selection:text-orange-200">
    
    <Login v-if="!autenticado" @loginExitoso="autenticado = true" />

    <div v-else class="flex flex-col min-h-screen">
      
      <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-auto min-h-[5rem] py-2">
            
            <div class="flex items-center gap-4">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-xl font-black text-white tracking-tight leading-none">SIGCA</h1>
                <span class="text-[10px] font-bold text-orange-500 tracking-widest uppercase">UNELLEZ VIPI</span>
              </div>
            </div>

            <nav class="flex flex-wrap justify-center items-center p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 gap-1 sm:gap-2">
              <button 
                @click="vistaActual = 'listar'" 
                :class="['flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200', vistaActual === 'listar' ? 'bg-slate-700 text-orange-400 shadow-md ring-1 ring-orange-500/30' : 'text-slate-400 hover:text-orange-400 hover:bg-slate-700/30']"
              >
                📊 <span class="hidden sm:inline">Listar Inventario</span>
              </button>

              <button 
                @click="vistaActual = 'consultar'" 
                :class="['flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200', vistaActual === 'consultar' ? 'bg-slate-700 text-orange-400 shadow-md ring-1 ring-orange-500/30' : 'text-slate-400 hover:text-orange-400 hover:bg-slate-700/30']"
              >
                🔍 <span class="hidden sm:inline">Consultar Taquilla</span>
              </button>

              <button 
                @click="vistaActual = 'agregar'" 
                :class="['flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200', vistaActual === 'agregar' ? 'bg-slate-700 text-orange-400 shadow-md ring-1 ring-orange-500/30' : 'text-slate-400 hover:text-orange-400 hover:bg-slate-700/30']"
              >
                ➕ <span class="hidden sm:inline">Agregar Movimiento</span>
              </button>
            </nav>

            <div class="flex items-center">
              <button @click="cerrarSesion" class="px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/50">
                Salir
              </button>
            </div>

          </div>
        </div>
      </header>

      <main class="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        
        <div v-if="vistaActual === 'listar'" class="animate-fade">
          <PanelInventario />
        </div>

        <div v-if="vistaActual === 'consultar'" class="animate-fade">
          <Taquilla />
        </div>

        <div v-if="vistaActual === 'agregar'" class="animate-fade">
          <FormularioMovimiento />
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Importación de tus componentes
import Login from './components/Login.vue';
import Taquilla from './components/Taquilla.vue';
import PanelInventario from './components/PanelInventario.vue';
import FormularioMovimiento from './components/FormularioMovimiento.vue';

const autenticado = ref(false);
const vistaActual = ref('listar'); 

onMounted(() => {
  if (localStorage.getItem('token_comedor')) autenticado.value = true;
});

const cerrarSesion = () => {
  localStorage.removeItem('token_comedor');
  autenticado.value = false;
};
</script>

<style>
/* Animación simple y segura, sin romper el layout */
.animate-fade {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>