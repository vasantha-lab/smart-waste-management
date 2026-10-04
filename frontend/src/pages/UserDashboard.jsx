import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

function UserDashboard() {
  const [location, setLocation] = useState(null);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [garbageReports, setGarbageReports] = useState([]);
  const [userName, setUserName] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestedBin, setRequestedBin] = useState(null);
  const [message, setMessage] = useState("");

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "Collected"
  ).length;

  // Get user's GPS location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Location error:", error);
        alert("Unable to get your location.");
      }
    );
  };

  // Fetch bins
  useEffect(() => {
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
        setLoading(false);
      });
  }, []);

  // Fetch collection requests
  useEffect(() => {
    const fetchRequests = () => {
      fetch("http://localhost:5000/api/collections")
        .then((response) => response.json())
        .then((data) => {
          setRequests(data);
        })
        .catch((error) => {
          console.error("Error fetching requests:", error);
        });
    };

    fetchRequests();

    const interval = setInterval(fetchRequests, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch garbage reports
  useEffect(() => {
    fetch("http://localhost:5000/api/garbage-reports")
      .then((response) => response.json())
      .then((data) => {
        setGarbageReports(data);
      })
      .catch((error) => {
        console.error("Error fetching garbage reports:", error);
      });
  }, []);

  // Request collection
  const requestCollection = async (bin) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/collections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            binId: bin.id,
            location: bin.location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to request collection"
        );
      }

      setRequestedBin(bin.id);
      setMessage(data.message);
    } catch (error) {
      console.error("Collection request error:", error);
      setMessage("Failed to submit collection request.");
    }
  };

  return (
    <main className="dashboard">
      <h1>User Dashboard</h1>

      {/* Statistics */}
      <div className="stats-container">
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
        />

        <StatCard
          title="Completed Requests"
          value={completedRequests}
        />
      </div>

      <p>
        View smart bins in your area and request waste collection.
      </p>

      {/* =========================
          SMART BINS
      ========================= */}
      <section className="bins-section">
        <h2>Nearby Smart Bins</h2>

        {loading ? (
          <p>Loading bin information...</p>
        ) : bins.length === 0 ? (
          <p>No bins available.</p>
        ) : (
          <div className="bins-container">
            {bins.map((bin) => {
              const fillLevel = Number(bin.fillLevel);

              return (
                <div className="bin-card" key={bin.id}>
                  <h3>Bin #{bin.id}</h3>

                  <span className="bin-id">
                    Smart Bin
                  </span>

                  <p>
                    Location: {bin.location}
                  </p>

                  <div className="fill-header">
                    <span>Fill Level</span>

                    <strong>
                      {fillLevel}%
                    </strong>
                  </div>

                  <div className="fill-bar">
                    <div
                      className="fill-progress"
                      style={{
                        width: `${fillLevel}%`,
                      }}
                    ></div>
                  </div>

                  <p>
                    Status:{" "}
                    {fillLevel >= 80
                      ? "Full"
                      : fillLevel >= 50
                        ? "Almost Full"
                        : "Normal"}
                  </p>

                  {fillLevel >= 80 && (
                    <>
                      <button
                        className="collection-button"
                        onClick={() =>
                          requestCollection(bin)
                        }
                        disabled={
                          requestedBin === bin.id
                        }
                      >
                        {requestedBin === bin.id
                          ? "Request Submitted"
                          : "Request Collection"}
                      </button>

                      {requestedBin === bin.id && (
                        <p className="collection-success">
                          ✓ {message}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================
          REPORT GARBAGE
      ========================= */}
      <section className="report-garbage-section">
        <div className="report-header">
          <div>
            <span className="report-icon">🗑️</span>

            <div>
              <h2>Report Garbage</h2>

              <p>
                Help keep your area clean by reporting
                garbage.
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="location-box">
          <div>
            <strong>📍 Your Location</strong>

            {location ? (
              <p>
                Latitude:{" "}
                {location.latitude.toFixed(6)}
                <br />
                Longitude:{" "}
                {location.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="location-not-found">
                Location not detected yet
              </p>
            )}
          </div>

          <button
            type="button"
            className="location-button"
            onClick={getUserLocation}
          >
            📍 Get My Location
          </button>
        </div>

        {/* Garbage Report Form */}
        <form
          className="garbage-report-form"
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              const formData = new FormData(e.target);

              const photo = formData.get("photo");

              console.log(
                "Selected photo:",
                photo
              );

              formData.append(
                "latitude",
                location?.latitude || ""
              );

              formData.append(
                "longitude",
                location?.longitude || ""
              );

              console.log(
                "GPS being sent:",
                location
              );

              const response = await fetch(
                "http://localhost:5000/api/garbage-reports",
                {
                  method: "POST",
                  headers: {},
                  body: formData,
                }
              );

              const data = await response.json();

              setMessage(data.message);

              if (response.ok) {
                e.target.reset();

                // Refresh garbage reports
                fetch(
                  "http://localhost:5000/api/garbage-reports"
                )
                  .then((response) =>
                    response.json()
                  )
                  .then((data) => {
                    setGarbageReports(data);
                  });
              }
            } catch (error) {
              console.error(
                "Garbage report error:",
                error
              );

              setMessage(
                "Failed to submit garbage report."
              );
            }
          }}
        >
          {/* Name + Garbage Type */}
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>

              <input
                type="text"
                name="userName"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Garbage Type</label>

              <select
                name="garbageType"
                required
              >
                <option value="">
                  Select garbage type
                </option>

                <option value="Wet Waste">
                  Wet Waste
                </option>

                <option value="Dry Waste">
                  Dry Waste
                </option>

                <option value="Plastic">
                  Plastic
                </option>

                <option value="E-Waste">
                  E-Waste
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>
          </div>

          {/* Quantity + Location */}
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>

              <input
                type="text"
                name="quantity"
                placeholder="e.g. 5 kg"
                required
              />
            </div>

            <div className="form-group">
              <label>Garbage Location</label>

              <input
                type="text"
                name="location"
                placeholder="Where is the garbage?"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Describe the garbage problem..."
              rows="4"
            ></textarea>
          </div>

          {/* Photo */}
          <div className="photo-upload">
            <label>📸 Upload Photo</label>

            <div className="upload-box">
              <span>📷</span>

              <p>
                Choose a photo of the garbage
              </p>

              <input
                type="file"
                name="photo"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  console.log(
                    "Selected file:",
                    e.target.files[0]
                  );
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="submit-report-button"
          >
            🗑️ Submit Garbage Report
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="report-success">
            ✔️ {message}
          </div>
        )}
      </section>

      {/* =========================
          MY COLLECTION REQUESTS
      ========================= */}
      <section className="collection-section">
        <h2>My Collection Requests</h2>

        {requests.length === 0 ? (
          <div className="collection-card">
            <p>No collection requests yet.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              className="collection-card"
              key={request.id}
            >
              <h3>
                Bin #{request.bin_id}
              </h3>

              <p>
                <strong>Location:</strong>{" "}
                {request.location}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    request.status === "Pending"
                      ? "request-pending"
                      : "request-collected"
                  }
                >
                  {request.status}
                </span>
              </p>

              <p>
                <strong>Requested:</strong>{" "}
                {new Date(
                  request.requested_at
                ).toLocaleString()}
              </p>

              {request.status ===
                "Collected" && (
                <p className="collection-success">
                  ✓ Collection Completed
                </p>
              )}
            </div>
          ))
        )}
      </section>

      {/* =========================
          MY GARBAGE REPORTS
      ========================= */}
      <section className="collection-section">
        <h2>My Garbage Reports</h2>

        {garbageReports.length === 0 ? (
          <div className="collection-card">
            <p>No garbage reports yet.</p>
          </div>
        ) : (
          garbageReports.map((report) => (
            <div
              className="collection-card"
              key={report.id}
            >
              <h3>{report.garbage_type}</h3>

              <p>
                <strong>Quantity:</strong>{" "}
                {report.quantity}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {report.location}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {report.description ||
                  "No description"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {report.status}
              </p>

              <p>
                <strong>Reported:</strong>{" "}
                {new Date(
                  report.reported_at
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default UserDashboard;