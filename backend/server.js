const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { predictCollection } = require("./aiPrediction");
const bcrypt = require("bcrypt");
const multer=require("multer");
const upload = multer({ dest: "uploads/"});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("uploads"));

const PORT = 5000;


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smart_waste",
  password: "postgres",
  port: 5432,
});


pool.query("SELECT NOW()", (error) => {
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("PostgreSQL connected successfully");
  }
});


app.get("/api/test", (req, res) => {
  res.json({
    message: "Smart Waste Management API is working",
  });
});


app.get("/api/ai/predict/:fillLevel", async (req, res) => {
  try {
    const fillLevel = Number(req.params.fillLevel);

    if (
      Number.isNaN(fillLevel) ||
      fillLevel < 0 ||
      fillLevel > 100
    ) {
      return res.status(400).json({
        message: "Fill level must be a number between 0 and 100",
      });
    }

    const binId = req.query.binId;

    const historyResult = await pool.query(
      `SELECT fill_level
       FROM bin_fill_history
       WHERE bin_id = $1
       ORDER BY recorded_at ASC`,
      [binId]
    );

    const prediction = predictCollection(
      fillLevel,
      historyResult.rows
    );

    res.json({
      fillLevel,
      prediction,
    });
  } catch (error) {
    console.error("AI prediction error:", error);

    res.status(500).json({
      message: "Failed to generate AI prediction",
    });
  }
});



app.get("/api/bins/:id/history", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         id,
         bin_id,
         fill_level,
         recorded_at
       FROM bin_fill_history
       WHERE bin_id = $1
       ORDER BY recorded_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bin fill history:", error);

    res.status(500).json({
      message: "Failed to fetch bin fill history",
    });
  }
});



app.get("/api/bins", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        location,
        fill_level AS "fillLevel",
        last_collected AS "lastCollected"
      FROM bins
      ORDER BY id
    `);

    
    for (const bin of result.rows) {
      await pool.query(
        `INSERT INTO bin_fill_history
         (bin_id, fill_level)
         VALUES ($1, $2)`,
        [bin.id, bin.fillLevel]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bins:", error);

    res.status(500).json({
      message: "Failed to fetch bins",
    });
  }
});
app.post("/api/bins", async (req, res) => {
  try {
    const {
      id,
      location,
      fillLevel,
    } = req.body;

    if (!id || !location) {
      return res.status(400).json({
        message: "Bin ID and location are required",
      });
    }

    const existingBin = await pool.query(
      "SELECT id FROM bins WHERE id = $1",
      [id]
    );

    if (existingBin.rows.length > 0) {
      return res.status(400).json({
        message: "A bin with this ID already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO bins
       (id, location, fill_level, last_collected)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         location,
         fill_level AS "fillLevel",
         last_collected AS "lastCollected"`,
      [
        id,
        location,
        Number(fillLevel) || 0,
        "Not collected yet",
      ]
    );

    res.status(201).json({
      message: "Bin added successfully",
      bin: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding bin:", error);

    res.status(500).json({
      message: "Failed to add bin",
    });
  }
});


app.post("/api/collections", async (req, res) => {
  try {
    const { binId, location } = req.body;

    const result = await pool.query(
      `INSERT INTO collections
       (bin_id, location)
       VALUES ($1, $2)
       RETURNING *`,
      [binId, location]
    );

    res.json({
      message: "Collection request received",
      request: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error creating collection request:",
      error
    );

    res.status(500).json({
      message: "Failed to create collection request",
    });
  }
});


app.get("/api/collections", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM collections
       ORDER BY requested_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching collection requests:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch collection requests",
    });
  }
});


app.put("/api/collections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE collections
       SET status = 'Collected'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Collection request not found",
      });
    }

    res.json({
      message: "Collection marked as collected",
      request: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating collection:",
      error
    );

    res.status(500).json({
      message: "Failed to update collection",
    });
  }
});



app.get("/api/collections/pending/count", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM collections
       WHERE status = 'Pending'`
    );

    res.json({
      count: Number(result.rows[0].count),
    });
  } catch (error) {
    console.error(
      "Error fetching pending collection count:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch pending collection count",
    });
  }
});



app.post("/api/garbage-reports", upload.single("photo"), async (req, res) => {
  try {
    const {
      userName,
      garbageType,
      quantity,
      location,
      description,
      latitude,
      longitude,
    } = req.body;
    const photoPath = req.file ? req.file.path : null;
    console.log("GPS received by backend:",latitude, longitude);

    if (
      !userName ||
      !garbageType ||
      !quantity ||
      !location
    ) {
      return res.status(400).json({
        message: "Please provide all required information",
      });
    }

    const result = await pool.query(
      `INSERT INTO garbage_reports
       (
         user_name,
         garbage_type,
         quantity,
         location,
         description,
         latitude,
         longitude,
         photo_path
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userName,
        garbageType,
        quantity,
        location,
        description || null,
        latitude || null,
        longitude || null,
        photoPath,
      ]
    );

    res.status(201).json({
      message: "Garbage report submitted successfully",
      report: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Garbage report error:",
      error
    );

    res.status(500).json({
      message: "Failed to submit garbage report",
    });
  }
});



app.get("/api/garbage-reports", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM garbage_reports
       ORDER BY reported_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching garbage reports:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch garbage reports",
    });
  }
});


app.put("/api/garbage-reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE garbage_reports
       SET status = 'Collected'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Garbage report not found",
      });
    }

    res.json({
      message: "Garbage report marked as collected",
      report: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating garbage report:",
      error
    );

    res.status(500).json({
      message: "Failed to update garbage report",
    });
  }
});
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Failed to create account",
    });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (user.role !== "municipality" && user.role !== "user") {
  return res.status(403).json({
    message: "Invalid user role",
  });
}

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Failed to login",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});