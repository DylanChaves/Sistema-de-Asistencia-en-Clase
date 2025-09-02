import { protegerRuta, Sesion, formatearFecha } from "./sesion.js";
import { crearTiquete,borrarTiquete  ,getPendientesDe, getAtendidosDe  } from "../services/tiquetesService.js";
import { getProfesores } from "../services/usuariosService.js";

// Proteger ruta para ESTUDIANTE
let usuarioActual = protegerRuta("estudiante");
if (!usuarioActual) {

  window.location.href = "../pages/login.html";
}

// ===== DOM =====
const btnSalir        = document.getElementById("btnSalir");
const txtConsulta     = document.getElementById("consulta");
const btnCrearTiquete = document.getElementById("btnCrearTiquete");
const msgCrear        = document.getElementById("msgCrear");

const selProfesor = document.getElementById("selectProfesor"); 
const msgProfesores = document.getElementById("msgProfesores");

const listaPendientes = document.getElementById("listaPendientes");
const msgPendientes   = document.getElementById("msgPendientes");
const btnRefrescar    = document.getElementById("btnRefrescar");

const listaAtendidos = document.getElementById("listaAtendidos");
const msgAtendidos   = document.getElementById("msgAtendidos");
const btnRefrescarAtendidos = document.getElementById("btnRefrescarAtendidos");


// ===== Eventos =====
btnSalir.addEventListener("click", () => {
  Sesion.clear();
  window.location.href = "../pages/login.html";
});

btnRefrescar.addEventListener("click", cargarPendientes);
btnRefrescarAtendidos?.addEventListener("click", cargarAtendidos);

async function cargarProfesores() {
  msgProfesores.textContent = "Cargando profesores...";
  selProfesor.innerHTML = `<option value="">Seleccione un profesor...</option>`;
  try {
    const profesores = await getProfesores();
    if (!Array.isArray(profesores) || profesores.length === 0) {
      msgProfesores.textContent = "No hay profesores disponibles.";
      return;
    }
    profesores.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.usuario;
      opt.dataset.usuario = p.usuario;
      selProfesor.appendChild(opt);
    });
    msgProfesores.textContent = "Seleccione a quién enviar su consulta.";
  } catch (e) {
    console.error(e);
    msgProfesores.textContent = "Error al cargar profesores.";
  }
}

btnCrearTiquete.addEventListener("click", async () => {
  const texto = (txtConsulta.value || "").trim();
  if (!texto) {
    msgCrear.textContent = "Escribe tu consulta.";
    txtConsulta.focus();
    return;
  }
  const profesorId = selProfesor.value;
  if (!profesorId) {
    msgCrear.textContent = "Seleccione un profesor.";
    selProfesor.focus();
    return;
  }

  // 
  const profesorSeleccionado = {
    id: profesorId,
    usuario: selProfesor.options[selProfesor.selectedIndex]?.dataset?.usuario || selProfesor.options[selProfesor.selectedIndex]?.textContent || ""
  };

  btnCrearTiquete.disabled = true;
  msgCrear.textContent = "Enviando...";

  try {
    await crearTiquete(usuarioActual, texto, profesorSeleccionado);
    msgCrear.textContent = "¡Tiquete enviado!";
    txtConsulta.value = "";
    selProfesor.value = "";
    await cargarPendientes();
  } catch (err) {
    console.error(err);
    msgCrear.textContent = "Error al enviar el tiquete.";
  } finally {
    btnCrearTiquete.disabled = false;
  }
});



async function cargarAtendidos() {
  msgAtendidos.textContent = "Cargando...";
  listaAtendidos.innerHTML = "";
  try {
    const data = await getAtendidosDe(usuarioActual.id);
    if (!Array.isArray(data) || data.length === 0) {
      msgAtendidos.textContent = "No tienes tiquetes atendidos.";
      return;
    }
    data.sort((a, b) => new Date(b.fechaRespuesta || b.fechaHora) - new Date(a.fechaRespuesta || a.fechaHora));
    msgAtendidos.textContent = "";
    data.forEach(t => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <div class="fw-semibold">${t.consulta || "(sin texto)"} ${t.profesorNombre ? `<span class="badge bg-secondary ms-2">@${t.profesorNombre}</span>` : ""}</div>
        <small class="text-muted d-block">${formatearFecha(t.fechaHora)} · estado: ${t.estado}</small>
        ${t.respuesta ? `<div class="mt-2"><span class="badge bg-success">Respuesta</span> ${t.respuesta}</div>` : ""}
        ${t.respondidoPor ? `<small class="text-muted d-block">Respondido por: ${t.respondidoPor} · ${t.fechaRespuesta ? formatearFecha(t.fechaRespuesta) : ""}</small>` : ""}
      `;
      listaAtendidos.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    msgAtendidos.textContent = "Error al cargar atendidos.";
  }
}

/* async function cargarAtendidos() {
  msgAtendidos.textContent = "Cargando...";
  listaAtendidos.innerHTML = "";
  try {
    const data = await getAtendidosDe(usuarioActual.id);
    if (!Array.isArray(data) || data.length === 0) {
      msgAtendidos.textContent = "No tienes tiquetes atendidos.";
      return;
    }
    // Ordenar por fecha de respuesta o fecha de creación (desc)
    data.sort((a, b) => new Date(b.fechaRespuesta || b.fechaHora) - new Date(a.fechaRespuesta || a.fechaHora));
    msgAtendidos.textContent = "";

    data.forEach(t => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <div class="fw-semibold">${t.consulta || "(sin texto)"}</div>
        <small class="text-muted d-block">${formatearFecha(t.fechaHora)} · estado: ${t.estado}</small>
        ${t.respuesta ? `<div class="mt-2"><span class="badge bg-success">Respuesta</span> ${t.respuesta}</div>` : ""}
        ${t.respondidoPor ? `<small class="text-muted d-block">Respondido por: ${t.respondidoPor} · ${t.fechaRespuesta ? formatearFecha(t.fechaRespuesta) : ""}</small>` : ""}
      `;
      listaAtendidos.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    msgAtendidos.textContent = "Error al cargar atendidos.";
  }
} */
// ===== Funciones =====
async function cargarPendientes() {
  msgPendientes.textContent = "Cargando...";
  listaPendientes.innerHTML = "";

  try {
    const data = await getPendientesDe(usuarioActual.id);
    if (!Array.isArray(data) || data.length === 0) {
      msgPendientes.textContent = "No tienes tiquetes pendientes.";
      return;
    }

    // Ordenar por fecha descendente
    data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
    msgPendientes.textContent = "";

    data.forEach(t => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-start";
      li.innerHTML = `
        <div>
          <div class="fw-semibold">${t.consulta || "(sin texto)"}</div>
          <small class="text-muted">${formatearFecha(t.fechaHora)} · estado: ${t.estado}</small>
        </div>
      `;
      listaPendientes.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    msgPendientes.textContent = "Error al cargar pendientes.";
  }
}

listaAtendidos.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-accion='borrar-atendido']");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  try {
    btn.disabled = true;
    if (confirm("¿Borrar este tiquete atendido de tu lista?")) {
      await borrarTiquete(id);
      await cargarAtendidos();
    }
  } catch (err) {
    console.error(err);
    alert("No se pudo borrar el tiquete.");
  } finally {
    btn.disabled = false;
  }
});
// ===== Init =====
cargarProfesores();
cargarPendientes();
cargarAtendidos();