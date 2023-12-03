// @ts-ignore
const form = document.getElementById('form-registro-usuario');
// @ts-ignore
const divMensajes = document.getElementById('mensajes');
/**
 * Genera un mensaje en la interfaz
 * @param {string} mensaje
 * @param {string} tipo error, info, advertencia, exito
 */
function generaMensaje(mensaje, tipo = 'error') {
  if (!divMensajes) return;
  const divMensaje = document.createElement('div');
  divMensaje.classList.add('alerta');
  divMensaje.classList.add(tipo);
  divMensaje.textContent = mensaje;

  const botonCerrar = document.createElement('button');
  botonCerrar.classList.add('cerrar-mensaje');
  botonCerrar.textContent = 'Cerrar';
  botonCerrar.addEventListener('click', (_) => {
    botonCerrar.parentElement?.classList.add('invisible');
  });

  divMensaje.appendChild(botonCerrar);
  divMensajes.appendChild(divMensaje);
}

// @ts-ignore
const validar_datos = (form) => {
  if (form === null) {
    return 'Formualrio no encontrado';
  }
  form.nombre.value = form.nombre.value.trim();
  form.apellido.value = form.apellido.value.trim();
  form.correo.value = form.correo.value.trim();

  const nombre = form.nombre.value;
  const apellido = form.apellido.value;
  const correo = form.correo.value;
  const contrasena = form.contrasena.value;
  const contrasena2 = form.contrasena2.value;

  if (nombre === '') {
    return 'Nombre requerido';
  }
  if (apellido === '') {
    return 'Apellido requerido';
  }
  if (correo === '') {
    return 'Correo requerido';
  }
  if (contrasena === '') {
    return 'Contraseña requerida';
  }
  if (contrasena !== contrasena2) {
    return 'Las contraseñas no coinciden';
  }

  return null;
};

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const mensaje = validar_datos(form);
  if (mensaje !== null) {
    generaMensaje(mensaje, 'error');
    return;
  }
  // @ts-ignore
  form.submit();
});
