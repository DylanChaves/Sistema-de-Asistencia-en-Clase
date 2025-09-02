export async function obtenerUsuario(usuario, contrasena) {
  try {
    const resp = await fetch("http://localhost:3001/usuarios", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const usuarios = await resp.json();

    
    const encontrado = usuarios.find(u =>
      u.usuario === usuario && u.contrasena === contrasena
    );

    return encontrado || null;
  } catch (error) {
    console.error("Error al validar usuario:", error);
    throw error;
  }
}

export async function registrarUsuario({ usuario, contrasena, rol }) {
  try {
    const resp = await fetch("http://localhost:3001/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena, rol })
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} al registrar usuario`);
    }

    return await resp.json();
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

export async function getProfesores() {
  try {
    const resp = await fetch("http://localhost:3001/usuarios?rol=profesor", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (e) {
    console.error("Error al obtener profesores:", e);
    throw e;
  }
}