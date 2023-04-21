
const playground = document.getElementById('grid');
const btnStep = document.getElementById('btnStep');
const caConfigForm = document.getElementById('ca-configForm')

const go = new Go();
fetch('/static/wasm/main.wasm') // Path to the WebAssembly binary file
.then(response => response.arrayBuffer())
.then(buffer => {
if (WebAssembly.validate(buffer)) {
// Load the WebAssembly module
WebAssembly.instantiate(buffer, go.importObject).then(result => {
go.run(result.instance);
    const randomMatrix = (width, height, numStates) => {
        let matrix = [];
        for (let i = 0; i < height; i++) {
            let row = [];
            for (let j = 0; j < width; j++) {
                row.push(Math.floor(Math.random() * numStates));
            }
            matrix.push(row);
        }
        return matrix;
    }
    const loadMatrixOnUI = (cellMatrix) => {
        // Remove all the children of the playground
        while (playground.firstChild) {
            playground.removeChild(playground.firstChild);
        }
        fragment = document.createDocumentFragment()
        tableCA = document.createElement('table')
        tableCA.style.backgroundColor = 'white'
        for (let i = 0; i < conf.height; i++) {
            row = document.createElement('tr')
            for (let j = 0; j < conf.width; j++) {
                cell = document.createElement('td')
                cell.setAttribute('data-state', cellMatrix[i][j])
                cell.setAttribute('data-x', i)
                cell.setAttribute('data-y', j)
                //////// Only game of life by now
                cell.style.width = "20px"
                cell.style.height = "20px"
                cell.style.border = "1px solid black"
                cell.style.backgroundColor = cellMatrix[i][j] == 0 ? 'black': 'white'
                cell.style.color = cellMatrix[i][j] == 1 ? 'black': 'white'
                //cell.textContent = cellMatrix[i][j]
                row.appendChild(cell)
            }
            tableCA.appendChild(row)
        }
        fragment.appendChild(tableCA)
        playground.appendChild(fragment)
    }
    //////////////////
    let conf = {
        numStates: parseInt(caConfigForm.elements['ca-numStates'].value),
        width: parseInt(caConfigForm.elements['ca-width'].value),
        height: parseInt(caConfigForm.elements['ca-height'].value)
    }
    let ca = CellularAumtomaton(conf.numStates, conf.width, conf.height)
    // Default (Conway's game of life) TODO: Load from USER
    let rules = [
        Rule2d("n11 == 1 && (s1 == 2 || s1 == 3)", 1),
        Rule2d("n11 == 0 && s1 == 3", 1),
        Rule2d("0==0", 0)
    ]
    ca.setRules(rules)
    // Default a random matrix. TODO: Listen for user changes on UI
    err = ca.loadInitGrid(randomMatrix(conf.width, conf.height,conf.numStates))
    if (err != null) {
        alert("An error occurred when loading initial matrix" + err);
        return
    }
    cellMatrix = ca.getInitGrid()
    loadMatrixOnUI(cellMatrix)

    //////////////////////////////////////////////
    btnStep.addEventListener('click', () => {
        // Execute one step of the CA
        err = ca.step()
        if (err != null) {
            console.error("Error:", err)
            alert("Error when executing: " + err);
            return
        }
        cellMatrix = ca.getInitGrid()
        // Update the grid in the UI
        loadMatrixOnUI(cellMatrix)
    })

    caConfigForm.addEventListener('submit', (e) => {
        e.preventDefault()
        conf.numStates = parseInt(caConfigForm.elements['ca-numStates'].value),
        conf.width = parseInt(caConfigForm.elements['ca-width'].value),
        conf.height = parseInt(caConfigForm.elements['ca-height'].value)
        ca.updateConfig(conf.numStates, conf.width, conf.height)
        // Default (Conway's game of life) TODO: Load from USER
        ca.setRules(rules)
        err = ca.loadInitGrid(randomMatrix(conf.width, conf.height,conf.numStates))
        if (err != null) {
            alert("An error occurred when loading initial matrix" + err);
            return
        }
        cellMatrix = ca.getInitGrid()
        loadMatrixOnUI(cellMatrix)
    })
});
} else {
console.error('Invalid WebAssembly binary file');
}
})
.catch(err => {
console.error(err);
});