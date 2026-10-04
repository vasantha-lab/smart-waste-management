import { useEffect, useState } from "react";
import FillHistoryChart from "./FillHistoryChart";
function BinCard({ bin }) {
  const [requested, setRequested] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [prediction, setPrediction] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/ai/predict/${bin.fillLevel}?binId=${bin.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch AI prediction");
        }

        return response.json();
      })
      .then((data) => {
        setPrediction(data.prediction);
      })
      .catch((error) => {
        console.error("AI prediction error:", error);
      });
  }, [bin.fillLevel]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/bins/${bin.id}/history`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch bin history");
        }

        return response.json();
      })
      .then((data) => {
        setHistory(data);
        console.log("Bin history:", data);
      })
      .catch((error) => {
        console.error("History error:", error);
      });
  }, [bin.id]);
  let status = "Normal";

  if (bin.fillLevel >= 80) {
    status = "Full";
  } else if (bin.fillLevel >= 50) {
    status = "Almost Full";
  }

  return (
    <div className="bin-card">
      <h3>Bin #{bin.id}</h3>

      <span className="bin-id">Smart Bin</span>

      <p>Location: {bin.location}</p>

      <div className="fill-header">
        <span>Fill Level</span>
        <strong>{bin.fillLevel}%</strong>
      </div>

      <div className="fill-bar">
        <div
          className="fill-progress"
          style={{ width: `${bin.fillLevel}%` }}
        ></div>
      </div>

      <p>Last Collected: {bin.lastCollected}</p>
      {history.length > 0 && (
        <div className="fill-history">
          <h4>Fill History</h4>

          {history.map((item) => (
            <p key={item.id}>
              {item.fill_level}% —{" "}
              {new Date(item.recorded_at).toLocaleString()}
            </p>
          ))}
          <FillHistoryChart history={history} />
        </div>
      )}

      <p className="ai-prediction">
        🤖 AI Prediction: {prediction || "Analyzing..."}
      </p>

      {bin.fillLevel >= 80 && (
        <p className="ai-alert">
          🚛 AI Recommendation: Schedule waste collection soon.
        </p>
      )}

      {bin.fillLevel >= 50 && bin.fillLevel < 80 && (
        <p className="ai-warning">
          ⚠️ AI Recommendation: Monitor this bin closely.
        </p>
      )}

      {bin.fillLevel < 50 && (
        <p className="ai-normal">
          ✅ AI Recommendation: No immediate collection required.
        </p>
      )}

      <p
        className={`bin-status ${status === "Full"
          ? "status-full"
          : status === "Almost Full"
            ? "status-almost-full"
            : "status-normal"
          }`}
      >
        Status: {status}
      </p>

      {bin.fillLevel >= 80 && (
        <div>
          <p className="collection-alert">
            ⚠ Collection Required
          </p>
          {requestMessage && (
            <p className="collection-success">
              ✔️ {requestMessage}
            </p>
          )}
          <button
            className="collection-button"
            onClick={async () => {
              const response = await fetch("http://localhost:5000/api/collections", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  binId: bin.id,
                  location: bin.location,
                }),
              });

              const data = await response.json();

              console.log(data);
              setRequestMessage(data.message);

              setRequested(!requested);
            }}>
            {requested ? "Request Submitted" : "Request Collection"}
          </button>

        </div>
      )}
    </div>
  );
}

export default BinCard;