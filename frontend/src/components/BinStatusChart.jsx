import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function BinStatusChart({ bins }) {
    const normal = bins.filter(
        (bin) => bin.fillLevel < 50
    ).length;

    const almostFull = bins.filter(
        (bin) => bin.fillLevel >= 50 && bin.fillLevel < 80
    ).length;

    const full = bins.filter(
        (bin) => bin.fillLevel >= 80
    ).length;

    const data = {
        labels: ["Normal", "Almost Full", "Full"],
        datasets: [
            {
                label: "Number of Bins",
                data: [normal, almostFull, full],
                backgroundColor: [
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444",
                ],
                borderColor: "#ffffff",
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
            },
            title: {
                display: true,
                text: "Bin Status",
            },
        },
    };

    return (
        <div style={{ maxWidth: "500px", height: "350px", margin: "40px auto" }}>
            <Pie data={data} options={options} />
        </div>
    );
}

export default BinStatusChart;