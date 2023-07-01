
const navOpciones = document.getElementById('navOpciones')
const btnHamburguesa = document.getElementById('btnHamburguesa')

btnHamburguesa?.addEventListener("click", () => {
    navOpciones?.classList.add('active');
})