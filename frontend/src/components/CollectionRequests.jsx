import { useEffect, useState } from "react";

function CollectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/collections`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch collection requests");
        }

        return response.json();
      })
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch collection requests:", error);
        setLoading(false);
      });
  }, []);

  const markAsCollected = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/collections/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update collection");
      }

      const data = await response.json();

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === id
            ? {
              ...request,
              status: "Collected",
            }
            : request
        )
      );

      console.log(data);
    } catch (error) {
      console.error("Failed to mark collection:", error);
    }
  };
  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "All") {
      return true;
    }

    return request.status === statusFilter;
  });

  if (loading) {
    return (
      <section className="collection-section">
        <h2>Collection Requests</h2>
        <p>Loading collection requests...</p>
      </section>
    );
  }

  return (
    <section className="collection-section">
      <h2>Collection Requests</h2>
      <div className="request-filters">
        <button onClick={() => setStatusFilter("All")}>
          All
        </button>

        <button onClick={() => setStatusFilter("Pending")}>
          Pending
        </button>

        <button onClick={() => setStatusFilter("Collected")}>
          Collected
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="collection-card">
          <h3>No collection requests yet</h3>
          <p>
            Collection requests will appear here when a bin requires
            collection.
          </p>
        </div>
      ) : (
        filteredRequests.map((request) => (
          <div className="collection-card" key={request.id}>
            <h3>Bin #{request.bin_id}</h3>

            <p>
              <strong>Location:</strong> {request.location}
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
              {request.requested_at
                ? new Date(request.requested_at).toLocaleString()
                : "Not available"}
            </p>

            {request.status === "Pending" && (
              <button
                className="collection-button"
                onClick={() => markAsCollected(request.id)}
              >
                Mark as Collected
              </button>
            )}

            {request.status === "Collected" && (
              <p className="collection-success">
                ✓ Collection Completed
              </p>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default CollectionRequests;