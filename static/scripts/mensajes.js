
const botonesCerrarMensaje = Array.from(document.getElementsByClassName('cerrar-mensaje'))

botonesCerrarMensaje?.forEach(boton => {
    boton?.addEventListener('click', _ => {
        boton.parentElement?.classList.add('invisible')
    })
})