// @ts-nocheck
const divGrid = document.getElementById('grid');
const botonPausa = document.getElementById('botonPausa');
const formConfiguracion = document.getElementById('formConfiguracion');
const formReglas = document.getElementById('formReglas');
const listaReglas = document.getElementById('listaReglas');
const tabColorEstados = document.getElementById('tabColorEstados');
const rangoVelocidad = document.getElementById('rangoVelocidad');
const imgPausa = document.getElementById('imgPausa');
const rangoHistorialAutomata = document.getElementById('rangoHistorialAutomata');
const labelRangoHistorialAutomata = document.getElementById('labelRangoHistorialAutomata');
const botonGuardarHistorial = document.getElementById('botonGuardarHistorial');
const botonProcesarAutomata = document.getElementById('botonProcesarAutomata');

const IMAGEN_PAUSA = "/static/imgs/boton-de-pausa.png";
const IMAGEN_PLAY = "/static/imgs/boton-de-play.png";

/**
 * @type {HTMLCanvasElement}
 */
const canvasGrid = document.getElementById('canvasGrid');
const ctx = canvasGrid.getContext('2d');
const TAM_CELDA = 20;  // Tamaño de la celda en píxeles

// Metodo para mover un elemento en un array
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
}

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
                let estadoSeleccionadoInterfaz = null
                let velocidadEjecucion = 1000
                let historialAutomata = []
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
                    ctx.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
                    for (let fila = 0; fila < matrizCelulas.length; fila++) {
                        for (let columna = 0; columna < matrizCelulas[0].length; columna++) {
                            ctx.fillStyle = colorEstados[matrizCelulas[fila][columna]];
                            ctx.fillRect(columna * TAM_CELDA, fila * TAM_CELDA, TAM_CELDA, TAM_CELDA);
                        }
                    }
                }
                const cargarReglasInterfaz = (reglas) => {
                    while (listaReglas.firstChild) {
                        listaReglas.removeChild(listaReglas.firstChild);
                    }

                    const fragment = document.createDocumentFragment()
                    const tituloCondicion = document.createElement('th')
                    const tituloEstado = document.createElement('th')
                    const tituloBorrar = document.createElement('th')
                    tituloCondicion.textContent = "Condición"
                    tituloEstado.textContent = "Estado"
                    tituloBorrar.textContent = "Borrar"

                    const filaTitulo = document.createElement('tr')
                    filaTitulo.appendChild(tituloCondicion)
                    filaTitulo.appendChild(tituloEstado)
                    filaTitulo.appendChild(tituloBorrar)
                    fragment.appendChild(filaTitulo)

                    for (let i = 0; i < reglas.length; i++) {
                        const regla = document.createElement('tr');
                        regla.setAttribute('draggable', 'true')
                        regla.id = 'regla-' + i.toString()

                        const condicion = document.createElement('td');
                        condicion.textContent = reglas[i].condition
                        regla.appendChild(condicion)

                        const estado = document.createElement('td')
                        estado.textContent = reglas[i].state
                        regla.appendChild(estado)

                        const tdBotonBorrar = document.createElement('td')
                        tdBotonBorrar.dataset.tipo = "borrar"
                        tdBotonBorrar.dataset.posicion = i

                        const imgCerrar = document.createElement('img')
                        imgCerrar.src = "/static/imgs/cerrar.png"
                        tdBotonBorrar.appendChild(imgCerrar)

                        regla.appendChild(tdBotonBorrar)
                        fragment.appendChild(regla)
                    }
                    listaReglas.appendChild(fragment)
                }
                const cargarColorEstadosInterfaz = (colorEstados) => {
                    while (tabColorEstados.firstChild) {
                        tabColorEstados.removeChild(tabColorEstados.firstChild);
                    }

                    const filaEtiquetaEstados = document.createElement('tr')
                    const filaColorEstados = document.createElement('tr')
                    for (let i = 0; i < colorEstados.length; i++) {
                        const estado = document.createElement('td')
                        estado.textContent = i
                        estado.dataset.estado = i
                        estado.addEventListener('click', () => {
                            if (estadoSeleccionadoInterfaz != null) {
                                // Quita la clase seleccionado al estado seleccionado anteriormente
                                estadoSeleccionadoInterfaz.classList.remove('seleccionado')
                            }
                            // Añade la clase seleccionado al estado seleccionado
                            estadoSeleccionadoInterfaz = estado
                            estado.classList.add('seleccionado')
                            estadoSeleccionado = estado.dataset.estado

                        })

                        const colorPicker = document.createElement('input')
                        colorPicker.id = 'colorPicker-' + i.toString()
                        colorPicker.setAttribute('type', 'color')
                        colorPicker.value = colorEstados[i]
                        colorPicker.dataset.estado = i
                        colorPicker.addEventListener('change', () => {
                            colorEstados[colorPicker.dataset.estado] = colorPicker.value
                            dibujaMatrizInterfaz(matrizCelulas)
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
                const agregaHistorial = (matrizCelulas) => {
                    historialAutomata.push(matrizCelulas)
                    rangoHistorialAutomata.max = historialAutomata.length - 1
                    rangoHistorialAutomata.value = historialAutomata.length - 1
                    labelRangoHistorialAutomata.textContent = `Generación ${historialAutomata.length - 1} de ${historialAutomata.length - 1} `
                }
                const reiniciaHistorial = () => {
                    historialAutomata = []
                    rangoHistorialAutomata.max = 0
                    rangoHistorialAutomata.value = 0
                    labelRangoHistorialAutomata.textContent = `Generación 0 de 0 `
                }
                const ejecutaAutomata = async () => {
                    // Ejecuta el automata
                    while (true) {
                        if (!ejecutando) {
                            // Espera 100ms si no se está ejecutando
                            await new Promise(r => setTimeout(r, 100));
                            continue
                        }
                        // Espera de acuerdo a la velocidad de ejecución
                        await new Promise(r => setTimeout(r, velocidadEjecucion));
                        err = automata.step()
                        if (err != null) {
                            console.error("Error:", err)
                            // TODO: Error como mensaje, no como alert
                            alert("Ocurrio un error, revisa tus reglas: " + err);
                            ejecutando = false;
                            imgPausa.src = IMAGEN_PLAY
                            continue
                        }
                        matrizCelulas = automata.getInitGrid()
                        matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
                        agregaHistorial(matrizCelulas)

                        dibujaMatrizInterfaz(matrizCelulas)
                    }
                }
                //////////////////
                imgPausa.src = ejecutando ? IMAGEN_PAUSA : IMAGEN_PLAY
                cargarReglasInterfaz(reglas)
                cargarColorEstadosInterfaz(colorEstados)
                estadoSeleccionadoInterfaz = tabColorEstados.firstChild?.firstChild
                estadoSeleccionadoInterfaz.classList.add('seleccionado')
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
                agregaHistorial(matrizCelulas)

                ejecutaAutomata()

                //////////////////////////////////////////////
                botonPausa.addEventListener('click', () => {
                    ejecutando = !ejecutando
                    imgPausa.src = ejecutando ? IMAGEN_PAUSA : IMAGEN_PLAY
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
                        alert("Ocurrio un error cargando la matriz" + err);
                        ejecutando = false;
                        return
                    }
                    matrizCelulas = automata.getInitGrid()
                    matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))

                    reiniciaHistorial()
                    agregaHistorial(matrizCelulas)

                    asignaColorArcoiris(conf.numEstados)
                    cargarColorEstadosInterfaz(colorEstados)

                    estadoSeleccionadoInterfaz = tabColorEstados.firstChild?.firstChild
                    estadoSeleccionadoInterfaz.classList.add('seleccionado')
                    canvasGrid.width = conf.anchura * TAM_CELDA
                    canvasGrid.height = conf.altura * TAM_CELDA
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
                    let matrizCelulas = automata.getInitGrid()
                    matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
                    reiniciaHistorial()
                    agregaHistorial(matrizCelulas)
                })
                rangoVelocidad.addEventListener('change', (e) => {
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
                listaReglas.addEventListener('dragstart', (e) => {
                    e.dataTransfer?.setData('text/plain', e.target.id);
                    const elementosHermanos = Array.from(e.target?.parentNode?.children);
                    const indiceElemento = elementosHermanos.indexOf(e.target);
                });
                listaReglas.addEventListener('drag', (e) => {
                    e.target.classList.add('opaco');
                });
                listaReglas.addEventListener('dragend', (e) => {
                    e.target.classList.remove('opaco');
                });
                listaReglas.addEventListener('dragenter', (e) => {
                    if(e.target.tagName === 'TD') {
                        e.target.parentNode.classList.add('seleccionado');
                    }
                    else if (e.target.tagName === 'TR'){
                        e.target.classList.add('seleccionado');
                    }
                });
                listaReglas.addEventListener('dragleave', (e) => {
                    if(e.target.tagName === 'TD') {
                        e.target.parentNode.classList.remove('seleccionado');
                    }
                    else if (e.target.tagName === 'TR'){
                        e.target.classList.remove('seleccionado');
                    }
                });
                listaReglas.addEventListener('dragover', (e) => {
                    e.preventDefault();
                });
                listaReglas.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if (e.target.tagName !== 'TD' && e.target.tagName !== 'TR') {
                        return;
                    }
                    let destino;
                    if(e.target.tagName === 'TD') {
                        e.target.parentNode.classList.remove('seleccionado');
                        destino = e.target.parentNode;
                    }
                    else{
                        e.target.classList.remove('seleccionado');
                        destino = e.target;
                    }
                    const elemento = document.getElementById(e.dataTransfer?.getData('text/plain'));
                    const elementosHermanos = Array.from(destino?.parentNode?.children);
                    const indiceElemento = elementosHermanos.indexOf(elemento);
                    const indiceDestino = elementosHermanos.indexOf(destino);
                    if ( indiceElemento < indiceDestino) {
                        destino.after(elemento);
                    }
                    else{
                        destino.before(elemento);
                    }
                    reglas.move(indiceElemento-1, indiceDestino-1) // -1 porque el primer elemento es el titulo
                    automata.setRules(reglas)
                });
                listaReglas.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'IMG' && e.target.tagName !== 'TD') {
                        return;
                    }
                    let borrar;
                    if(e.target.tagName === 'IMG') {
                        borrar = e.target.parentNode;
                    }
                    else{
                        borrar = e.target;
                    }
                    if (borrar.dataset.tipo === "borrar") {
                        reglas.splice(parseInt(e.target.dataset.posicion), 1);
                        cargarReglasInterfaz(reglas);
                        automata.setRules(reglas);
                    }
                });
                rangoHistorialAutomata.addEventListener('input', (e) => {
                    const indice = parseInt(e.target.value)
                    const matrizCelulas = historialAutomata[indice]
                    if (matrizCelulas === undefined) {
                        alert("No hay un historial para esa generación")
                        return
                    }
                    labelRangoHistorialAutomata.textContent = `Generación ${indice} de ${historialAutomata.length - 1} `
                    dibujaMatrizInterfaz(matrizCelulas)
                });
                botonGuardarHistorial?.addEventListener('click', async () => {
                    // popup para guardar el nombre del historial
                    const nombreHistorial = prompt("Ingresa el nombre del historial")
                    const descripcionHistorial = prompt("Ingresa una descripción para el historial") // Opcional
                    if (nombreHistorial === null || nombreHistorial === "") {
                        alert("Agrega un nombre a tu simulación")
                        return;
                    }
                    // Paso 1: Crea la simulación
                    const simulacion = {
                        nombre: nombreHistorial,
                        descripcion: descripcionHistorial,
                        altura: conf.altura,
                        anchura: conf.anchura,
                        estados: conf.numEstados,
                        reglas: reglas,
                    }
                    let nuevaSimulacionId = null;
                    await fetch('/simulaciones', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(simulacion)
                    })
                        .then(response => {
                            if (!response.redirected) {
                                return response.json();
                            }
                            alert("Inicio de sesion requerido")
                            window.location.href = response.url;
                        })
                        .then(data => {
                            console.log(data);
                            nuevaSimulacionId = data.simulacion_id
                        })
                        .catch(err => {
                            console.error(err);
                            alert("Ocurrio un error guardando la simulación");
                            return;
                        });
                    
                    // Paso 2: Guarda el historial usando la simulacion creada
                    // Envia el historial en bloques de 10 generaciones
                    let historial = [];
                    error = null;
                    for (let i = 0; i < historialAutomata.length; i++) {

                        historial.push(historialAutomata[i])
                        if (historial.length === 10 || i === historialAutomata.length - 1) {
                            await fetch(`/simulaciones/${nuevaSimulacionId}/generaciones`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(historial)
                            })
                                .then(response => {
                                    if (response.redirected) {
                                        alert("Inicio de sesion requerido");
                                        window.location.href = response.url;
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    console.log(data);
                                    error = data.error;
                                    alert(data.error);
                                    return;
                                })
                                .catch(err => {
                                    console.error(err);
                                    alert("Ocurrio un error guardando el historial");
                                    return;
                                });
                            if (error) {
                                return;
                            }
                            historial = [];
                        }
                    }
                    alert("Simulación guardada correctamente");
                    window.location.href = "/simulaciones";
                });
                botonProcesarAutomata?.addEventListener('click', async () => {
                    // popup para guardar el nombre de la simulacion a procesar
                    const nombreProcesamiento = prompt("Ingresa el nombre de la simulación a procesar");
                    const descripcionProcesamiento = prompt("Ingresa una descripción para simulación a procesar"); // Opcional
                    const numGeneraciones = parseInt(prompt("Ingresa el numero de generaciones a procesar"));
                    if (nombreProcesamiento === null || nombreProcesamiento === "") {
                        alert("Agrega un nombre a tu simulación")
                        return;
                    }
                    // Paso 1: Crea la simulación
                    const indice = parseInt(rangoHistorialAutomata.value);
                    const simulacion = {
                        nombre: nombreProcesamiento,
                        descripcion: descripcionProcesamiento,
                        altura: conf.altura,
                        anchura: conf.anchura,
                        estados: conf.numEstados,
                        reglas: reglas,
                        numGeneraciones: numGeneraciones,
                        generacionInicial: historialAutomata[indice],
                    }
                    console.log(indice)
                    console.log(historialAutomata[indice])
                    let nuevaSimulacionId = null;
                    await fetch('/simulaciones/procesamiento', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(simulacion)
                    })
                        .then(response => {
                            if (!response.redirected) {
                                return response.json();
                            }
                            alert("Inicio de sesion requerido")
                            window.location.href = response.url;
                        })
                        .then(data => {
                            console.log(data);
                            nuevaSimulacionId = data.simulacion_id
                        })
                        .catch(err => {
                            console.error(err);
                            alert("Ocurrio un error guardando la simulación");
                            return;
                        });
                    if (nuevaSimulacionId){
                        alert("Simulación guardada correctamente");
                        window.location.href = "/simulaciones";
                    }
                    else {
                        alert("Ocurrio un error guardando la simulación");
                    }
                });
            });
        } else {
            console.error('Invalid WebAssembly binary file');
        }
    })
    .catch(err => {
        console.error(err);
    });