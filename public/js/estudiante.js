import { protegerRuta, Sesion, formatearFecha } from "./sesion.js";
import { crearTiquete, getPendientesDe, getAtendidosDe  } from "../services/tiquetesService.js";

// Proteger ruta para ESTUDIANTE
let usuarioActual = protegerRuta("estudiante");
if (!usuarioActual) {
  // Tu server sirve el login en '/', no en '/login'
  window.location.href = "../pages/login.html";
}

// ===== DOM =====
const btnSalir        = document.getElementById("btnSalir");
const txtConsulta     = document.getElementById("consulta");
const btnCrearTiquete = document.getElementById("btnCrearTiquete");
const msgCrear        = document.getElementById("msgCrear");

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

btnCrearTiquete.addEventListener("click", async () => {
  const texto = (txtConsulta.value || "").trim();
  if (!texto) {
    msgCrear.textContent = "Escribe tu consulta.";
    txtConsulta.focus();
    return;
  }

  btnCrearTiquete.disabled = true;
  msgCrear.textContent = "Enviando...";

  try {
    await crearTiquete(usuarioActual, texto);
    msgCrear.textContent = "¡Tiquete enviado a la cola!";
    txtConsulta.value = "";
    await cargarPendientes();
  } catch (err) {
    console.error(err);
    msgCrear.textContent = "Error al enviar el tiquete.";
  } finally {
    btnCrearTiquete.disabled = false;
  }
});

btnRefrescarAtendidos?.addEventListener("click", cargarAtendidos);

async function cargarAtendidos() {
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
}
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

// ===== Init =====
cargarPendientes();
cargarAtendidos();