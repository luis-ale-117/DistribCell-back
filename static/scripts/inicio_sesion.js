// @ts-ignore
const form = document.getElementById('form-inicio-sesion');
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
  form.correo.value = form.correo.value.trim();
  const correo = form?.correo.value;
  const contrasena = form?.contrasena.value;
  if (correo === '') {
    return 'Correo requerido';
  }
  if (contrasena === '') {
    return 'Contraseña requerida';
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
