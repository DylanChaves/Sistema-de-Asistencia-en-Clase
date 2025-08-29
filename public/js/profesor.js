import { Sesion, protegerRuta, formatearFecha } from "./sesion.js";
import {
  getPendientesDe,
  getHistorial,
  marcarAtendido,
  borrarTiquete
} from "../services/tiquetesService.js";

const usuarioAutenticado = protegerRuta("profesor");
if (!usuarioAutenticado) {
  // protegerRuta ya redirige
}

const botonRefrescarPanel = document.getElementById("btnRefrescarProfesor");
const listaTiquetesEnCola = document.getElementById("listaCola");
const mensajeCola = document.getElementById("msgCola");

const campoBuscadorHistorial = document.getElementById("buscador");
const listaTiquetesHistorial = document.getElementById("listaHistorial");
const mensajeHistorial = document.getElementById("msgHistorial");

const botonCerrarSesion = document.getElementById("btnSalir");

const botonRegistrarUsuario = document.getElementById("btnRegistrar");
const campoNuevoUsuario = document.getElementById("nuevoUsuario");
const campoNuevaContrasena = document.getElementById("nuevaContrasena");
const selectorRolUsuario = document.getElementById("rol");
const mensajeRegistroUsuario = document.getElementById("msgRegistro");

botonCerrarSesion?.addEventListener("click", () => {
  Sesion.clear();
  window.location.href = "/login";
});

async function cargarPendientesDesdeServidor() {
  return await getPendientesDe(); // pendientes (cola) ✔️
}

async function cargarHistorialDesdeServidor() {
  return await getHistorial(); // atendidos ✔️
}

function renderizarColaPendiente(tiquetesPendientes) {
  listaTiquetesEnCola.innerHTML = "";

  if (!tiquetesPendientes.length) {
    mensajeCola.textContent = "No hay tiquetes pendientes.";
    return;
  }

  mensajeCola.textContent = "";
  tiquetesPendientes
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
    .forEach((tiquete) => {
      const elemento = document.createElement("li");
      elemento.className = "list-group-item d-flex justify-content-between align-items-start";
      elemento.innerHTML = `
        <div class="me-3">
          <div><strong>${tiquete.nombre}</strong></div>
          <div>${tiquete.consulta || "(sin texto)"} </div>
          <small class="text-muted">Fecha: ${formatearFecha(tiquete.fechaHora)}</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-danger" data-accion="atender" data-id="${tiquete.id}">Atender</button>
          <button class="btn btn-sm btn-outline-secondary" data-accion="borrar" data-id="${tiquete.id}">Eliminar</button>
        </div>
      `;
      listaTiquetesEnCola.appendChild(elemento);
    });
}

function renderizarHistorialAtendido(tiquetesAtendidos, textoFiltro) {
  listaTiquetesHistorial.innerHTML = "";
  const filtroNormalizado = (textoFiltro || "").toLowerCase();

  const tiquetesFiltrados = tiquetesAtendidos
    .filter((tiquete) =>
      !filtroNormalizado ||
      (tiquete.nombre && tiquete.nombre.toLowerCase().includes(filtroNormalizado)) ||
      (tiquete.consulta && tiquete.consulta.toLowerCase().includes(filtroNormalizado))
    )
    .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

  if (!tiquetesFiltrados.length) {
    mensajeHistorial.textContent = "Sin resultados.";
    return;
  }

  mensajeHistorial.textContent = "";
  tiquetesFiltrados.forEach((tiquete) => {
    const elemento = document.createElement("li");
    elemento.className = "list-group-item";
    elemento.innerHTML = `
      <div><strong>${tiquete.nombre}</strong> — ${tiquete.consulta || "(sin texto)"}</div>
      <small class="text-muted">Atendido el: ${formatearFecha(tiquete.fechaHora)}</small>
    `;
    listaTiquetesHistorial.appendChild(elemento);
  });
}

async function refrescarPantallaDelProfesor() {
  try {
    mensajeCola.textContent = "Cargando cola...";
    mensajeHistorial.textContent = "Cargando historial...";

    const [tiquetesPendientes, tiquetesAtendidos] = await Promise.all([
      cargarPendientesDesdeServidor(),
      cargarHistorialDesdeServidor()
    ]);

    renderizarColaPendiente(tiquetesPendientes);
    renderizarHistorialAtendido(tiquetesAtendidos, campoBuscadorHistorial.value || "");
  } catch (errorCarga) {
    console.error(errorCarga);
    mensajeCola.textContent = "Error al cargar la cola.";
    mensajeHistorial.textContent = "Error al cargar historial.";
  }
}

listaTiquetesEnCola?.addEventListener("click", async (eventoClick) => {
  const botonAtender = eventoClick.target?.closest("button[data-accion='atender']");
  const botonEliminar = eventoClick.target?.closest("button[data-accion='borrar']");
  const botonActivado = botonAtender || botonEliminar;
  if (!botonActivado) return;

  const tiqueteId = botonActivado.getAttribute("data-id");
  const textoOriginal = botonActivado.textContent;
  botonActivado.disabled = true;

  try {
    if (botonAtender) {
      botonActivado.textContent = "Atendiendo...";
      await marcarAtendido(tiqueteId);
    } else {
      botonActivado.textContent = "Eliminando...";
      await borrarTiquete(tiqueteId);
    }
    await refrescarPantallaDelProfesor();
  } catch (errorAccion) {
    console.error(errorAccion);
  } finally {
    botonActivado.disabled = false;
    botonActivado.textContent = textoOriginal;
  }
});

campoBuscadorHistorial?.addEventListener("input", async () => {
  try {
    const tiquetesAtendidos = await cargarHistorialDesdeServidor();
    renderizarHistorialAtendido(tiquetesAtendidos, campoBuscadorHistorial.value || "");
  } catch (errorBuscar) {
    console.error(errorBuscar);
    mensajeHistorial.textContent = "Error al buscar en el historial.";
  }
});

botonRefrescarPanel?.addEventListener("click", refrescarPantallaDelProfesor);

botonRegistrarUsuario?.addEventListener("click", async () => {
  const nuevoNombreUsuario = (campoNuevoUsuario.value || "").trim();
  const nuevaContrasenaUsuario = (campoNuevaContrasena.value || "").trim();
  const rolSeleccionado = (selectorRolUsuario.value || "estudiante").trim();

  if (!nuevoNombreUsuario || !nuevaContrasenaUsuario) {
    mensajeRegistroUsuario.textContent = "Usuario y contraseña son requeridos.";
    return;
  }

  mensajeRegistroUsuario.textContent = "Registrando...";
  try {
    const respuestaCreacion = await fetch("http://localhost:3001/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: nuevoNombreUsuario,
        contrasena: nuevaContrasenaUsuario,
        rol: rolSeleccionado
      })
    });
    if (!respuestaCreacion.ok) throw new Error("HTTP " + respuestaCreacion.status);

    mensajeRegistroUsuario.textContent = "Usuario registrado.";
    campoNuevoUsuario.value = "";
    campoNuevaContrasena.value = "";
    selectorRolUsuario.value = "estudiante";
  } catch (errorRegistro) {
    console.error(errorRegistro);
    mensajeRegistroUsuario.textContent = "Error al registrar usuario.";
  }
});

refrescarPantallaDelProfesor();