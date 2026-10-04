import { useEffect, useState } from "react";

function GarbageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Mark garbage report as collected
  const markAsCollected = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/garbage-reports/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update garbage report");
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === id
            ? { ...report, status: "Collected" }
            : report
        )
      );
    } catch (error) {
      console.error(
        "Error updating garbage report:",
        error
      );
    }
  };

  // Fetch garbage reports
  useEffect(() => {
    fetch("http://localhost:5000/api/garbage-reports")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch garbage reports");
        }

        return response.json();
      })
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error fetching garbage reports:",
          error
        );

        setLoading(false);
      });
  }, []);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (statusFilter === "All") {
      return true;
    }

    return report.status === statusFilter;
  });

  // Loading
  if (loading) {
    return (
      <section className="collection-section">
        <h2>Garbage Reports</h2>
        <p>Loading garbage reports...</p>
      </section>
    );
  }

  return (
    <section className="collection-section">
      <h2>Garbage Reports</h2>

      {/* Status Filters */}
      <div className="request-filters">
        <button
          className={statusFilter === "All" ? "active" : ""}
          onClick={() => setStatusFilter("All")}
        >
          All
        </button>

        <button
          className={statusFilter === "Pending" ? "active" : ""}
          onClick={() => setStatusFilter("Pending")}
        >
          Pending
        </button>

        <button
          className={
            statusFilter === "Collected" ? "active" : ""
          }
          onClick={() => setStatusFilter("Collected")}
        >
          Collected
        </button>
      </div>

      {/* No reports */}
      {reports.length === 0 ? (
        <div className="collection-card">
          <h3>No garbage reports</h3>
          <p>No users have reported garbage yet.</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="collection-card">
          <h3>
            No {statusFilter.toLowerCase()} reports
          </h3>

          <p>
            There are no garbage reports with this status.
          </p>
        </div>
      ) : (
        /* Reports */
        filteredReports.map((report) => (
          <div
            className="collection-card"
            key={report.id}
          >
            <h3>{report.garbage_type}</h3>

            <p>
              <strong>User:</strong>{" "}
              {report.user_name}
            </p>

            <p>
              <strong>Quantity:</strong>{" "}
              {report.quantity}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {report.location}
            </p>

            {/* GPS */}
            {report.latitude && report.longitude && (
              <p>
                <strong>GPS:</strong>{" "}
                <a
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📍 View on Google Maps
                </a>
              </p>
            )}

            {/* Description */}
            <p>
              <strong>Description:</strong>{" "}
              {report.description || "No description"}
            </p>

            {/* Uploaded Photo */}
            {report.photo_path && (
              <div style={{ marginTop: "15px" }}>
                <strong>Reported Photo:</strong>

                <br />

                <img
                  src={`http://localhost:5000/${report.photo_path.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Garbage report"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                />
              </div>
            )}

            {/* Status */}
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  report.status === "Pending"
                    ? "request-pending"
                    : "request-collected"
                }
              >
                {report.status}
              </span>
            </p>

            {/* Pending report */}
            {report.status === "Pending" && (
              <button
                className="collection-button"
                onClick={() =>
                  markAsCollected(report.id)
                }
              >
                Mark as Collected
              </button>
            )}

            {/* Collected report */}
            {report.status === "Collected" && (
              <p className="collection-success">
                ✓ Garbage Collected
              </p>
            )}

            {/* Reported time */}
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
  );
}

export default GarbageReports;