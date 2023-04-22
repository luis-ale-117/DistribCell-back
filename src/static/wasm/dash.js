
const playground = document.getElementById('grid');
const btnStep = document.getElementById('btnStep');
const caConfigForm = document.getElementById('ca-configForm')
const caRulesForm = document.getElementById('ca-rulesForm')
const caRulesList = document.getElementById('ca-rulesList')
const caStatesColors = document.getElementById('ca-statesColors')

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
                cell.dataset.state = cellMatrix[i][j]
                cell.dataset.x = j
                cell.dataset.y = i
                //////// Only game of life by now
                cell.style.width = "20px"
                cell.style.height = "20px"
                cell.style.border = "1px solid black"
                cell.style.backgroundColor = statesColors[cellMatrix[i][j]]
                //cell.textContent = cellMatrix[i][j]
                row.appendChild(cell)
            }
            tableCA.appendChild(row)
        }
        tableCA.addEventListener('click', (e) => {
            if (e.target.tagName == 'TD') {
                cellMatrix[e.target.dataset.y][e.target.dataset.x] = selectedState
                loadMatrixOnUI(cellMatrix)
            }
        })
        fragment.appendChild(tableCA)
        playground.appendChild(fragment)
    }
    const loadRulesOnUI = (rules) => {
        while (caRulesList.firstChild) {
            caRulesList.removeChild(caRulesList.firstChild);
        }
        fragment = document.createDocumentFragment()
        for (let i = 0; i < rules.length; i++) {
            rule = document.createElement('li')
            condition = document.createElement('span')
            state = document.createElement('span')
            condition.textContent = rules[i].condition + " -> "
            state.textContent = rules[i].state
            rule.appendChild(condition)
            rule.appendChild(state)
            btnDelete = document.createElement('button')
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
        fragment = document.createDocumentFragment()
        statesLabelRow = document.createElement('tr')
        statesColorRow = document.createElement('tr')
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
                console.log(selectedState)
                console.log(selectedStateTD)

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
    loadRulesOnUI(rules)
    loadStatesColorsOnUI(statesColors)
    selectedStateTD = caStatesColors.firstChild?.firstChild
    selectedStateTD.style.backgroundColor = "#aaff00" // Green bright
    console.log(selectedStateTD)
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
        // Make a copy of the matrix to be able to modify it
        cellMatrix = JSON.parse(JSON.stringify(cellMatrix))
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
        // Make a copy of the matrix to be able to modify it
        cellMatrix = JSON.parse(JSON.stringify(cellMatrix))
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
});
} else {
console.error('Invalid WebAssembly binary file');
}
})
.catch(err => {
console.error(err);
});