import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import BinCard from "../components/BinCard";
import CollectionRequests from "../components/CollectionRequests";
import BinChart from "../components/BinChart";
import BinStatusChart from "../components/BinStatusChart";
import MapView from "../components/MapView";
import GarbageReports from "../components/GarbageReports";

function Dashboard() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingCollections, setPendingCollections] = useState(0);

  // Add bin form
  const [showAddBin, setShowAddBin] = useState(false);
  const [binId, setBinId] = useState("");
  const [binLocation, setBinLocation] = useState("");
  const [binFillLevel, setBinFillLevel] = useState(0);
  const [addBinMessage, setAddBinMessage] = useState("");

  // Fetch bin data
  const fetchBins = () => {
    fetch("http://localhost:5000/api/bins")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch bins");
        }

        return response.json();
      })
      .then((data) => {
        setBins(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bins:", error);
        setError("Unable to load bin data");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBins();
  }, []);

  // Fetch pending collection count
  useEffect(() => {
    fetch("http://localhost:5000/api/collections/pending/count")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch pending collections");
        }

        return response.json();
      })
      .then((data) => {
        setPendingCollections(data.count);
      })
      .catch((error) => {
        console.error("Error fetching pending collections:", error);
      });
  }, []);

  // Add new bin
  const handleAddBin = async (e) => {
    e.preventDefault();

    setAddBinMessage("");

    if (!binId || !binLocation) {
      setAddBinMessage("Please provide bin ID and location.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/bins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: binId,
            location: binLocation,
            fillLevel: Number(binFillLevel),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAddBinMessage(data.message || "Failed to add bin.");
        return;
      }

      setAddBinMessage("Bin added successfully!");

      setBinId("");
      setBinLocation("");
      setBinFillLevel(0);

      // Refresh bin list
      fetchBins();

      // Close form after successful addition
      setTimeout(() => {
        setShowAddBin(false);
        setAddBinMessage("");
      }, 1000);
    } catch (error) {
      console.error("Error adding bin:", error);
      setAddBinMessage("Failed to add bin.");
    }
  };

  // Loading screen
  if (loading) {
    return (
      <main className="dashboard">
        <h1>Smart Waste Management Dashboard</h1>

        <p className="loading-message">
          Loading bin data...
        </p>
      </main>
    );
  }

  // Error screen
  if (error) {
    return (
      <main className="dashboard">
        <h1>Smart Waste Management Dashboard</h1>

        <p className="error-message">
          {error}
        </p>
      </main>
    );
  }

  const totalBins = bins.length;

  const fullBins = bins.filter(
    (bin) => Number(bin.fillLevel) >= 80
  ).length;

  const almostFullBins = bins.filter(
    (bin) =>
      Number(bin.fillLevel) >= 50 &&
      Number(bin.fillLevel) < 80
  ).length;

  const availableBins = totalBins - fullBins;

  // Search + status filter
  const filteredBins = bins.filter((bin) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      bin.id.toLowerCase().includes(search) ||
      bin.location.toLowerCase().includes(search);

    const fillLevel = Number(bin.fillLevel);

    let status = "Normal";

    if (fillLevel >= 80) {
      status = "Full";
    } else if (fillLevel >= 50) {
      status = "Almost Full";
    }

    const matchesStatus =
      statusFilter === "All" ||
      status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="dashboard">

      <h1>Smart Waste Management Dashboard</h1>

      <p>
        Monitor smart bins, collection requests and waste levels.
      </p>

      {/* Statistics */}
      <div className="stats-container">

        <StatCard
          title="Total Bins"
          value={totalBins}
        />

        <StatCard
          title="Full Bins"
          value={fullBins}
        />

        <StatCard
          title="Almost Full"
          value={almostFullBins}
        />

        <StatCard
          title="Available Bins"
          value={availableBins}
        />

        <StatCard
          title="Pending Collections"
          value={pendingCollections}
        />

      </div>

      {/* Smart Bins */}
      <section className="bins-section">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <h2>Smart Bins</h2>

          <button
            className="collection-button"
            onClick={() => {
              setShowAddBin(!showAddBin);
              setAddBinMessage("");
            }}
          >
            + Add New Bin
          </button>
        </div>

        {/* Add New Bin Form */}
        {showAddBin && (
          <div
            className="collection-card"
            style={{ marginTop: "20px" }}
          >
            <h3>Add New Smart Bin</h3>

            <form onSubmit={handleAddBin}>

              <input
                type="text"
                placeholder="Bin ID (example: BIN-002)"
                value={binId}
                onChange={(e) =>
                  setBinId(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />

              <input
                type="text"
                placeholder="Bin location"
                value={binLocation}
                onChange={(e) =>
                  setBinLocation(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />

              <input
                type="number"
                min="0"
                max="100"
                placeholder="Initial fill level"
                value={binFillLevel}
                onChange={(e) =>
                  setBinFillLevel(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />

              <button
                type="submit"
                className="collection-button"
              >
                Add Bin
              </button>

              <button
                type="button"
                className="collection-button"
                onClick={() => setShowAddBin(false)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>

              {addBinMessage && (
                <p style={{ marginTop: "10px" }}>
                  {addBinMessage}
                </p>
              )}

            </form>
          </div>
        )}

        {/* Search and filter */}
        <div className="bin-filters">

          <input
            type="text"
            placeholder="Search by bin ID or location..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Normal">
              Normal
            </option>

            <option value="Almost Full">
              Almost Full
            </option>

            <option value="Full">
              Full
            </option>
          </select>

        </div>

        {/* No bins */}
        {bins.length === 0 ? (
          <div className="collection-card">

            <h3>
              No bins available
            </h3>

            <p>
              No bin data was found in the database.
            </p>

          </div>
        ) : filteredBins.length === 0 ? (
          <div className="collection-card">

            <h3>
              No matching bins
            </h3>

            <p>
              Try changing your search or status filter.
            </p>

          </div>
        ) : (

          <div className="bins-container">

            {filteredBins.map((bin) => (
              <BinCard
                key={bin.id}
                bin={bin}
              />
            ))}

          </div>

        )}

      </section>

      {/* Fill Level Chart */}
      <section className="map-section">

        <h2>
          Bin Fill Level Analysis
        </h2>

        <BinChart bins={bins} />

      </section>

      {/* Status Chart */}
      <section className="map-section">

        <h2>
          Bin Status Analysis
        </h2>

        <BinStatusChart bins={bins} />

      </section>

      {/* Map */}
      <MapView bins={bins} />

      {/* Collection Requests */}
      <CollectionRequests />

      {/* Garbage Reports */}
      <GarbageReports />

    </main>
  );
}

export default Dashboard;