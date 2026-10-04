import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function BinChart({ bins }) {
    const chartData = bins.map((bin) => ({
        name: bin.id,
        fillLevel: Number(bin.fillLevel),
    }));

    return (
        <div className="chart-card">
            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis
                        domain={[0, 100]}
                        label={{
                            value: "Fill Level (%)",
                            angle: -90,
                            position: "insideLeft",
                        }}
                    />

                    <Tooltip
                        formatter={(value) => [`${value}%`, "Fill Level"]}
                    />

                    <Line
                        type="monotone"
                        dataKey="fillLevel"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default BinChart;