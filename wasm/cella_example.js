const go = new Go();
fetch('main.wasm') // Path to the WebAssembly binary file
    .then(response => response.arrayBuffer())
    .then(buffer => {
        if (WebAssembly.validate(buffer)) {
            // Load the WebAssembly module
            WebAssembly.instantiate(buffer, go.importObject).then(result => {
                go.run(result.instance);
                conf = {
                    numStates: 2,
                    width: 5,
                    height: 5
                }

                // Create a new CellularAumtomaton object
                // numStates: number of states of the cellular automaton
                // width: width of the grid (number of columns)
                // height: height of the grid (number of rows)
                let ca = CellularAumtomaton(conf.numStates, conf.width, conf.height)
                // The CellularAumtomaton object has the following attributes:
                // - numStates: number of states of the cellular automaton
                // - width: width of the grid
                // - height: height of the grid

                // The CellularAumtomaton object has the following methods:
                // - setRules(rules: Rule2d[]): void - set the rules of the cellular automaton
                // the rules are an array of Rule2d objects, ordered by priority
                // - getRules(): Rule2d[] - get the rules of the cellular automaton
                // - loadInitGrid(grid: number[][]): string | null - load the grid of the cellular automaton
                // overwrite the current grid
                // the grid is a matrix of numbers, where each number is the state of the cell
                // the grid must have the same dimensions as the cellular automaton
                // - getInitGrid(): number[][] - get the grid of the cellular automaton
                // - step(): string | null - perform one step of the cellular automaton and update the grid
                // - printAuxBorders(): void - print the auxiliary borders of the cellular automaton (for debugging purposes)
                
                // NOTE: Do not modify the grid directly, use the loadInitGrid method instead

                // The Rule2d object has the following attributes:
                // - condition: string - the condition of the rule
                // - state: number - the state of the cell after the rule is applied

                // console.log('The CellularAumtomaton is:', ca);
                // cellMatrix = ca.getInitGrid()
                // console.log('After creation the cellMatrix is:', cellMatrix);
                // rules = [
                //     Rule2d("n11 == 1 && (s1 == 2 || s1 == 3)", 1),
                //     Rule2d("n11 == 0 && s1 == 3", 1),
                //     Rule2d("0==0", 0)
                // ]
                // ca.setRules(rules)
                // ru = ca.getRules()
                // console.log('The rules are:', ru);

                // err = ca.loadInitGrid([
                //     [0, 0, 0, 0, 1],
                //     [0, 0, 0, 0, 1],
                //     [0, 0, 0, 0, 0],
                //     [0, 0, 0, 0, 0],
                //     [0, 0, 0, 0, 1],
                // ])
                // if (err != null) {
                //     console.log("Error:", err)
                // }
                // cellMatrix = ca.getInitGrid()
                // console.log('After load the cellMatrix is:')
                // for(const row of cellMatrix) {
                //     console.log(row)
                // }
                // ca.printAuxBorders()
                // err = ca.step()
                // if (err != null) {
                //     console.error("Error:", err)
                // }
                // cellMatrix = ca.getInitGrid()
                // console.log('After one step the cellMatrix is:')
                // for(const row of cellMatrix) {
                //     console.log(row)
                // }
                // ca.printAuxBorders()
            });
        } else {
            console.error('Invalid WebAssembly binary file');
        }
    })
    .catch(err => {
        console.error(err);
    });
