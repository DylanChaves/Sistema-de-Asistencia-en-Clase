import { Sesion, protegerRuta, formatearFecha } from "./sesion.js";
import { crearTiquete, getPendientesDe, borrarTiquete } from "../services/tiquetesService.js";

const usuarioAutenticado = protegerRuta("estudiante");
if (!usuarioAutenticado) {
 
  stopExecution && stopExecution();
}

const campoConsulta = document.getElementById("consulta");
const botonCrearTiquete = document.getElementById("btnCrearTiquete");
const botonRefrescarPendientes = document.getElementById("btnRefrescar");
const listaTiquetesPendientes = document.getElementById("listaPendientes");
const mensajeCreacionTiquete = document.getElementById("msgCrear");
const mensajePendientes = document.getElementById("msgPendientes");
const botonCerrarSesion = document.getElementById("btnSalir");

botonCerrarSesion?.addEventListener("click", () => {
  Sesion.clear();
  window.location.href = "/login";
});

async function cargarTiquetesPendientesDelEstudiante() {
  mensajePendientes.textContent = "Cargando...";
  listaTiquetesPendientes.innerHTML = "";

  try {
    const tiquetesPendientes = await getPendientesDe(usuarioAutenticado.id);

    if (!tiquetesPendientes.length) {
      mensajePendientes.textContent = "No tienes tiquetes pendientes.";
      return;
    }

    mensajePendientes.textContent = "";
    tiquetesPendientes.forEach((tiquete) => {
      const elementoLista = document.createElement("li");
      elementoLista.className = "list-group-item d-flex justify-content-between align-items-start";
      elementoLista.innerHTML = `
        <div class="me-3">
          <div><strong>${tiquete.consulta || "(sin texto)"} </strong></div>
          <small class="text-muted">Fecha: ${formatearFecha(tiquete.fechaHora)}</small>
          <small class="text-muted d-block">Estado: ${tiquete.estado}</small>
        </div>
        <button class="btn btn-sm btn-outline-danger" data-accion="borrar" data-id="${tiquete.id}">Eliminar</button>
      `;
      listaTiquetesPendientes.appendChild(elementoLista);
    });
  } catch (errorCargaPendientes) {
    console.error(errorCargaPendientes);
    mensajePendientes.textContent = "Error al cargar pendientes.";
  }
}

botonCrearTiquete?.addEventListener("click", async () => {
  const textoConsulta = (campoConsulta.value || "").trim();

  if (!textoConsulta) {
    mensajeCreacionTiquete.textContent = "Por favor escribe tu consulta.";
    return;
  }

  mensajeCreacionTiquete.textContent = "Enviando...";
  try {
    await crearTiquete(usuarioAutenticado, textoConsulta);
    campoConsulta.value = "";
    mensajeCreacionTiquete.textContent = "¡Tiquete enviado a la cola!";
    await cargarTiquetesPendientesDelEstudiante();
  } catch (errorCreacion) {
    console.error(errorCreacion);
    mensajeCreacionTiquete.textContent = "Error al crear el tiquete.";
  }
});

listaTiquetesPendientes?.addEventListener("click", async (eventoClick) => {
  const botonEliminar = eventoClick.target?.closest("button[data-accion='borrar']");
  if (!botonEliminar) return;

  const tiqueteId = botonEliminar.getAttribute("data-id");
  botonEliminar.disabled = true;
  const textoOriginalBoton = botonEliminar.textContent;
  botonEliminar.textContent = "Eliminando...";

  try {
    await borrarTiquete(tiqueteId);
    await cargarTiquetesPendientesDelEstudiante();
  } catch (errorBorrado) {
    console.error(errorBorrado);
  } finally {
    botonEliminar.disabled = false;
    botonEliminar.textContent = textoOriginalBoton;
  }
});

cargarTiquetesPendientesDelEstudiante();