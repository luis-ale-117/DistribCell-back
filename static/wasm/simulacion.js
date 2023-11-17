/** @type {HTMLHeadingElement} */
const simNombre = document.getElementById('simNombre');
/** @type {HTMLTableElement} */
const tabColorEstados = document.getElementById('tabColorEstados');
/** @type {HTMLInputElement} */
const rangoHistorialAutomata = document.getElementById('rangoHistorialAutomata');
/** @type {HTMLHeadingElement} */
const labelRangoHistorialAutomata = document.getElementById('labelRangoHistorialAutomata');
/** @type {HTMLInputElement} */
const numEstados = document.getElementById('numEstados');
/** @type {HTMLCanvasElement} */
const canvasGrid = document.getElementById('canvasGrid');
/** @type {CanvasRenderingContext2D} */
const ctx = canvasGrid?.getContext('2d');


const TAM_CELDA = 10;  // Tamaño de la celda en píxeles
const SIM_ID = simNombre.dataset.id

let ejecutando = false
let colorEstados = ["#000000", "#ffffff"]
/** @type {number[][][]} */
let historialAutomata = []
/** @type {number[][]} */
let matrizCelulas = []

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
 * @param {string[]} colorEstados
 */
const cargarColorEstadosInterfaz = (colorEstados) => {
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

/**
 * Convierte hsl a hex
 * @param {number} h 
 * @param {number} s 
 * @param {number} l 
 * @returns {string}
 */
const hslToHex = (h, s, l) => {
    // Convert hue to degrees
    h /= 360;
    // Convert saturation and lightness to 0-1 range
    s /= 100;
    l /= 100;
    // Calculate RGB values
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        /**
         * Hue a RGB
         * @param {number} p 
         * @param {number} q 
         * @param {number} t 
         * @returns {number}
         */
        const hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }
    // Convert RGB values to hex format
    /**
     * A hex
     * @param {number} c
     * @returns {string}
     */
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
}
/**
 * Asigna colores del arcoiris a cada estado de acuerdo al numero de estados
 * @param {number} numEstados 
 * @param {number} saturation 
 * @param {number} lightness 
 */
const asignaColorArcoiris = (numEstados, saturation = 100, lightness = 50) => {
    const hueIncrement = 360 / numEstados
    let hue = 0
    colorEstados = []
    for (let i = 0; i < numEstados; i++) {
        const color = hslToHex(hue, saturation, lightness)
        colorEstados.push(color)
        hue += hueIncrement
    }
}

rangoHistorialAutomata.addEventListener('input', (e) => {
    const indice = parseInt(e.target?.value)
    matrizCelulas = historialAutomata[indice]
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
        await fetch(`/simulaciones/${SIM_ID}/generaciones?`+ new URLSearchParams({inicio: inicio.toString(), fin: fin.toString()}), {
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
    labelRangoHistorialAutomata.textContent = `Generación 0 de ${historialAutomata.length - 1} `
    dibujaMatrizInterfaz(historialAutomata[0], colorEstados);
    matrizCelulas = historialAutomata[0]
}

asignaColorArcoiris(parseInt(numEstados.value));
cargarColorEstadosInterfaz(colorEstados);

cargaSimulacionInterfaz();