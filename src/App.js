import React, { useEffect, useState, useRef } from "react"
import * as d3 from "d3"
import "./App.css"
import StockSelector from "./components/StockSelector"
import StockInfo from "./components/StockInfo"

/* API key. */
const API_KEY = process.env.REACT_APP_API_KEY

/* The App itself. */
function App() {

  /* Define variables with useState(). */
  const [selectedStock, setSelectedStock] = useState("MMM") // This is the first stock ticker (3M Company)
  const [stockData, setStockData] = useState(null)
  const [timeFrame, setTimeFrame] = useState("0") // This is used to slice the data
  const svgRef = useRef()

  /* Get the data. */
  useEffect(() => {
    async function getData() {
      const response = await fetch(`https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=${selectedStock}&api_key=${API_KEY}`)
      const data = await response.json()
      setStockData(data)
    }
    getData()

    /* Select default timeFrame button. This is stupid. Same thing is done in StockSelector.*/
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
      const width = 276
      const height = 200

      /* Define svg element. */
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("background", "#edfeff")
        .style("margin-left", "37")
        .style("margin-top", "20")
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

      /* Define bisect. */
      const bisect = d3.bisector((d) => d).left
      
      /* Append focus. */
      const focus = svg.append("g")
        .append("circle")
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("r", 8.5)
        .style("opacity", 0)

      /* Append text to focus circle. */
      const focusText = svg.append("g")
        .append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")
        .attr("class", "focustext")

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

      /* Append rect on top of everything else to get pointer-events. */
      svg.append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", (event) => mousemove(event))
        .on("mouseout", mouseout)

      /* Define mouseover(). */
      function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity", 1)
      }

      /* Define mousemove(). */
      function mousemove(event) {

        /* Get x- and y-coords for focus. */
        let xco = xScale.invert(d3.pointer(event)[0])
        const i = bisect([...xValues.keys()], xco)
        const yco = yScale(yValues[i])
        xco = xScale(i)
      
        /* Update focus. */
        focus
          .attr("cx", xScale(i))
          .attr("cy", yco)

        /* Update focusText. */
        focusText
          .html(`Pvm: ${xValues[i].toLocaleDateString("en-GB")} Arvo: ${yValues[i]} USD`)
          .attr("x", width/2)
          .attr("y", 190)
      }

      /* Define mouoseout(). */
      function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
      }
    }
  }, [stockData, timeFrame])
  
  /* Return stuff. */
  return (
    <div id="page">
      <div id="title">
        <h1>Talousdata</h1>
      </div>
      <div id="legend">
        <p>Tässä voit tutustua joidenkin yhtiöiden pörssikurssien
          kehitykseen. Nasdaqin ilmainen data rajoittuu joihinkin
          amerikkalaisiin yhtiöihin ja muutamaan kuukauteen vuonna 2017.</p>
      </div>
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