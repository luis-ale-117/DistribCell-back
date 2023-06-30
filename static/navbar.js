menu = document.querySelector('btnToggle')
links = document.querySelector('nav-ul')
menu.addEventListener("click", () => {
    links.addClass('active');
    console.log("Se activo el boton")
})