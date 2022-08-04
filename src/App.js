import React, { useEffect, useState, useRef } from "react"
import * as d3 from "d3"
import "./App.css"
import { availableStock, stockSymbol } from "./stockSymbolsAndNames.js"

/* API key. */
const API_KEY = process.env.REACT_APP_API_KEY

/* Component to select stock to plot. */
const StockSelector = ({ setSelectedStock }) => {

  /* Event handler for select. */
  const selectStock = (event) => {
    setSelectedStock(event.target.value)
  }

  const showAlert = (event) => {
    alert("Tämä ei vielä toimi.")
  }

  return (
    <div id="selector">
      <select onChange={selectStock}>
        <option key="default" value="default">Valitse osake</option>
        {availableStock.map(stock =>
          <option key={stock} value={stock}>{stockSymbol[stock]}</option>)}
      </select>
      <div id="buttons">
          Valitse ajanjakso:
        <button onClick={showAlert}>Viikko</button>
        <button onClick={showAlert}>Kuukausi</button>
        <button onClick={showAlert}>Kaikki data</button>
      </div>
    </div>
  )
}

/* Component to display info about selected stock. */
const StockInfo = ({ selectedStock, stockData }) => {
  
  /* Create variables. */
  const [company, setCompany] = useState(null)
  const [closingPrice, setClosingPrice] = useState(null)
  const [changeInPrice, setChangeInPrice] = useState(null)

  /* Use useEffect to get/calculate values to show. */
  useEffect(() => {
    if (stockData != null) {
      setCompany(stockSymbol[selectedStock])
  
      const data = stockData.datatable.data
      setClosingPrice(data[0][5])
      
      const firstPrice = data[data.length - 1][5]
      const lastPrice = data[0][5]
      setChangeInPrice((lastPrice / firstPrice * 100 - 100).toFixed(2))
    }
  }, [stockData])

  return (
    <div id="stockdata">
      <p>Yhtiö: {company}</p>
      <p>Päätöskurssi: {closingPrice}</p>
      <p>Muutos ajanjaksolla: {changeInPrice}%</p>
    </div>
  )
}

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

      let yValues = []
      tempData.map(item => yValues.push(item[5]))
      yValues = yValues.reverse()

      let xValues = []
      tempData.map(item => xValues.push(item[1]))
      xValues = xValues.reverse()

      /* Get max and min y-values for setting yScale domain. */
      const yDomainLow = Math.min(...yValues) - 1
      const yDomainHigh = Math.max(...yValues) + 1

      /* Define svg size. */
      const width = 290
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

      /* Append plot. */
      svg.selectAll(".line")
        .data([yValues])
        .join("path")
        .attr("d", d => generateScaledLine(d))
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "pink")
        .attr("stroke-width", "1.5px")

      /* Append extra line on y-axis. */
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 200)
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
    }
  }, [stockData])
  
  /* Return stuff. */
  return (
    <div id="page">
      <div id="title">
        <h1>Talousdata</h1>
      </div>
      <hr></hr>
      <div>
        <StockSelector
          setSelectedStock={setSelectedStock} />
      </div>
      <div id="svgcontainer">
        <svg ref={svgRef}></svg>
      </div>
      <div>
        <StockInfo 
          selectedStock={selectedStock}
          stockData={stockData} />
      </div>
      <hr></hr>
      <div id="source">
        <p>Lähde: Nasdaq.</p>
      </div>
    </div>
  )
}

export default App