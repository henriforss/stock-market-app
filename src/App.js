import React, { useEffect, useState, useRef } from "react"
import * as d3 from "d3"
import "./App.css"


/* API key. */
const API_KEY = process.env.REACT_APP_API_KEY

/* The App itself. */
function App() {

  /* Define variables with useState(). */
  const [stockData, setStockData] = useState(null)
  const [testData] = useState([10, 20, 40, 30, 70, 20])
  const testSvgRef = useRef()
  const svgRef = useRef()


  /* Get the data. */
  useEffect(() => {
    async function getData() {
      const response = await fetch(`https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=AAPL&api_key=${API_KEY}`)
      const data = await response.json()
      
      setStockData(data)
      console.log(data)
    }
    getData()
    
  }, [])

  useEffect(() => {
    if (stockData != null) {

      const tempData = stockData.datatable.data

      const yValues = []
      tempData.map(item => yValues.push(item[5]))

      let xValues = []
      tempData.map(item => xValues.push(item[1]))

      xValues = xValues.reverse()


      console.log(yValues)
      console.log(xValues)

      const width = 600
      const height = 300

      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("background", "#fac5da")
        .style("margin", "50")
        .style("overflow", "visible")
        // .style("opacity", "0.5")

      const xScale = d3.scaleLinear()
        .domain([0, yValues.length - 1])
        .range([0, width])

      const yScale = d3.scaleLinear()
        .domain([150, 170])
        .range([height, 0])

      const generateScaledLine = d3.line()
        .x((d, i) => xScale(i))
        .y(yScale)

      const xAxis = d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(i => xValues[i])
  
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
  
      svg.append("g")
        .call(xAxis)
        .attr("transform", `translate(0, ${height})`)
  
      svg.append("g")
        .call(yAxis)

      svg.selectAll(".line")
        .data([yValues])
        .join("path")
        .attr("d", d => generateScaledLine(d))
        .attr("fill", "none")
        .attr("stroke", "black")
    }
  }, [stockData])







  // useEffect(() => {

  //   const width = 400
  //   const height = 100

  //   const svg = d3.select(testSvgRef.current)
  //     .attr("width", width)
  //     .attr("height", height)
  //     .style("background", "#fac5da")
  //     .style("margin", "50")
  //     .style("overflow", "visible")
  //     // .style("opacity", "0.5")

  //   const xScale = d3.scaleLinear()
  //     .domain([0, testData.length - 1])
  //     .range([0, width])

  //   const yScale = d3.scaleLinear()
  //     .domain([0, height])
  //     .range([height, 0])

  //   const generateScaledLine = d3.line()
  //     .x((d, i) => xScale(i))
  //     .y(yScale)

  //   const xAxis = d3.axisBottom(xScale)
  //     .ticks(testData.length)
  //     .tickFormat(i => i + 1)

  //   const yAxis = d3.axisLeft(yScale)
  //     .ticks(5)

  //   svg.append("g")
  //     .call(xAxis)
  //     .attr("transform", `translate(0, ${height})`)

  //   svg.append("g")
  //     .call(yAxis)

  //   svg.selectAll(".line")
  //     .data([testData])
  //     .join("path")
  //     .attr("d", d => generateScaledLine(d))
  //     .attr("fill", "none")
  //     .attr("stroke", "black")

  // }, [testData])
    


  
  /* Return stuff. */
  return (
    <div>
      {/* <svg ref={testSvgRef}></svg> */}
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default App