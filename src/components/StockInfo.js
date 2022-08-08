import React, { useState, useEffect } from "react"
import { stockSymbol } from "./stockSymbolsAndNames"

/* Component to display info about selected stock. */
const StockInfo = ({ selectedStock, stockData, timeFrame }) => {
  
  /* Create variables. */
  const [company, setCompany] = useState(null)
  const [closingPrice, setClosingPrice] = useState(null)
  const [changeInPrice, setChangeInPrice] = useState(null)

  /* Use useEffect to get/calculate values to show. */
  useEffect(() => {
    if (stockData != null) {
      setCompany(stockSymbol[selectedStock])
  
      let data = stockData.datatable.data
      setClosingPrice(data[0][5])

      /* Apply timeFrame. Notice that the numbers need to be inverted(?). */
      if (timeFrame === "0") {
        data = data.slice(Math.abs(timeFrame))
      } else {
        data = data.slice(0, Math.abs(timeFrame))
      }

      const firstPrice = data[data.length - 1][5]
      const lastPrice = data[0][5]
      setChangeInPrice((lastPrice / firstPrice * 100 - 100).toFixed(2))
    }
  }, [stockData, timeFrame])

  return (
    <div id="stockdata">
      <p><b>Yhtiö: {company}</b></p>
      <p>Päätöskurssi: {closingPrice} USD</p>
      <p>Muutos ajanjaksolla: {changeInPrice} %</p>
    </div>
  )
}

export default StockInfo