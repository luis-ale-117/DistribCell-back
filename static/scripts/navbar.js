
const navOpciones = document.getElementById('navOpciones')
const btnHamburguesa = document.getElementById('btnHamburguesa')

btnHamburguesa?.addEventListener("click", () => {
    navOpciones?.classList.add('active');
})

const textElement = document.getElementById("typed-text");

function typeWriter(index) {
    if (index < textElement.textContent.length) {
        textElement.textContent;
        setTimeout(() => {
            typeWriter(textElement.textContent, index + 1);
        }, 1000);
    }
}

typeWriter(textElement.textContent, 0);
