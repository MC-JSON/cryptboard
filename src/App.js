import './App.css'

//setting state variables
//all available currency pairs on Coinbase
const [currencies, setCurrencies] = useState([])
//current pair selected by user
const [pair, setPair] = useState('')
//price of said currency
const [price, setPrice] = useState('0.00')
//historical price state
const [pastData, setPastData] = useState({})

//creating persistent websocket object
const wsocket = useRef(null)
//used to prevent an initial render
let first = useRef(false)
//base url for coinbase api
const url = 'https://api.pro.coinbase.com'

//API initial render
useEffect(() => {
  //connecting to websocket API
  wsocket.current = new WebSocket('wss://ws-feed.pro.coinbase.com')
  const apiCall = async () => {
    await fetch(url + '/products')
      .then((res) => res.json())
      .then((data) => (pairs = data))

    //filter to only USD based pairs
    let filtered = pairs.filter((pair) => {
      if (pair.quote_currency === 'USD') {
        return pair
      }
    })
    //sort filtered currency pairs alphabetically
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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
