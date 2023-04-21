package main

import (
	"fmt"
	"syscall/js"

	"github.com/luis-ale-117/cella"
)

// Creates a rule for JavaScript
func Rule2d(this js.Value, args []js.Value) interface{} {
	condition := args[0].String()
	state := args[1].Int()
	jsRule := js.Global().Get("Object").New()
	jsRule.Set("condition", condition)
	jsRule.Set("state", state)
	return jsRule
}

// Creates a cellular automaton for JavaScript
func CellularAumtomaton(this js.Value, args []js.Value) interface{} {
	// Create cellular automaton
	numStates := args[0].Int()
	width := args[1].Int()
	height := args[2].Int()
	ca := cella.NewCella2d(width, height, numStates)
	ca.SetInitGrid(cella.NewGrid(width, height))
	ca.SetNextGrid(cella.NewGrid(width, height))

	// JavaScript object attributes
	jsCa := js.Global().Get("Object").New()
	jsCa.Set("width", width)
	jsCa.Set("height", height)
	jsCa.Set("numStates", numStates)

	// JavaScript object functions
	jsCa.Set("getInitGrid", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		bytesMatrix := ca.InitGrid.Cells
		// Cast byte matrix to a interface{} array of interface{} arrays
		matrixInterface := make([]interface{}, len(bytesMatrix))
		for i, v := range bytesMatrix {
			matrixInterface[i] = make([]interface{}, len(v))
			for j, w := range v {
				matrixInterface[i].([]interface{})[j] = byte(w)
			}
		}
		return matrixInterface
	}))
	jsCa.Set("setRules", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		numStates := len(ca.GetStates())
		rules := args[0]
		length := rules.Length()
		rulesArray := make([]*cella.Rule2d, length)
		for i := 0; i < length; i++ {
			rule := rules.Index(i)
			condition := rule.Get("condition").String()
			state := cella.Cell(rule.Get("state").Int())
			rulesArray[i] = cella.NewRule2d(condition, state, numStates)
		}
		ca.SetRules(rulesArray)
		return nil
	}))
	jsCa.Set("getRules", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		rules := ca.GetRules()
		// Cast rules to a interface{} array of interface{} arrays
		rulesInterface := make([]interface{}, len(rules))
		for i, v := range rules {
			r := js.Global().Get("Object").New()
			r.Set("condition", v.GetCondition())
			r.Set("state", int(v.GetState()))
			rulesInterface[i] = r
		}
		return rulesInterface
	}))
	jsCa.Set("loadInitGrid", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// Gheck matrix dimensions
		matrix := args[0]
		if matrix.Length() != ca.Height {
			return "Matrix dimensions do not match"
		}
		for y := 0; y < matrix.Length(); y++ {
			row := matrix.Index(y)
			if row.Length() != ca.Width {
				return "Matrix dimensions do not match"
			}
			for x := 0; x < row.Length(); x++ {
				value := row.Index(x).Int()
				if value < 0 || value >= ca.NumStates {
					return "Matrix values do not match with number of states"
				}
			}
		}
		// Load matrix to init grid
		for y := 0; y < ca.Height; y++ {
			for x := 0; x < ca.Width; x++ {
				value := matrix.Index(y).Index(x).Int()
				ca.InitGrid.SetCell(x, y, cella.Cell(value))
			}
		}
		return nil
	}))
	jsCa.Set("step", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ca.SetAuxBordersAsToroidal()
		err := ca.NextGeneration()
		if err != nil {
			fmt.Println(err)
			return err.Error()
		}
		ca.InitGrid, ca.NextGrid = ca.NextGrid, ca.InitGrid
		return nil
	}))
	jsCa.Set("printAuxBorders", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		ca.SetAuxBordersAsToroidal()
		auxUp := ca.InitGrid.GetAuxBorderUp()
		auxDown := ca.InitGrid.GetAuxBorderDown()
		auxLeft := ca.InitGrid.GetAuxBorderLeft()
		auxRight := ca.InitGrid.GetAuxBorderRight()
		fmt.Println("Aux Up:   ", auxUp)
		fmt.Println("Aux Down: ", auxDown)
		fmt.Println("Aux Left: ", auxLeft)
		fmt.Println("Aux Right:", auxRight)
		return nil
	}))
	jsCa.Set("updateConfig", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// Create cellular automaton
		numStates = args[0].Int()
		width = args[1].Int()
		height = args[2].Int()
		ca = cella.NewCella2d(width, height, numStates)
		ca.SetInitGrid(cella.NewGrid(width, height))
		ca.SetNextGrid(cella.NewGrid(width, height))

		// JavaScript object attributes
		jsCa.Set("width", width)
		jsCa.Set("height", height)
		jsCa.Set("numStates", numStates)
		return nil
	}))

	return jsCa
}

func main() {
	fmt.Println("Hello from Go!")
	wait := make(chan struct{})
	js.Global().Set("Rule2d", js.FuncOf(Rule2d))
	js.Global().Set("CellularAumtomaton", js.FuncOf(CellularAumtomaton))
	<-wait
}
