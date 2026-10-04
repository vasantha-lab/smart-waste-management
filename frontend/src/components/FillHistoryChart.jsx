import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function FillHistoryChart({ history }) {
  const data = {
    labels: history.map((item) =>
      new Date(item.recorded_at).toLocaleTimeString()
    ),

    datasets: [
      {
        label: "Fill Level (%)",
        data: history.map((item) => item.fill_level),
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        display: true,
      },

      title: {
        display: true,
        text: "Fill Level History",
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div style={{marginTop: "20px", height: "250px"}}>
        <Line data={data} options={options} />
    </div>
  )
}

export default FillHistoryChart;