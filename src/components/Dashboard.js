import { Line as LineJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'

function Dashboard({ price, data }) {
  const opts = {
    tooltips: {
      intersect: false,
      mode: 'index'
    },
    responsive: true,
    maintainAspectRatio: false
  }
  if (price === '0.00') {
    return <h2>DailyCrypt, select your currency.</h2>
  }
  return (
    <div>
      <div className="dashboard">
        <h2>{`$${price}`}</h2>

        <div className="chart-container">
          <Line data={data} options={opts} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
