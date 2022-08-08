import React from "react"
import { availableStock, stockSymbol } from "./stockSymbolsAndNames.js"

/* Component to select stock to plot. */
const StockSelector = ({ setSelectedStock, setTimeFrame }) => {

  /* Function to select all divs and remove class from each. */
  const removeSelection = () => {
    const allDivs = document.querySelectorAll("#div1, #div2, #div3")
    allDivs.forEach((div) => {
      div.classList.remove("buttonsselected")
    })
  }

  /* Function to select default div. This is also done in App.js = stupid.*/
  const selectDefault = () => {
    const defaultDiv = document.getElementById("div1")
    defaultDiv.classList.add("buttonsselected")
  }

  /* Event handler for select. */
  const selectStock = (event) => {
    setSelectedStock(event.target.value)
    removeSelection()
    selectDefault()
    setTimeFrame("-7") // Default timeFrame = -7
  }

  /* Event handler for button. */
  const handleClick = (value, event) => {
    setTimeFrame(value)
    removeSelection()

    /* Add class to selected div. */
    const selectedDiv = document.getElementById(event.target.id)
    selectedDiv.classList.add("buttonsselected")
  }

  return (
    <div id="selector">
      <select onChange={selectStock}>
        <option key="default" value="default">Valitse yhtiö</option>
        {availableStock.map(stock =>
          <option key={stock} value={stock}>{stockSymbol[stock]}</option>)}
      </select>
      <div id="buttons">
          Valitse ajanjakso:
          <div id="div1" onClick={(event) => handleClick("-7", event)}>7 päivää</div>
          <div id="div2" onClick={(event) => handleClick("-30", event)}>30 päivää</div>
          <div id="div3" onClick={(event) => handleClick("0", event)}>Kaikki data</div>
      </div>
    </div>
  )
}

export default StockSelector