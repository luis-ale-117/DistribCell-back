// @ts-nocheck
const divGrid = document.getElementById('grid');
const botonPausa = document.getElementById('botonPausa');
const formConfiguracion = document.getElementById('formConfiguracion')
const formReglas = document.getElementById('formReglas')
const listaReglas = document.getElementById('listaReglas')
const tabColorEstados = document.getElementById('tabColorEstados')
const selecVelocidad = document.getElementById('selecVelocidad')

/**
 * @type {HTMLCanvasElement}
 */
const canvasGrid = document.getElementById('canvasGrid');
const ctx = canvasGrid.getContext('2d');
const TAM_CELDA = 20;  // Tamaño de la celda en píxeles

const go = new Go();
fetch('/static/wasm/main.wasm') // Path to the WebAssembly binary file
    .then(response => response.arrayBuffer())
    .then(buffer => {
        if (WebAssembly.validate(buffer)) {
            // Load the WebAssembly module
            WebAssembly.instantiate(buffer, go.importObject).then(result => {
                go.run(result.instance);
                let colorEstados = ["#000000", "#ffffff"]
                let estadoSeleccionado = "0"
                let estadoSeleccionadoTD = null
                let velocidadEjecucion = 1000
                const conf = {
                    numEstados: parseInt(formConfiguracion.elements['numEstados'].value),
                    anchura: parseInt(formConfiguracion.elements['anchura'].value),
                    altura: parseInt(formConfiguracion.elements['altura'].value)
                }
                const automata = CellularAumtomaton(conf.numEstados, conf.anchura, conf.altura)
                // Default (Conway's game of life) TODO: Load from USER
                let reglas = [
                    Rule2d("n11 == 1 && (s1 == 2 || s1 == 3)", 1),
                    Rule2d("n11 == 0 && s1 == 3", 1),
                    Rule2d("0==0", 0)
                ]
                let ejecutando = false
                const matrizAleatoria = (anchura, altura, numEstados) => {
                    let matrix = [];
                    for (let i = 0; i < altura; i++) {
                        let row = [];
                        for (let j = 0; j < anchura; j++) {
                            row.push(Math.floor(Math.random() * numEstados));
                        }
                        matrix.push(row);
                    }
                    return matrix;
                }
                const dibujaMatrizInterfaz = (matrizCelulas) => {
                    if (matrizCelulas.length * TAM_CELDA > canvasGrid.width || matrizCelulas[0].length * TAM_CELDA > canvasGrid.height) {
                        canvasGrid.width = conf.anchura * TAM_CELDA
                        canvasGrid.height =  conf.altura * TAM_CELDA
                    }
                    ctx.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
                    for (let fila = 0; fila < matrizCelulas.length; fila++) {
                        for (let columna = 0; columna < matrizCelulas[0].length; columna++) {
                            ctx.fillStyle = colorEstados[matrizCelulas[fila][columna]];
                            ctx.fillRect(columna * TAM_CELDA, fila * TAM_CELDA, TAM_CELDA, TAM_CELDA);
                        }
                    }
                }
                const cargarMatrizInterfaz = (matrizCelulas) => {
                    // Remove all the children of the divGrid
                    while (divGrid.firstChild) {
                        divGrid.removeChild(divGrid.firstChild);
                    }
                    const fragment = document.createDocumentFragment()
                    const tabAutomata = document.createElement('table')
                    tabAutomata.style.backgroundColor = 'white'
                    for (let i = 0; i < conf.altura; i++) {
                        const row = document.createElement('tr')
                        for (let j = 0; j < conf.anchura; j++) {
                            const cell = document.createElement('td')
                            cell.dataset.estado = matrizCelulas[i][j]
                            cell.dataset.x = j
                            cell.dataset.y = i
                            //////// Only game of life by now
                            cell.style.width = "20px"
                            cell.style.height = "20px"
                            cell.style.border = "1px solid black"
                            cell.style.backgroundColor = colorEstados[matrizCelulas[i][j]]
                            row.appendChild(cell)
                        }
                        tabAutomata.appendChild(row)
                    }
                    tabAutomata.addEventListener('click', (e) => {
                        if (e.target.tagName == 'TD') {
                            newState = parseInt(estadoSeleccionado)
                            x = parseInt(e.target.dataset.x)
                            y = parseInt(e.target.dataset.y)
                            e.target.dataset.estado = newState
                            matrizCelulas[y][x] = newState
                            automata.updateCellState(x, y, newState)
                            cargarMatrizInterfaz(matrizCelulas) // Just update the matrix on the UI
                        }
                    })
                    fragment.appendChild(tabAutomata)
                    divGrid.appendChild(fragment)
                }
                const cargarReglasInterfaz = (reglas) => {
                    while (listaReglas.firstChild) {
                        listaReglas.removeChild(listaReglas.firstChild);
                    }
                    const fragment = document.createDocumentFragment()
                    for (let i = 0; i < reglas.length; i++) {
                        const regla = document.createElement('li')
                        const condicion = document.createElement('span')
                        const estado = document.createElement('span')
                        const botonBorrar = document.createElement('button')
                        condicion.textContent = reglas[i].condition + " -> "
                        estado.textContent = reglas[i].state
                        regla.appendChild(condicion)
                        regla.appendChild(estado)
                        botonBorrar.textContent = "Borrar"
                        botonBorrar.addEventListener('click', () => {
                            reglas.splice(i, 1)
                            cargarReglasInterfaz(reglas)
                            automata.setRules(reglas)
                        })
                        regla.appendChild(botonBorrar)
                        fragment.appendChild(regla)
                    }
                    listaReglas.appendChild(fragment)
                }
                const cargarColorEstadosInterfaz = (colorEstados) => {
                    while (tabColorEstados.firstChild) {
                        tabColorEstados.removeChild(tabColorEstados.firstChild);
                    }
                    const fragment = document.createDocumentFragment()
                    const filaEtiquetaEstados = document.createElement('tr')
                    const filaColorEstados = document.createElement('tr')
                    for (let i = 0; i < colorEstados.length; i++) {
                        const estado = document.createElement('td')
                        const color = document.createElement('td')
                        const colorPicker = document.createElement('input')
                        estado.textContent = i
                        estado.dataset.estado = i
                        estado.addEventListener('click', () => {
                            if (estadoSeleccionadoTD != null) {
                                estadoSeleccionadoTD.style.backgroundColor = "" // Previous selected estado background color reset
                            }
                            estadoSeleccionadoTD = estado
                            estado.style.backgroundColor = "#aaff00" // Green bright
                            estadoSeleccionado = estado.dataset.estado

                        })
                        colorPicker.setAttribute('type', 'color')
                        colorPicker.value = colorEstados[i]
                        colorPicker.dataset.estado = i
                        colorPicker.style.width = "20px"
                        colorPicker.style.height = "20px"
                        colorPicker.style.border = "1px solid black"
                        colorPicker.addEventListener('change', () => {
                            colorEstados[colorPicker.dataset.estado] = colorPicker.value
                            dibujaMatrizInterfaz(matrizCelulas)
                        })
                        color.appendChild(colorPicker)
                        filaEtiquetaEstados.appendChild(estado)
                        filaColorEstados.appendChild(color)
                    }
                    fragment.appendChild(filaEtiquetaEstados)
                    fragment.appendChild(filaColorEstados)
                    tabColorEstados.appendChild(fragment)
                }
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
                    const toHex = (c) => {
                        const hex = Math.round(c * 255).toString(16);
                        return hex.length === 1 ? "0" + hex : hex;
                    };
                    return "#" + toHex(r) + toHex(g) + toHex(b);
                }
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
                const ejecutaAutomata = async () => {
                    // Execute the CA
                    while (true) {
                        if (!ejecutando) {
                            // sleep for 100 ms
                            await new Promise(r => setTimeout(r, 100));
                            continue
                        }
                        // sleep for 1 second
                        await new Promise(r => setTimeout(r, velocidadEjecucion));
                        err = automata.step()
                        if (err != null) {
                            console.error("Error:", err)
                            alert("Error when executing: " + err);
                            return
                        }
                        matrizCelulas = automata.getInitGrid()
                        // Make a copy of the matrix to be able to modify it
                        matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
                        // Update the grid in the UI
                        dibujaMatrizInterfaz(matrizCelulas)
                    }
                }
                //////////////////
                botonPausa.textContent = ejecutando ? "Pausa" : "Ejecuta"
                cargarReglasInterfaz(reglas)
                cargarColorEstadosInterfaz(colorEstados)
                estadoSeleccionadoTD = tabColorEstados.firstChild?.firstChild
                estadoSeleccionadoTD.style.backgroundColor = "#aaff00" // Green bright
                automata.setRules(reglas)
                // Por defecto haz una matriz aleatoria
                err = automata.loadInitGrid(matrizAleatoria(conf.anchura, conf.altura, conf.numEstados))
                if (err != null) {
                    alert("Ocurrio un error al cargar la matriz inicial" + err);
                    return
                }
                matrizCelulas = automata.getInitGrid()
                // Haz una copia de la matriz para poder modificarla
                matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
                // Carga la matriz en la interfaz por primera vez
                canvasGrid.width = conf.anchura * TAM_CELDA
                canvasGrid.height = conf.altura * TAM_CELDA
                dibujaMatrizInterfaz(matrizCelulas)

                // Execute the CA
                ejecutaAutomata()

                //////////////////////////////////////////////
                botonPausa.addEventListener('click', () => {
                    ejecutando = !ejecutando
                    botonPausa.textContent = ejecutando ? "Pausa" : "Ejecuta"
                })

                formConfiguracion.addEventListener('submit', (e) => {
                    e.preventDefault()
                    conf.numEstados = parseInt(formConfiguracion.elements['numEstados'].value)
                    conf.anchura = parseInt(formConfiguracion.elements['anchura'].value)
                    conf.altura = parseInt(formConfiguracion.elements['altura'].value)
                    automata.updateConfig(conf.numEstados, conf.anchura, conf.altura)
                    // Default (Conway's game of life) TODO: Load from USER
                    automata.setRules(reglas)
                    err = automata.loadInitGrid(matrizAleatoria(conf.anchura, conf.altura, conf.numEstados))
                    if (err != null) {
                        alert("An error occurred when loading initial matrix" + err);
                        return
                    }
                    matrizCelulas = automata.getInitGrid()
                    // Make a copy of the matrix to be able to modify it
                    matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
                    asignaColorArcoiris(conf.numEstados)
                    cargarColorEstadosInterfaz(colorEstados)
                    estadoSeleccionadoTD = tabColorEstados.firstChild?.firstChild
                    estadoSeleccionadoTD.style.backgroundColor = "#aaff00" // Green bright
                    dibujaMatrizInterfaz(matrizCelulas)
                })
                formReglas.addEventListener('submit', (e) => {
                    e.preventDefault()
                    condicion = formReglas.elements['condicion'].value
                    estado = parseInt(formReglas.elements['estado'].value)
                    if (condicion == "") {
                        return
                    }
                    reglas.push(Rule2d(condicion, estado))
                    cargarReglasInterfaz(reglas)
                    automata.setRules(reglas)
                    formReglas.elements['condicion'].value = ""
                    formReglas.elements['estado'].value = ""
                })
                selecVelocidad.addEventListener('change', (e) => {
                    velocidadEjecucion = parseInt(e.target.value)
                })
                canvasGrid.addEventListener('mousedown', (e) => {
                    const x = Math.floor(e.offsetX / TAM_CELDA)
                    const y = Math.floor(e.offsetY / TAM_CELDA)
                    nuevoEstado = parseInt(estadoSeleccionado)
                    matrizCelulas[y][x] = nuevoEstado
                    automata.updateCellState(x, y, nuevoEstado)
                    ctx.fillStyle = colorEstados[nuevoEstado];
                    ctx.fillRect(x * TAM_CELDA, y * TAM_CELDA, TAM_CELDA, TAM_CELDA);
                });
            });
        } else {
            console.error('Invalid WebAssembly binary file');
        }
    })
    .catch(err => {
        console.error(err);
    });