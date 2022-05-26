import { useState, useEffect, useRef } from 'react'
import Dashboard from './components/Dashboard'
import { formatData } from './utils'
import './styles/App.css'

export default function App() {
  //set state - all available, pair selected by user, price of current selected, historical price data from selected
  const [currencies, setCurrencies] = useState([])
  const [pair, setPair] = useState('')
  const [price, setPrice] = useState('0.00')
  const [pastData, setPastData] = useState({})

  //set persistent websocket object
  const wsocket = useRef(null)

  //used to prevent an initial render
  let first = useRef(false)

  const url = 'https://api.pro.coinbase.com'

  useEffect(() => {
    //connect to websocket API
    wsocket.current = new WebSocket('wss://ws-feed.pro.coinbase.com')

    let pairs = []

    const apiCall = async () => {
      await fetch(url + '/products')
        .then((res) => res.json())
        .then((data) => (pairs = data))
      //filter USD based pairs only
      let filtered = pairs.filter((pair) => {
        if (pair.quote_currency === 'USD') {
          return pair
        }
      })
      //sort filtered pairs alphabetically
      filtered = filtered.sort((a, b) => {
        if (a.base_currency < b.base_currency) {
          return -1
        }
        if (a.base_currency > b.base_currency) {
          return 1
        }
        return 0
      })

      setCurrencies(filtered)

      first.current = true
    }

    apiCall()
  }, [])
  //prevent from running on initial render
  useEffect(() => {
    if (!first.current) {
      return
    }

    let msg = {
      type: 'subscribe',
      product_ids: [pair],
      channels: ['ticker']
    }
    let jsonMsg = JSON.stringify(msg)
    wsocket.current.send(jsonMsg)

    let historicalDataURL = `${url}/products/${pair}/candles?granularity=86400`
    const fetchHistoricalData = async () => {
      let dataArr = []
      await fetch(historicalDataURL)
        .then((res) => res.json())
        .then((data) => (dataArr = data))

      let formattedData = formatData(dataArr)
      setPastData(formattedData)
    }

    fetchHistoricalData()
    //update e listener for websocket to listen for newly updated
    wsocket.current.onmessage = (e) => {
      let data = JSON.parse(e.data)
      if (data.type !== 'ticker') {
        return
      }
      //when event received, update price
      if (data.product_id === pair) {
        setPrice(data.price)
      }
    }
  }, [pair])

  const handleSelect = (e) => {
    let unSubMsg = {
      type: 'unsubscribe',
      product_ids: [pair],
      channels: ['ticker']
    }
    let unSub = JSON.stringify(unSubMsg)

    wsocket.current.send(unSub)

    setPair(e.target.value)
  }
  return (
    <div className="container">
      {
        <select name="currency" value={pair} onChange={handleSelect}>
          {currencies.map((cur, idx) => {
            return (
              <option key={idx} value={cur.id}>
                {cur.display_name}
              </option>
            )
          })}
        </select>
      }
      <Dashboard price={price} data={pastData} />
    </div>
  )
}
