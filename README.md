Smart Waste Management System

A full-stack web application designed to improve waste collection and management using smart-bin monitoring, garbage reporting, GPS location, collection requests, and AI-based collection prediction.

🚀 Features

- 🔐 User authentication with Municipality and User roles
- 🗑️ Smart bin monitoring
- ➕ Add and manage smart bins
- 📊 Dashboard with waste-management statistics
- 📈 Bin fill-level and status charts
- 🗺️ Smart-bin location map
- 🚛 Waste collection requests
- 🤖 AI-based collection prediction
- 📜 Bin fill-level history
- 📍 GPS location for garbage reports
- 📸 Garbage photo reporting
- 📝 Report garbage with type, quantity, location, and description
- 🏛️ Municipality dashboard for managing reports
- ✅ Mark collection requests and garbage reports as completed
- 📱 Responsive user interface

🛠️ Technologies Used

Frontend

- React.js
- JavaScript
- Vite
- HTML5
- CSS3

Backend

- Node.js
- Express.js
- REST APIs
- Multer

Database

- PostgreSQL

Other

- Google Maps
- GPS / Geolocation
- AI-based waste collection prediction
- Git & GitHub

📂 Project Structure

smart-waste-management/
│
├── backend/
│   ├── server.js
│   ├── aiPrediction.js
│   ├── package.json
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

⚙️ Installation

1. Clone the repository

git clone https://github.com/vasantha-lab/smart-waste-management.git

2. Open the project

cd smart-waste-management

3. Install backend dependencies

cd backend
npm install

4. Start the backend

npm start

The backend runs on:

http://localhost:5000

5. Install frontend dependencies

Open another terminal:

cd frontend
npm install

6. Start the frontend

npm run dev

The frontend runs on:

http://localhost:5173

🗄️ Database

This project uses PostgreSQL.

Create a PostgreSQL database named:

smart_waste

The application uses PostgreSQL to store:

- Users
- Smart bins
- Bin fill history
- Collection requests
- Garbage reports

👥 User Roles

Municipality

The municipality can:

- Monitor smart bins
- View bin fill levels
- View collection requests
- View garbage reports
- View reported photos and locations
- Monitor waste-management statistics
- Mark collections as completed

User

Users can:

- View nearby smart bins
- Request waste collection
- Report garbage
- Share GPS location
- Upload garbage photos
- Track their submitted reports and collection requests

🤖 AI Collection Prediction

The system provides collection predictions based on smart-bin fill-level information and historical data.

This helps the municipality identify bins that may require collection soon.

📍 Garbage Reporting

Users can submit:

- Garbage type
- Quantity
- Location
- Description
- GPS coordinates
- Photo

Municipality users can then view and manage these reports.

🎯 Project Objective

The main objective of this project is to provide a centralized digital platform for efficient waste monitoring, citizen reporting, and municipal waste collection management.

The system aims to reduce overflowing bins, improve collection planning, and provide better communication between citizens and municipal authorities.

👩‍💻 Developed By

K Vasantha Lakshmi

GitHub: https://github.com/vasantha-lab

📌 Project Status

Completed and tested.