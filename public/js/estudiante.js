import { protegerRuta, Sesion, formatearFecha } from "./sesion.js";
import { crearTiquete, getPendientesDe } from "../services/tiquetesService.js";

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