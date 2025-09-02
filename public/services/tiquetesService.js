export async function crearTiquete(usuarioActual, consultaTexto, profesorSeleccionado) {
  try {
    const nuevoTiquete = {
      usuarioId: usuarioActual.id,
      nombre: usuarioActual.usuario,
      consulta: (consultaTexto ?? "").trim(),
      fechaHora: new Date().toISOString(),
      estado: "pendiente",
      // Asignación de profesor
      profesorId: profesorSeleccionado?.id || null,
      profesorNombre: profesorSeleccionado?.usuario || null
    };

    const respuesta = await fetch("http://localhost:3001/tiquetes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoTiquete)
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al crear tiquete`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error al crear tiquete:", error);
    throw error;
  }
}

// Obtener TODOS los tiquetes del PROFESOR (filtrados por profesorId)
export async function getHistorial(profesorId = null) {
  try {
    const base = "http://localhost:3001/tiquetes";
    const url = profesorId ? `${base}?profesorId=${encodeURIComponent(profesorId)}` : base;

    const resp = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al obtener historial`);
    return await resp.json();
  } catch (error) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
}

// Obtener PENDIENTES de un ESTUDIANTE
export async function getPendientesDe(usuarioId) {
  try {
    const url = `http://localhost:3001/tiquetes?estado=pendiente&usuarioId=${encodeURIComponent(usuarioId)}`;
    const resp = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} al obtener pendientes del estudiante`);
    }

    return await resp.json();
  } catch (error) {
    console.error("Error al obtener pendientes:", error);
    throw error;
  }
}

// Obtener ATENDIDOS de un ESTUDIANTE
export async function getAtendidosDe(usuarioId) {
  try {
    const url = `http://localhost:3001/tiquetes?estado=atendido&usuarioId=${encodeURIComponent(usuarioId)}`;
    const resp = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} al obtener atendidos del estudiante`);
    }

    return await resp.json();
  } catch (error) {
    console.error("Error al obtener atendidos:", error);
    throw error;
  }
}

// Marcar ATENDIDO (rápido, sin respuesta)
export async function marcarAtendido(tiqueteId) {
  try {
    const payload = { estado: "atendido" };

    const respuesta = await fetch(`http://localhost:3001/tiquetes/${tiqueteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al marcar atendido`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error al marcar atendido:", error);
    throw error;
  }
}

// Responder un tiquete (profesor)
export async function responderTiquete(tiqueteId, respuestaTexto, profesorUsuario) {
  try {
    const payload = {
      estado: "atendido",
      respuesta: (respuestaTexto ?? "").trim(),
      respondidoPor: profesorUsuario,
      fechaRespuesta: new Date().toISOString()
    };

    const resp = await fetch(`http://localhost:3001/tiquetes/${tiqueteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} al responder tiquete`);
    }

    return await resp.json();
  } catch (error) {
    console.error("Error al responder tiquete:", error);
    throw error;
  }
}

// BORRAR un tiquete (profesor)
export async function borrarTiquete(tiqueteId) {
  try {
    const respuesta = await fetch(`http://localhost:3001/tiquetes/${tiqueteId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al borrar tiquete`);
    }

    try {
      return await respuesta.json();
    } catch {
      return true;
    }
  } catch (error) {
    console.error("Error al borrar tiquete:", error);
    throw error;
  }
}