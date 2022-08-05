import React, { useEffect, useState, useRef } from "react"
import * as d3 from "d3"
import "./App.css"
import { availableStock, stockSymbol } from "./stockSymbolsAndNames.js"

/* API key. */
const API_KEY = process.env.REACT_APP_API_KEY

/* Component to select stock to plot. */
const StockSelector = ({ setSelectedStock, setTimeFrame }) => {

  /* Function to select all divs and remove class from each. */
  const removeSelection = () => {
    const allDivs = document.querySelectorAll("#div1, #div2, #div3")
    allDivs.forEach((div) => {
      div.classList.remove("buttonsselected")
    })
  }

  /* Function to select default div. */
  const selectDefault = () => {
    const defaultDiv = document.getElementById("div3")
    defaultDiv.classList.add("buttonsselected")
  }

  /* Event handler for select. */
  const selectStock = (event) => {
    setSelectedStock(event.target.value)
    setTimeFrame("0")
    removeSelection()
    selectDefault()
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

/* The App itself. */
function App() {

  /* Define variables with useState(). */
  const [selectedStock, setSelectedStock] = useState("MMM")
  const [stockData, setStockData] = useState(null)
  const [timeFrame, setTimeFrame] = useState("0")
  const svgRef = useRef()

  /* Get the data. */
  useEffect(() => {
    async function getData() {
      const response = await fetch(`https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=${selectedStock}&api_key=${API_KEY}`)
      const data = await response.json()
      setStockData(data)
    }
    getData()

    /* Select default timeFrame button. */
    const defaultDiv = document.getElementById("div3")
    defaultDiv.classList.add("buttonsselected")
  }, [selectedStock])

  /* Plot the data after getting it. */
  useEffect(() => {
    if (stockData != null) {

      /* Get x- and y-values for plotting. */
      const tempData = stockData.datatable.data

      let yAllValues = []
      tempData.map(item => yAllValues.push(item[5]))
      yAllValues = yAllValues.reverse()

      let xAllValues = []
      tempData.map(item => xAllValues.push(new Date(item[1])))
      xAllValues = xAllValues.reverse()

      /* Apply timeFrame on x- and y-values. */
      let xValues = xAllValues.slice(timeFrame)
      let yValues = yAllValues.slice(timeFrame)

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
        .tickFormat(i => xValues[i].toLocaleDateString("en-GB"))
        .tickSize(4)
        .tickPadding([10])
  
      /* Define y-axis. */
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(0)
        .tickFormat(x => `$${x}`)
        

      /* Define y-axis grid. */
      const yAxisGrid = d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
        .ticks(5)
               
      /* Remove previous ticks and plot. */
      svg.selectAll("*")
      .remove()
      
      /* Append grid. */
      svg.append("g")
      .call(yAxisGrid)
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
      
      /* Append x-axis ticks. */
      svg.append("g")
        .call(xAxis)
        .attr("transform", `translate(0, ${height})`)
      
      /* Append y-axis ticks. */
      svg.append("g")
        .call(yAxis)

      // /* Add function on click. */
      // svg.on("click", (event) => {

      //   const coords = d3.pointer(event)

      //   console.log(coords)

      //   svg.selectAll(".infoline")
      //     .remove()

      //   svg.append("line")
      //     .attr("class", "infoline")
      //     .attr("x1", coords[0])
      //     .attr("y1", 0)
      //     .attr("x2", coords[0])
      //     .attr("y2", 200)
      //     .style("stroke", "black")
      //     .style("stroke-width", "1px")      
      // })
    }
  }, [stockData, timeFrame])
  
  /* Return stuff. */
  return (
    <div id="page">
      <div id="title">
        <h1>Talousdata</h1>
      </div>
      <hr></hr>
      <div>
        <StockSelector
          setSelectedStock={setSelectedStock}
          setTimeFrame={setTimeFrame} />
      </div>
      <div id="svgcontainer">
        <svg ref={svgRef}></svg>
      </div>
      <div>
        <StockInfo 
          selectedStock={selectedStock}
          stockData={stockData}
          timeFrame={timeFrame} />
      </div>
      <hr></hr>
      <div id="source">
        <p>Lähde: Nasdaq.</p>
      </div>
    </div>
  )
}

export default App