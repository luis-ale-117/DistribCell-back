
const playground = document.getElementById('grid');
const btnStep = document.getElementById('btnStep');
const caConfigForm = document.getElementById('ca-configForm')
const caRulesForm = document.getElementById('ca-rulesForm')
const caRulesList = document.getElementById('ca-rulesList')
const caStatesColors = document.getElementById('ca-statesColors')
const caSpeed = document.getElementById('ca-speed')

const go = new Go();
fetch('/static/wasm/main.wasm') // Path to the WebAssembly binary file
.then(response => response.arrayBuffer())
.then(buffer => {
if (WebAssembly.validate(buffer)) {
// Load the WebAssembly module
WebAssembly.instantiate(buffer, go.importObject).then(result => {
go.run(result.instance);
    let statesColors = ["#000000", "#ffffff"]
    let selectedState = 0
    let selectedStateTD = null
    let excecutionSpeed = 1000
    const conf = {
        numStates: parseInt(caConfigForm.elements['ca-numStates'].value),
        width: parseInt(caConfigForm.elements['ca-width'].value),
        height: parseInt(caConfigForm.elements['ca-height'].value)
    }
    const ca = CellularAumtomaton(conf.numStates, conf.width, conf.height)
    // Default (Conway's game of life) TODO: Load from USER
    let rules = [
        Rule2d("n11 == 1 && (s1 == 2 || s1 == 3)", 1),
        Rule2d("n11 == 0 && s1 == 3", 1),
        Rule2d("0==0", 0)
    ]
    let caExecuteFlag = false
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
        const fragment = document.createDocumentFragment()
        const tableCA = document.createElement('table')
        tableCA.style.backgroundColor = 'white'
        for (let i = 0; i < conf.height; i++) {
            const row = document.createElement('tr')
            for (let j = 0; j < conf.width; j++) {
                const cell = document.createElement('td')
                cell.dataset.state = cellMatrix[i][j]
                cell.dataset.x = j
                cell.dataset.y = i
                //////// Only game of life by now
                cell.style.width = "20px"
                cell.style.height = "20px"
                cell.style.border = "1px solid black"
                cell.style.backgroundColor = statesColors[cellMatrix[i][j]]
                row.appendChild(cell)
            }
            tableCA.appendChild(row)
        }
        tableCA.addEventListener('click', (e) => {
            if (e.target.tagName == 'TD') {
                newState = parseInt(selectedState)
                x = parseInt(e.target.dataset.x)
                y = parseInt(e.target.dataset.y)
                e.target.dataset.state = newState
                cellMatrix[y][x] = newState
                ca.updateCellState(x, y, newState)
                loadMatrixOnUI(cellMatrix) // Just update the matrix on the UI
            }
        })
        fragment.appendChild(tableCA)
        playground.appendChild(fragment)
    }
    const loadRulesOnUI = (rules) => {
        while (caRulesList.firstChild) {
            caRulesList.removeChild(caRulesList.firstChild);
        }
        const fragment = document.createDocumentFragment()
        for (let i = 0; i < rules.length; i++) {
            const rule = document.createElement('li')
            const condition = document.createElement('span')
            const state = document.createElement('span')
            const btnDelete = document.createElement('button')
            condition.textContent = rules[i].condition + " -> "
            state.textContent = rules[i].state
            rule.appendChild(condition)
            rule.appendChild(state)
            btnDelete.textContent = "Borrar"
            btnDelete.addEventListener('click', () => {
                rules.splice(i, 1)
                loadRulesOnUI(rules)
                ca.setRules(rules)
            })
            rule.appendChild(btnDelete)
            fragment.appendChild(rule)
        }
        caRulesList.appendChild(fragment)
    }
    const loadStatesColorsOnUI = (statesColors) => {
        while (caStatesColors.firstChild) {
            caStatesColors.removeChild(caStatesColors.firstChild);
        }
        const fragment = document.createDocumentFragment()
        const statesLabelRow = document.createElement('tr')
        const statesColorRow = document.createElement('tr')
        for (let i = 0; i < statesColors.length; i++) {
            const state = document.createElement('td')
            const color = document.createElement('td')
            const colorPicker = document.createElement('input')
            state.textContent = i
            state.dataset.state = i
            state.addEventListener('click', () => {
                if (selectedStateTD != null) {
                    selectedStateTD.style.backgroundColor = "" // Previous selected state background color reset
                }
                selectedStateTD = state
                state.style.backgroundColor = "#aaff00" // Green bright
                selectedState = state.dataset.state

            })
            colorPicker.setAttribute('type', 'color')
            colorPicker.value = statesColors[i]
            colorPicker.dataset.state = i
            colorPicker.style.width = "20px"
            colorPicker.style.height = "20px"
            colorPicker.style.border = "1px solid black"
            colorPicker.addEventListener('change', () => {
                statesColors[colorPicker.dataset.state] = colorPicker.value
                loadMatrixOnUI(cellMatrix)
            })
            color.appendChild(colorPicker)
            statesLabelRow.appendChild(state)
            statesColorRow.appendChild(color)
        }
        fragment.appendChild(statesLabelRow)
        fragment.appendChild(statesColorRow)
        caStatesColors.appendChild(fragment)
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
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hueToRgb(p, q, h + 1/3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1/3);
        }
        // Convert RGB values to hex format
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }
    const assignRainbowColors = (numStates, saturation = 100, lightness = 50) => {
        const hueIncrement = 360 / numStates
        let hue = 0
        statesColors = []
        for (let i = 0; i < numStates; i++) {
            const color = hslToHex(hue, saturation, lightness)
            statesColors.push(color)
            hue += hueIncrement
        }
    }
    const caExecute = async () => {
        // Execute the CA
        while (true) {
            if (!caExecuteFlag) {
                // sleep for 100 ms
                await new Promise(r => setTimeout(r, 100));
                continue
            }
            // sleep for 1 second
            await new Promise(r => setTimeout(r, excecutionSpeed));
            err = ca.step()
            if (err != null) {
                console.error("Error:", err)
                alert("Error when executing: " + err);
                return
            }
            cellMatrix = ca.getInitGrid()
            // Make a copy of the matrix to be able to modify it
            cellMatrix = JSON.parse(JSON.stringify(cellMatrix))
            // Update the grid in the UI
            loadMatrixOnUI(cellMatrix)
        }
    }
    //////////////////
    btnStep.textContent = caExecuteFlag ? "Pausa" : "Ejecuta"
    loadRulesOnUI(rules)
    loadStatesColorsOnUI(statesColors)
    selectedStateTD = caStatesColors.firstChild?.firstChild
    selectedStateTD.style.backgroundColor = "#aaff00" // Green bright
    ca.setRules(rules)
    // Default a random matrix. TODO: Listen for user changes on UI
    err = ca.loadInitGrid(randomMatrix(conf.width, conf.height,conf.numStates))
    if (err != null) {
        alert("An error occurred when loading initial matrix" + err);
        return
    }
    cellMatrix = ca.getInitGrid()
    // Make a copy of the matrix to be able to modify it
    cellMatrix = JSON.parse(JSON.stringify(cellMatrix))
    // First load of the matrix on the UI
    loadMatrixOnUI(cellMatrix)

    // Execute the CA
    caExecute()

    //////////////////////////////////////////////
    btnStep.addEventListener('click', () => {
        caExecuteFlag = !caExecuteFlag
        btnStep.textContent = caExecuteFlag ? "Pausa" : "Ejecuta"
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
        // Make a copy of the matrix to be able to modify it
        cellMatrix = JSON.parse(JSON.stringify(cellMatrix))
        assignRainbowColors(conf.numStates)
        loadStatesColorsOnUI(statesColors)
        selectedStateTD = caStatesColors.firstChild?.firstChild
        selectedStateTD.style.backgroundColor = "#aaff00" // Green bright
        loadMatrixOnUI(cellMatrix)
    })
    caRulesForm.addEventListener('submit', (e) => {
        e.preventDefault()
        condition = caRulesForm.elements['ca-condition'].value
        state = parseInt(caRulesForm.elements['ca-state'].value)
        if (condition == "") {
            return
        }
        rules.push(Rule2d(condition, state))
        loadRulesOnUI(rules)
        ca.setRules(rules)
        caRulesForm.elements['ca-condition'].value = ""
        caRulesForm.elements['ca-state'].value = ""
    })
    caSpeed.addEventListener('change', (e) => {
        excecutionSpeed = parseInt(e.target.value)
    })
});
} else {
console.error('Invalid WebAssembly binary file');
}
})
.catch(err => {
console.error(err);
});