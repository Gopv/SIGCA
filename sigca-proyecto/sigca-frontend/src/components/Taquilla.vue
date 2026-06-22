<template>
  <div class="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
    
    <div class="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-6 gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Módulo de Taquilla — Estudiantes</h2>
        <p class="text-xs text-gray-500">Gestión autónoma y control de acceso local del Comedor Universitario</p>
      </div>
      <a 
        href="https://arse.unellez.edu.ve/arse/portal/consulta_estudiantes.php" 
        target="_blank" 
        class="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 self-start md:self-center border border-orange-200 shadow-sm"
      >
        🌐 Visitar Consulta ARSE Oficial ↗
      </a>
    </div>

    <div class="flex justify-between items-center mb-6 border-b pb-3">
      <div class="flex gap-2">
        <button 
          @click="pestañaActual = 'verificar'" 
          :class="['px-4 py-2 rounded-lg text-xs font-bold transition-colors', pestañaActual === 'verificar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
        >
          🔍 Verificar Estudiante Local
        </button>
        <button 
          @click="pestañaActual = 'registrar'" 
          :class="['px-4 py-2 rounded-lg text-xs font-bold transition-colors', pestañaActual === 'registrar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
        >
          ➕ Conectar / Registrar Manual Estudiantes Unellez
        </button>
      </div>

      <button 
        @click="borrarTodosLosEstudiantes" 
        class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
      >
        🗑️ Vaciar Base Estudiantes
      </button>
    </div>

    <div v-if="pestañaActual === 'verificar'">
      <form @submit.prevent="consultarLocal" class="flex gap-3 mb-6">
        <input 
          type="text" 
          v-model="busquedaCedula" 
          placeholder="Ingrese cédula a verificar localmente (Ej: 26611174)" 
          required 
          class="flex-1 border p-2.5 rounded-lg outline-none text-sm font-mono tracking-wider focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-lg text-sm transition-colors">
          Buscar
        </button>
      </form>

      <div v-if="resultadoBusqueda">
        <div v-if="!resultadoBusqueda.registrado" class="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg border text-sm text-gray-700">
          ❌ {{ resultadoBusqueda.mensaje }}
        </div>
        
        <div 
          v-else 
          :class="['border-l-8 p-5 rounded-r-lg border shadow-sm transition-colors', resultadoBusqueda.datos.condicion === 'ACTIVO' ? 'bg-green-50/50 border-green-500' : 'bg-red-50/50 border-red-500']"
        >
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div class="flex gap-2 mb-3">
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-bold border', resultadoBusqueda.datos.condicion === 'ACTIVO' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200']">
                  ESTATUS: {{ resultadoBusqueda.datos.condicion }}
                </span>
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-bold border', resultadoBusqueda.datos.cupo_comedor === 'DISPONIBLE' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-orange-100 text-orange-800 border-orange-200']">
                  CUPO: {{ resultadoBusqueda.datos.cupo_comedor }}
                </span>
              </div>
              <h3 class="text-xl font-bold text-gray-900">{{ resultadoBusqueda.datos.nombres }} {{ resultadoBusqueda.datos.apellidos }}</h3>
              <p class="text-sm text-gray-500 font-mono mt-0.5">C.I: {{ resultadoBusqueda.datos.cedula }}</p>
              <p class="text-xs text-gray-700 mt-2"><span class="font-semibold text-gray-600">Carrera:</span> {{ resultadoBusqueda.datos.carrera }} | <span class="font-semibold text-gray-600">Semestre:</span> {{ resultadoBusqueda.datos.semestre }} | <span class="font-semibold text-gray-600">Período:</span> {{ resultadoBusqueda.datos.periodo_lectivo }}</p>
            </div>
            
            <button 
              v-if="resultadoBusqueda.datos.condicion === 'ACTIVO' && resultadoBusqueda.datos.cupo_comedor === 'DISPONIBLE'"
              @click="marcarConsumido(resultadoBusqueda.datos.cedula)"
              class="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-all self-start"
            >
              ✓ Conceder Almuerzo / Consumir Cupo
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pestañaActual === 'registrar'">
      <form @submit.prevent="guardarEstudianteManual" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Cédula de Identidad</label>
          <input type="text" v-model="formEstudiante.cedula" required class="w-full border p-2 rounded-lg text-sm outline-none font-mono" placeholder="Ej: 26611174" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Nombres</label>
          <input type="text" v-model="formEstudiante.nombres" required class="w-full border p-2 rounded-lg text-sm outline-none" placeholder="Ej: Gabriel Omar" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Apellidos</label>
          <input type="text" v-model="formEstudiante.apellidos" required class="w-full border p-2 rounded-lg text-sm outline-none" placeholder="Ej: Perez Valencia" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Carrera</label>
          <input type="text" v-model="formEstudiante.carrera" class="w-full border p-2 rounded-lg text-sm outline-none" placeholder="Ej: INGENIERIA INFORMATICA" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Semestre / Trayecto</label>
          <input type="text" v-model="formEstudiante.semestre" class="w-full border p-2 rounded-lg text-sm outline-none" placeholder="Ej: 8vo" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Período Lectivo</label>
          <input type="text" v-model="formEstudiante.periodo_lectivo" class="w-full border p-2 rounded-lg text-sm outline-none" placeholder="Ej: 2026-I" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Condición Académica</label>
          <select v-model="formEstudiante.condicion" class="w-full border p-2 rounded-lg text-sm outline-none">
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Estatus Inicial de Cupo</label>
          <select v-model="formEstudiante.cupo_comedor" class="w-full border p-2 rounded-lg text-sm outline-none">
            <option value="DISPONIBLE">DISPONIBLE</option>
            <option value="CONSUMIDO">YA CONSUMIÓ CUPO COMEDOR</option>
          </select>
        </div>
        <div class="flex items-end">
          <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm">
            💾 Guardar Estudiante Localmente
          </button>
        </div>
      </form>
      <div v-if="mensajeRegistro" class="mt-4 p-3 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100">
        {{ mensajeRegistro }}
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const pestañaActual = ref('verificar');
const busquedaCedula = ref('');
const resultadoBusqueda = ref(null);
const mensajeRegistro = ref('');

const formEstudiante = ref({
  cedula: '', nombres: '', apellidos: '', carrera: '', semestre: '', periodo_lectivo: '', condicion: 'ACTIVO', cupo_comedor: 'DISPONIBLE'
});

const token = localStorage.getItem('token_comedor');

const consultarLocal = async () => {
  if (!busquedaCedula.value) return;
  resultadoBusqueda.value = null;
  try {
    const res = await fetch('http://localhost:3000/api/inventario/taquilla/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ cedula: busquedaCedula.value })
    });
    const data = await res.json();
    if (data.exito) resultadoBusqueda.value = data;
  } catch (error) { console.error(error); }
};

const marcarConsumido = async (cedulaAtendida) => {
  try {
    const res = await fetch('http://localhost:3000/api/inventario/taquilla/consumir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ cedula: cedulaAtendida })
    });
    const data = await res.json();
    if (data.exito) {
      if (resultadoBusqueda.value && resultadoBusqueda.value.datos.cedula === cedulaAtendida) {
        resultadoBusqueda.value.datos.cupo_comedor = 'CONSUMIDO';
      }
    }
  } catch (error) { console.error(error); }
};

const guardarEstudianteManual = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/inventario/taquilla/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formEstudiante.value)
    });
    const data = await res.json();
    if (data.exito) {
      mensajeRegistro.value = data.mensaje;
      formEstudiante.value = { cedula: '', nombres: '', apellidos: '', carrera: '', semestre: '', periodo_lectivo: '', condicion: 'ACTIVO', cupo_comedor: 'DISPONIBLE' };
      setTimeout(() => mensajeRegistro.value = '', 4000);
    }
  } catch (error) { console.error(error); }
};

// Lógica de Vacuación de Estudiantes
const borrarTodosLosEstudiantes = async () => {
  if (confirm("⚠️ ¿Estás totalmente seguro de eliminar a TODOS los estudiantes de la base de datos local? Esta acción no se puede deshacer.")) {
    try {
      const res = await fetch('http://localhost:3000/api/inventario/taquilla/vaciar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.exito) {
        alert(data.mensaje);
        resultadoBusqueda.value = null;
        busquedaCedula.value = '';
      }
    } catch (err) { console.error(err); }
  }
};
</script>