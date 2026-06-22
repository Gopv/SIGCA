<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      
      <div class="text-center">
        <div class="flex justify-center items-center gap-2 mb-2">
          <div class="w-3.5 h-3.5 rounded-full bg-blue-600 animate-pulse"></div>
          <span class="font-bold text-gray-800 tracking-wide text-2xl">SIGCA — UNELLEZ VIPI</span>
        </div>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {{ modoRegistro ? 'Registro de Cuenta Administrativa Local' : 'Control de Inventario y Acceso de Comedor' }}
        </p>
      </div>

      <div class="flex border-b border-gray-100 justify-center gap-6 pb-1">
        <button 
          @click="cambiarModo(false)" 
          :class="['text-xs font-bold pb-2 transition-all outline-none', !modoRegistro ? 'text-blue-600 border-b-2 border-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600']"
        >
          🔑 Iniciar Sesión
        </button>
        <button 
          @click="cambiarModo(true)" 
          :class="['text-xs font-bold pb-2 transition-all outline-none', modoRegistro ? 'text-green-600 border-b-2 border-green-600 scale-105' : 'text-gray-400 hover:text-gray-600']"
        >
          👤 Registrar Usuario
        </button>
      </div>

      <form class="space-y-4 mt-4" @submit.prevent="procesarFormulario">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Nombre de Usuario</label>
          <input 
            v-model="authForm.usuario" 
            type="text" 
            required 
            class="w-full border p-2.5 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" 
            placeholder="Ej: admin_vipi" 
          />
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Contraseña de Seguridad</label>
          <input 
            v-model="authForm.password" 
            type="password" 
            required 
            class="w-full border p-2.5 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-700" 
            placeholder="••••••••" 
          />
        </div>

        <button 
          type="submit" 
          :class="['w-full text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all shadow-md mt-4 transform active:scale-95', modoRegistro ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700']"
        >
          {{ modoRegistro ? 'Crear y Guardar Cuenta Local' : 'Ingresar al Panel SIGCA' }}
        </button>
      </form>

      <div v-if="mensajeExito" class="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 text-center">
        ✓ {{ mensajeExito }}
      </div>
      <div v-if="mensajeError" class="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 text-center">
        ✗ {{ mensajeError }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['loginExitoso']);

const modoRegistro = ref(false);
const mensajeExito = ref('');
const mensajeError = ref('');

const authForm = ref({ usuario: '', password: '' });

const cambiarModo = (registrar) => {
  modoRegistro.value = registrar;
  mensajeExito.value = '';
  mensajeError.value = '';
  authForm.value = { usuario: '', password: '' };
};

const procesarFormulario = async () => {
  mensajeExito.value = '';
  mensajeError.value = '';
  
  // Decide la ruta del backend dinámicamente
  const endpoint = modoRegistro.value ? 'registrar-usuario' : 'login';
  
  try {
    const res = await fetch(`http://localhost:3000/api/inventario/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm.value)
    });
    
    const data = await res.json();
    
    if (data.exito) {
      if (modoRegistro.value) {
        mensajeExito.value = '¡Usuario registrado localmente con éxito! Ya puede iniciar sesión.';
        modoRegistro.value = false; // Lo regresa a la pestaña de Login automáticamente
        authForm.value.password = ''; // Limpia la clave por seguridad
      } else {
        localStorage.setItem('token_comedor', data.token);
        emit('loginExitoso');
      }
    } else {
      mensajeError.value = data.mensaje || 'Error en las credenciales.';
    }
  } catch (error) {
    console.error(error);
    mensajeError.value = 'Imposible conectar con el servidor backend local.';
  }
};
</script>