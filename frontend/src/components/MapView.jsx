import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function FitBounds({ locations }) {
    const map = useMap();

    const bounds = locations.map((location) => location.position);

    map.fitBounds(bounds, {
        padding: [50, 50],
    });

    return null;
}

function MapView({ bins }) {
    const locations = [
        {
            id: "001",
            name: "Main Street",
            position: [15.8281, 78.0373],
        },
        {
            id: "002",
            name: "Market Area",
            position: [15.8320, 78.0400],
        },
        {
            id: "003",
            name: "Bus Stand",
            position: [15.8245, 78.0350],
        },
    ];

    return (
        <div className="map-section">
            <h2 style={{ marginBottom: "20px" }}>Bin Locations</h2>

            <MapContainer
                center={[15.8281, 78.0373]}
                zoom={14}
                style={{
                    height: "400px",
                    width: "100%",
                    borderRadius: "12px",
                }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds locations={locations} />

                {locations.map((location) => {
                    const bin = bins?.find(
                        (item) => item.id === location.id
                    );

                    return (
                        <Marker
                            key={location.id}
                            position={location.position}
                        >
                            <Popup>
                                <strong>Smart Bin #{location.id}</strong>
                                <br />
                                Location: {location.name}
                                <br />
                                Fill Level:{" "}
                                {bin ? `${bin.fillLevel}%` : "N/A"}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default MapView;