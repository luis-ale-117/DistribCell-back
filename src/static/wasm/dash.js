
const playground = document.getElementById('grid');
const btnStep = document.getElementById('btnStep');

const go = new Go();
fetch('/static/wasm/main.wasm') // Path to the WebAssembly binary file
.then(response => response.arrayBuffer())
.then(buffer => {
    if (WebAssembly.validate(buffer)) {
        // Load the WebAssembly module
        WebAssembly.instantiate(buffer, go.importObject).then(result => {
            go.run(result.instance);
            // TODO: Get the numStates, width, height from the user
            conf = {
                numStates: 2,
                width: 7,
                height: 7
            }

            let ca = CellularAumtomaton(conf.numStates, conf.width, conf.height)
            console.log('The CellularAumtomaton is:', ca);
            cellMatrix = ca.getInitGrid()
            console.log('After creation the cellMatrix is:', cellMatrix);

            // TODO: Get the rules from the user
            rules = [
                Rule2d("n11 == 1 && (s1 == 2 || s1 == 3)", 1),
                Rule2d("n11 == 0 && s1 == 3", 1),
                Rule2d("0==0", 0)
            ]
            ca.setRules(rules)
            ru = ca.getRules()
            console.log('The rules are:', ru);

            // TODO: Get the initial grid from the user
            err = ca.loadInitGrid([
                [0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0]
            ])
            if (err != null) {
                console.log("Error:", err)
            }
            cellMatrix = ca.getInitGrid()

            fragment = document.createDocumentFragment()
            tableCA = document.createElement('table')
            tableCA.style.backgroundColor = 'white'
            for(let i = 0; i < conf.height; i++) {
                row = document.createElement('tr')
                for(let j = 0; j < conf.width; j++) {
                    cell = document.createElement('td')
                    cell.setAttribute('id', 'cell' + i + j)
                    cell.setAttribute('class', 'cell')
                    cell.setAttribute('data-state', cellMatrix[i][j])
                    cell.setAttribute('data-x', i)
                    cell.setAttribute('data-y', j)
                    cell.textContent = `${cellMatrix[i][j]}`

                    row.appendChild(cell)
                }
                tableCA.appendChild(row)
            }
            fragment.appendChild(tableCA)
            playground.appendChild(fragment)

            btnStep.addEventListener('click', () => {
                // Execute one step of the CA
                err = ca.step()
                if (err != null) {
                    console.error("Error:", err)
                    return
                }
                cellMatrix = ca.getInitGrid()
                // Update the grid in the UI
                while (playground.firstChild) {
                    // Remove all the children of the playground
                    playground.removeChild(playground.firstChild);
                }
                fragment = document.createDocumentFragment()
                tableCA = document.createElement('table')
                tableCA.style.backgroundColor = 'white'
                for(let i = 0; i < conf.height; i++) {
                    row = document.createElement('tr')
                    for(let j = 0; j < conf.width; j++) {
                        cell = document.createElement('td')
                        cell.setAttribute('id', 'cell' + i + j)
                        cell.setAttribute('data-state', cellMatrix[i][j])
                        cell.setAttribute('data-x', i)
                        cell.setAttribute('data-y', j)
                        cell.textContent = cellMatrix[i][j]

                        row.appendChild(cell)
                    }
                    tableCA.appendChild(row)
                }
                fragment.appendChild(tableCA)
                playground.appendChild(fragment)
            })
        });
    } else {
        console.error('Invalid WebAssembly binary file');
    }
})
.catch(err => {
    console.error(err);
});
