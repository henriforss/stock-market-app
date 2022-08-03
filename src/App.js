import React, { useEffect, useState, useRef } from "react"
import * as d3 from "d3"
import "./App.css"

/* API key. */
const API_KEY = process.env.REACT_APP_API_KEY

/* Component to select stock to plot. */
const StockSelector = ({ selectedStock, setSelectedStock }) => {

  /* List of available stock. */
  const availableStock = ["MMM", "AXP", "AAPL", "BA", "CAT",
    "CVX", "CSCO", "KO", "DIS", "XOM", "GE", "GS", "HD", "IBM",
    "INTC", "JNJ", "JPM", "MCD", "MRK", "MSFT", "NKE", "PFE", "PG",
    "TRV", "UNH", "VZ", "V", "WMT"]
  
  /* Dictionary with full stock names. */
  const stockSymbol = {
    "MMM": "3M Company",
    "AXP": "American Express Company",
    "AAPL": "Apple",
    "BA": "The Boeing Company",
    "CAT": "Caterpillar",
    "CVX": "Chevron",
    "CSCO": "Cisco Systems",
    "KO": "The Coca-Cola Company",
    "DIS": "The Walt Disney Company",
    "XOM": "Exxon Mobil",
    "GE": "General Electric Company",
    "GS": "The Goldman Sachs Group",
    "HD": "The Home Depot",
    "IBM": "International Business Machines",
    "INTC": "Intel",
    "JNJ": "Johnson & Johnson",
    "JPM": "JPMorgan Chase & Co.",
    "MCD": "McDonald's",
    "MRK": "Merck & Co.",
    "MSFT": "Microsoft",
    "NKE": "Nike, Inc.",
    "PFE": "Pfizer",
    "PG": "The Procter & Gamble Company",
    "TRV": "The Travelers Companies",
    "UNH": "UnitedHealth Group",
    "VZ": "Verizon Communications",
    "V": "Visa Inc.",
    "WMT": "Walmart",
  }

  /* Event handler for select. */
  const selectStock = (event) => {
    setSelectedStock(event.target.value)
  }

  return (
    <div>
      <div id="title">
        <h1>Pörssitietoa</h1>
      </div>
      <hr></hr>
      <div id="selector">
        <select onChange={selectStock}>
          <option key="default" value="default">Valitse osake</option>
          {availableStock.map(stock =>
            <option key={stock} value={stock}>{stockSymbol[stock]}</option>)}
        </select>
      </div>
      <div id="stockdata">
        <p>Osake: {stockSymbol[selectedStock]}</p>
        <p>Viimeinen kurssi: XXX</p>
        <p>Muutos: XXX</p>
      </div>
    </div>
  )
}

// /* Component to display info about selected stock. */
// const StockInfo = (props) => {

//   return (
//     <div>
//       moikka
//     </div>
//   )
// }

/* The App itself. */
function App() {

  /* Define variables with useState(). */
  const [selectedStock, setSelectedStock] = useState("MMM")
  const [stockData, setStockData] = useState(null)
  const svgRef = useRef()

  /* Get the data. */
  useEffect(() => {
    async function getData() {
      const response = await fetch(`https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=${selectedStock}&api_key=${API_KEY}`)
      const data = await response.json()
      setStockData(data)
    }
    getData()
  }, [selectedStock])

  /* Plot the data after getting it. */
  useEffect(() => {
    if (stockData != null) {

      /* Get x- and y-values for plotting. */
      const tempData = stockData.datatable.data

      const yValues = []
      tempData.map(item => yValues.push(item[5]))

      let xValues = []
      tempData.map(item => xValues.push(item[1]))
      xValues = xValues.reverse()

      /* Get max and min y-values for setting yScale domain. */
      const yDomainLow = Math.min(...yValues) - 1
      const yDomainHigh = Math.max(...yValues) + 1

      /* Define svg size. */
      const width = 320
      const height = 200

      /* Define svg element. */
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("background", "#edfeff")
        .style("margin-left", "30")
        .style("margin-top", "30")
        .style("margin-bottom", "30")
        .style("overflow", "visible")

      /* Define x-axis scale. */
      const xScale = d3.scaleLinear()
        .domain([0, yValues.length - 1])
        .range([0, width])

      /* Define y-axis scale. */
      const yScale = d3.scaleLinear()
        .domain([yDomainLow, yDomainHigh])
        .range([height, 0])

      /* Create line generator. */
      const generateScaledLine = d3.line()
        .x((d, i) => xScale(i))
        .y(yScale)

      /* Define x-axis. */
      const xAxis = d3.axisBottom(xScale)
        .ticks(4)
        .tickFormat(i => xValues[i])
        .tickSize(4)
  
      /* Define y-axis. */
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-width)
      
      /* Remove previous ticks and plot. */
      svg.selectAll("*")
        .remove()

      /* Append x-axis ticks. */
      svg.append("g")
        .call(xAxis)
        .attr("transform", `translate(0, ${height})`)
  
      /* Append y-axis ticks. */
      svg.append("g")
        .call(yAxis)
        .attr("stroke-opacity", 0.1)

      /* Append extra line on y-axis. */
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 200)
        .attr("stroke", "black")
        .attr("stroke-width", "1px")

      /* Append plot. */
      svg.selectAll(".line")
        .data([yValues])
        .join("path")
        .attr("d", d => generateScaledLine(d))
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "pink")
        .attr("stroke-width", "1.5px")
    }
  }, [stockData])
  
  /* Return stuff. */
  return (
    <div id="page">
      <div>
        <StockSelector
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock} />
      </div>
      {/* <div>
        <StockInfo />
      </div> */}
      <div>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default App