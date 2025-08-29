// Crear un tiquete (estudiante)
export async function crearTiquete(usuarioActual, consultaTexto) {
  try {
    const nuevoTiquete = {
      usuarioId: usuarioActual.id,
      nombre: usuarioActual.usuario,
      consulta: (consultaTexto ?? "").trim(),
      fechaHora: new Date().toISOString(),
      estado: "pendiente"
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

// Listar pendientes de un estudiante
export async function getPendientesDe(usuarioId) {
  try {
    const respuesta = await fetch("http://localhost:3001/tiquetes?estado=pendiente&usuarioId=" + usuarioId, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al cargar pendientes`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error al cargar pendientes:", error);
    throw error;
  }
}


// Historial de tiquetes atendidos
export async function getHistorial() {
  try {
    const respuesta = await fetch("http://localhost:3001/tiquetes", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al cargar historial`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error al cargar historial:", error);
    throw error;
  }
}

// Marcar un tiquete como atendido
export async function marcarAtendido(tiqueteId) {
  try {
    const respuesta = await fetch("http://localhost:3001/tiquetes/" + tiqueteId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "atendido" })
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al actualizar tiquete`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error al actualizar tiquete:", error);
    throw error;
  }
}

export async function borrarTiquete(tiqueteId) {
  try {
    const respuesta = await fetch("http://localhost:3001/tiquetes/" + tiqueteId, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al borrar tiquete`);
    }

    // json-server normalmente responde 200 con {} en DELETE.
    // Si viniera 204 (sin contenido), evita fallar al hacer .json()
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