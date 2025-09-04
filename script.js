// Array para almacenar las tareas
let tareas = [];
let filtroActual = 'todas';

// Elementos del DOM
const tareaInput = document.getElementById('tarea-input');
const agregarBtn = document.getElementById('agregar-btn');
const listaTareas = document.getElementById('lista-tareas');
const filtroBtns = document.querySelectorAll('.filtro-btn');
const limpiarBtn = document.getElementById('limpiar-btn');
const guardarBtn = document.getElementById('guardar-btn');
const totalTareas = document.getElementById('total-tareas');
const tareasPendientes = document.getElementById('tareas-pendientes');
const tareasCompletadas = document.getElementById('tareas-completadas');

// Cargar tareas guardadas al iniciar
cargarTareas();

// Event Listeners
agregarBtn.addEventListener('click', agregarTarea);
tareaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') agregarTarea();
});

filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => cambiarFiltro(btn.dataset.filtro));
});

limpiarBtn.addEventListener('click', limpiarCompletadas);
guardarBtn.addEventListener('click', guardarTareas);

// Función para agregar tarea
function agregarTarea() {
    const texto = tareaInput.value.trim();
    
    if (!texto) {
        alert('Por favor, escribe una tarea');
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        completada: false,
        fecha: new Date().toLocaleDateString()
    };

    tareas.unshift(nuevaTarea);
    tareaInput.value = '';
    tareaInput.focus();
    
    guardarTareasLocal();
    actualizarLista();
    actualizarEstadisticas();
}

// Función para actualizar la lista
function actualizarLista() {
    listaTareas.innerHTML = '';

    const tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === 'todas') return true;
        if (filtroActual === 'pendientes') return !tarea.completada;
        if (filtroActual === 'completadas') return tarea.completada;
        return true;
    });

    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = '<li class="vacio">No hay tareas en esta categoría</li>';
        return;
    }

    tareasFiltradas.forEach(tarea => {
        const li = document.createElement('li');
        li.className = `tarea-item ${tarea.completada ? 'completada' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="tarea-checkbox" ${tarea.completada ? 'checked' : ''}>
            <span class="tarea-texto">${tarea.texto}</span>
            <small>${tarea.fecha}</small>
            <button class="tarea-eliminar">🗑️</button>
        `;

        const checkbox = li.querySelector('.tarea-checkbox');
        const deleteBtn = li.querySelector('.tarea-eliminar');

        checkbox.addEventListener('change', () => toggleCompletada(tarea.id));
        deleteBtn.addEventListener('click', () => eliminarTarea(tarea.id));

        listaTareas.appendChild(li);
    });
}

// Función para cambiar estado de tarea
function toggleCompletada(id) {
    tareas = tareas.map(tarea =>
        tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea
    );
    guardarTareasLocal();
    actualizarLista();
    actualizarEstadisticas();
}

// Función para eliminar tarea
function eliminarTarea(id) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        tareas = tareas.filter(tarea => tarea.id !== id);
        guardarTareasLocal();
        actualizarLista();
        actualizarEstadisticas();
    }
}

// Función para cambiar filtro
function cambiarFiltro(filtro) {
    filtroActual = filtro;
    
    filtroBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === filtro);
    });
    
    actualizarLista();
}

// Función para limpiar tareas completadas
function limpiarCompletadas() {
    if (confirm('¿Eliminar todas las tareas completadas?')) {
        tareas = tareas.filter(tarea => !tarea.completada);
        guardarTareasLocal();
        actualizarLista();
        actualizarEstadisticas();
    }
}

// Función para actualizar estadísticas
function actualizarEstadisticas() {
    const total = tareas.length;
    const pendientes = tareas.filter(t => !t.completada).length;
    const completadas = total - pendientes;

    totalTareas.textContent = `Total: ${total}`;
    tareasPendientes.textContent = `Pendientes: ${pendientes}`;
    tareasCompletadas.textContent = `Completadas: ${completadas}`;
}

// Guardar en localStorage
function guardarTareasLocal() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// Cargar desde localStorage
function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
        actualizarLista();
        actualizarEstadisticas();
    }
}

// Guardar como JSON (descarga)
function guardarTareas() {
    const dataStr = JSON.stringify(tareas, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tareas.json';
    const linkElement = document.createElement('a');
    
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}