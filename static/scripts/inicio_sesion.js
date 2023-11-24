
// @ts-ignore
const form = document.getElementById('form-inicio-sesion');

// @ts-ignore
const validar_datos = form => {
  if (form === null) {
    alert('Formualrio no encontrado')
    return false
  }
  form.correo.value = form.correo.value.trim()
  const correo = form?.correo.value
  const contrasena = form?.contrasena.value
  if(correo === ''){
    alert('Correo requerido')
    return false
  }
  if(contrasena === ''){
    alert('Contraseña requerida')
    return false
  }
  return true
}

form?.addEventListener('submit',  e => {
  e.preventDefault();
  if (!validar_datos(form)){
    return
  }
  // @ts-ignore
  form.submit()
})
