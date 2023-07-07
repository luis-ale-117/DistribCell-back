
// @ts-ignore
const form = document.getElementById('form-registro-usuario');

// @ts-ignore
const validar_datos = form => {
  if (form === null) {
    alert('Formualrio no encontrado')
    return false
  }
  form.nombre.value = form.nombre.value.trim()
  form.apellido.value = form.apellido.value.trim()
  form.correo.value = form.correo.value.trim()

  const nombre = form.nombre.value
  const apellido = form.apellido.value
  const correo = form.correo.value
  const contrasena = form.contrasena.value
  const contrasena2 = form.contrasena2.value

  if(nombre === ''){
    alert('Nombre requerido')
    return false
  }
  if(apellido === ''){
    alert('Apellido requerido')
    return false
  }
  if(correo === ''){
    alert('Correo requerido')
    return false
  }
  if(contrasena === ''){
    alert('Contraseña requerida')
    return false
  }
  if(contrasena !== contrasena2){
    alert('Las contraseñas no son iguales')
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
