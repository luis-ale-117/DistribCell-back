/** @type {HTMLTableElement} */
const tabColorEstados = document.getElementById('tabColorEstados');
/** @type {HTMLInputElement} */
const rangoHistorialAutomata = document.getElementById('rangoHistorialAutomata');
/** @type {HTMLHeadingElement} */
const labelRangoHistorialAutomata = document.getElementById('labelRangoHistorialAutomata');
/** @type {HTMLCanvasElement} */
const canvasGrid = document.getElementById('canvasGrid');
/** @type {CanvasRenderingContext2D} */
const ctx = canvasGrid?.getContext('2d');


const TAM_CELDA = 20;  // Tamaño de la celda en píxeles

let colorEstados = ["#000000", "#ffffff"]
/** @type {number[][][]} */
let historialAutomata = []

/**
 * Dibuja una matriz en el canvas
 * @param {number[][] | null | undefined} matrizCelulas 
 * @param {string[]} colorEstados 
 */
const dibujaMatrizInterfaz = (matrizCelulas, colorEstados) => {
    if (canvasGrid === null || ctx === null) return;
    if (!matrizCelulas) return;
    if (matrizCelulas.length === 0) return;

    ctx.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
    for (let fila = 0; fila < matrizCelulas.length; fila++) {
        for (let columna = 0; columna < matrizCelulas[0].length; columna++) {
            ctx.fillStyle = colorEstados[matrizCelulas[fila][columna]];
            ctx.fillRect(columna * TAM_CELDA, fila * TAM_CELDA, TAM_CELDA, TAM_CELDA);
        }
    }
}


/**
 * Carga la tabla de colores en la interfaz
 * @param {number[][]} matrizCelulas 
 * @param {string[]} colorEstados 
 */
const cargarColorEstadosInterfaz = (matrizCelulas, colorEstados) => {
    if (tabColorEstados === null) return;

    while (tabColorEstados.firstChild) {
        tabColorEstados.removeChild(tabColorEstados.firstChild);
    }

    const filaEtiquetaEstados = document.createElement('tr')
    const filaColorEstados = document.createElement('tr')

    for (let i = 0; i < colorEstados.length; i++) {

        const estado = document.createElement('td')
        estado.textContent = i.toString()
        estado.dataset.estado = i.toString()

        const colorPicker = document.createElement('input')
        colorPicker.id = 'colorPicker-' + i.toString()
        colorPicker.setAttribute('type', 'color')
        colorPicker.value = colorEstados[i]
        colorPicker.dataset.estado = i.toString()
        colorPicker.addEventListener('change', () => {
            const estado = parseInt(colorPicker.dataset.estado ?? "0")
            colorEstados[estado] = colorPicker.value
            dibujaMatrizInterfaz(matrizCelulas, colorEstados)
        })

        const color = document.createElement('td')
        color.appendChild(colorPicker)
        filaEtiquetaEstados.appendChild(estado)
        filaColorEstados.appendChild(color)
    }
    const fragment = document.createDocumentFragment()
    fragment.appendChild(filaEtiquetaEstados)
    fragment.appendChild(filaColorEstados)
    tabColorEstados.appendChild(fragment)
}

rangoHistorialAutomata.addEventListener('input', (e) => {
    const indice = parseInt(e.target?.value)
    const matrizCelulas = historialAutomata[indice]
    if (matrizCelulas === undefined) {
        alert("No hay un historial para esa generacion")
        return
    }
    labelRangoHistorialAutomata.textContent = `Generación ${indice} de ${historialAutomata.length - 1} `
    dibujaMatrizInterfaz(matrizCelulas, colorEstados)
});

const cargaSimulacionInterfaz = async () => {
    let faltanMatrices = true
    let inicio = 0
    let fin = 10

    while (faltanMatrices){
        await fetch('/simulaciones/13/generaciones?'+ new URLSearchParams({inicio: inicio.toString(), fin: fin.toString()}), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.redirected) {
                alert("Inicio de sesion requerido");
                window.location.href = response.url;
            }
            if (response.status === 200) {
                return response.json();
            }
            alert("Ocurrio un error al cargar el historial");
            faltanMatrices = false;
        })
        .then( /** @param {number[][][]} data*/ data => {
            if (!Array.isArray(data)) {
                alert("Ocurrio un error: " + data);
                faltanMatrices = false;
                return;
            }
            if(data.length === 0) {
                faltanMatrices = false;
                return;
            }
            historialAutomata.push(...data);
            inicio = fin;
            fin += 10;
        })
        .catch(err => {
            console.error(err);
            alert("Ocurrio un error guardando el historial");
            faltanMatrices = false;
            return;
        });
    }
    rangoHistorialAutomata.max = (historialAutomata.length - 1).toString()
    rangoHistorialAutomata.value = "0"
    dibujaMatrizInterfaz(historialAutomata[0], colorEstados);
}



cargaSimulacionInterfaz();