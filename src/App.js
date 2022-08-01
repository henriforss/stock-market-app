import { useEffect, useState } from "react"
import "./App.css"


/* API key. */
const API_KEY = process.env.REACT_APP_API_KEY

/* The App itself. */
function App() {

  /* Define variables with useState(). */
  const [stockData, setStockData] = useState(null)

  /* Get the data. */
  const getData = () => {
    fetch(`https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=AAPL&api_key=${API_KEY}`)
      .then((response) => {
        return response.json()   
      })
      .then((data) => {
        setStockData(data)
        console.log(data)
      })    
  }
    
  /* Call getData on load. */
  useEffect(getData, [])
    
  /* Return stuff. */
  return (
    <div>
      Morjens!
    </div>
  )
}

export default App