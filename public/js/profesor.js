import { protegerRuta, Sesion, formatearFecha } from "./sesion.js";
import { getHistorial, marcarAtendido, borrarTiquete, responderTiquete } from "../services/tiquetesService.js";
import { registrarUsuario } from "../services/usuariosService.js"; 

// Proteger ruta para PROFESOR
let usuarioActual = protegerRuta("profesor");
if (!usuarioActual) {
  window.location.href = "../pages/login.html";
}

// ===== DOM =====
const btnSalir        = document.getElementById("btnSalir");
const btnRefrescar    = document.getElementById("btnRefrescarProfesor");
const listaCola       = document.getElementById("listaCola");
const msgCola         = document.getElementById("msgCola");

const listaHistorial  = document.getElementById("listaHistorial");
const msgHistorial    = document.getElementById("msgHistorial");
const buscador        = document.getElementById("buscador");

const inpUsuario      = document.getElementById("nuevoUsuario");
const inpContrasena   = document.getElementById("nuevaContrasena");
const selRol          = document.getElementById("rol");
const btnRegistrar    = document.getElementById("btnRegistrar");
const msgRegistro     = document.getElementById("msgRegistro");

// ===== Estado en memoria =====
let colaPendientes   = [];
let historialAtendido = [];

// ===== Eventos =====
btnSalir.addEventListener("click", () => {
  Sesion.clear();
  window.location.href = "../pages/login.html";
});

btnRefrescar.addEventListener("click", cargarTodo);

btnRegistrar.addEventListener("click", async () => {
  const usuario = (inpUsuario.value || "").trim();
  const contrasena = (inpContrasena.value || "").trim();
  const rol = selRol.value;

  if (!usuario || !contrasena) {
    msgRegistro.textContent = "Usuario y contraseña son obligatorios.";
    return;
  }

  btnRegistrar.disabled = true;
  msgRegistro.textContent = "Registrando...";

  try {
    // Mantener la lógica de servicios (POST en usuariosService.js)
    await registrarUsuario({ usuario, contrasena, rol });
    msgRegistro.textContent = "Usuario registrado exitosamente.";
    inpUsuario.value = "";
    inpContrasena.value = "";
    selRol.value = "estudiante";
  } catch (err) {
    console.error(err);
    msgRegistro.textContent = "Error al registrar usuario.";
  } finally {
    btnRegistrar.disabled = false;
  }
});

// Búsqueda en historial (por nombre o texto de consulta)
buscador.addEventListener("input", () => {
  const q = (buscador.value || "").toLowerCase();
  renderHistorial(
    historialAtendido.filter(t =>
      (t.nombre || "").toLowerCase().includes(q) ||
      (t.consulta || "").toLowerCase().includes(q)
    )
  );
});

// ===== Carga y render =====
async function cargarTodo() {
  msgCola.textContent = "Cargando cola...";
  msgHistorial.textContent = "Cargando historial...";
  listaCola.innerHTML = "";
  listaHistorial.innerHTML = "";

  try {
    const todos = await getHistorial(); // devuelve TODOS los tiquetes
    // Separar
    colaPendientes = todos.filter(t => t.estado === "pendiente");
    historialAtendido = todos
      .filter(t => t.estado === "atendido")
      .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

    // Render
    renderCola(colaPendientes);
    renderHistorial(historialAtendido);

    msgCola.textContent = colaPendientes.length ? "" : "No hay tiquetes en cola.";
    msgHistorial.textContent = historialAtendido.length ? "" : "No hay historial.";
  } catch (err) {
    console.error(err);
    msgCola.textContent = "Error al cargar cola.";
    msgHistorial.textContent = "Error al cargar historial.";
  }
}

/* function renderCola(items) {
  listaCola.innerHTML = "";
  items
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)) // los más viejos primero en cola
    .forEach(t => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-start";
      li.innerHTML = `
        <div class="me-3">
          <div class="fw-semibold">${t.nombre} — ${t.consulta || "(sin texto)"}</div>
          <small class="text-muted">${formatearFecha(t.fechaHora)} · id: ${t.id}</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success" data-accion="atender" data-id="${t.id}">Atendido</button>
          <button class="btn btn-sm btn-outline-danger" data-accion="borrar" data-id="${t.id}">Borrar</button>
        </div>
      `;
      listaCola.appendChild(li);
    });

  // Delegación de eventos: atender/borrar
  listaCola.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-accion]");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const accion = btn.getAttribute("data-accion");

    try {
      btn.disabled = true;

      if (accion === "atender") {
        await marcarAtendido(id);
      } else if (accion === "borrar") {
        await borrarTiquete(id);
      }

      await cargarTodo();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error procesando el tiquete.");
    } finally {
      btn.disabled = false;
    }
  }, { once: true }); // se vuelve a adjuntar en cada render para mantener limpio
} */

function renderHistorial(items) {
  listaHistorial.innerHTML = "";
  items.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
      <div class="fw-semibold">${t.nombre} — ${t.consulta || "(sin texto)"} </div>
      <small class="text-muted">${formatearFecha(t.fechaHora)} · id: ${t.id}</small>
    `;
    listaHistorial.appendChild(li);
  });
}

function renderCola(items) {
  listaCola.innerHTML = "";
  items
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
    .forEach(t => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-start";
      li.innerHTML = `
        <div class="me-3">
          <div class="fw-semibold">${t.nombre} — ${t.consulta || "(sin texto)"} </div>
          <small class="text-muted">${formatearFecha(t.fechaHora)} · id: ${t.id}</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" data-accion="responder" data-id="${t.id}">Responder</button>
          <button class="btn btn-sm btn-success" data-accion="atender" data-id="${t.id}">Atendido</button>
          <button class="btn btn-sm btn-outline-danger" data-accion="borrar" data-id="${t.id}">Borrar</button>
        </div>
      `;
      listaCola.appendChild(li);
    });

  // Delegación de eventos (simple, con prompt)
  listaCola.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-accion]");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const accion = btn.getAttribute("data-accion");
    try {
      btn.disabled = true;

      if (accion === "responder") {
        const respuesta = prompt("Escribe la respuesta para el estudiante:");
        if (respuesta && respuesta.trim()) {
          await responderTiquete(id, respuesta, usuarioActual.usuario);
        }
      } else if (accion === "atender") {
        await marcarAtendido(id);
      } else if (accion === "borrar") {
        await borrarTiquete(id);
      }

      await cargarTodo();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error procesando el tiquete.");
    } finally {
      btn.disabled = false;
    }
  }, { once: true });
}
// ===== Init =====
cargarTodo();
