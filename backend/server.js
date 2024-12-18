const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const cors = require("cors");
const express = require("express");
const mysql = require("mysql2");
const moment = require("moment");
const bcrypt = require("bcrypt");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const saltRounds = 10;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "FALaura$1127",
  database: "sub_center_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

//Helper function to hash passwords
async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

//Create Admin user if none exists
async function createAdminUser() {
    const checkSql = `SELECT * FROM users WHERE email = ?`;
    db.query(checkSql, ["setup@subcenter.com"], async (err, results) => {
        if (err) {
            console.error("Error checking for admin user:", err);
            return;
        }
        if (results.length === 0) {
            const defaultPassword = "P@ssword1234";
            const hashedPassword = await hashPassword(defaultPassword);
            const insertSql = `INSERT INTO users (email, first_name, last_name, full_name, password, role) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(insertSql, ["setup@subcenter.com", "Setup", "SubCenter", "SubCenter, Setup", hashedPassword, "admin"], (err, results) => {
                if (err) {
                    console.error("Error creating admin user:", err);
                } else {
                    console.log("Admin user created successfully.");
                }
            });
        } else {
            console.log("Admin user already exists.");
        }
    });
}

createAdminUser();

// ------------------------
// POST Routes
// ------------------------

app.post("/upload-teachers", upload.single("file"), async (req, res) => {
    const expectedHeaders = ["Email", "First name", "Last name"];
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const filePath = req.file.path;
    const errors = [];

    fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on("headers", headers => {
            const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                errors.push(`Missing headers in CSV: ${missingHeaders.join(", ")}`);
            }
        })
        .on("data", (row) => {
            if (errors.length > 0) return;
            const { Email, ["First name"]: first_name, ["Last name"]: last_name } = row;

            if (!Email || !first_name || !last_name) {
                errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
                return;
            }

            results.push([Email, first_name, last_name]);
        })
        .on("end", async () => {
            fs.unlink(filePath, () => {});
            if (errors.length > 0) {
                console.error("CSV Errors:", errors);
                return res.status(400).json({ message: "Invalid CSV format", errors: errors });
            }

            if (results.length === 0) {
                console.log("No valid rows to insert.");
                return res.status(400).json({ message: "No valid rows to insert." });
            }

            const placeholders = results.map(() => "(?, ?, ?)").join(", ");
            const flattenedResults = results.flat();
            const sql = `INSERT IGNORE INTO Teachers (email, first_name, last_name) VALUES ${placeholders}`;

            db.query(sql, flattenedResults, (err, result) => {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                res.json({ message: "File uploaded and processed successfully.", rows: results.length });
            });
        })
        .on('error', (error) => {
            console.error('Error processing CSV:', error);
            res.status(500).json({ message: 'Error processing CSV', error: error.message });
        });
});

app.post("/upload-schedules", upload.single("file"), async (req, res) => {
    const expectedHeaders = ["Day Labels/Announcements", "Teacher Name", "Course", "Start Time", "End Time", "Location", "Building", "Room", "Block"];
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const filePath = req.file.path;
    const errors = [];

    fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on("headers", headers => {
            const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                errors.push(`Missing headers in CSV: ${missingHeaders.join(", ")}`);
            }
        })
        .on("data", (row) => {
            if (errors.length > 0) return;
            const {
                ["Day Labels/Announcements"]: day_label,
                ["Teacher Name"]: teacher_name,
                ["Course"]: course_name,
                ["Start Time"]: start_time,
                ["End Time"]: end_time,
                ["Location"]: location,
                ["Building"]: building,
                ["Room"]: room,
                ["Block"]: block
            } = row;

            if (!day_label || !teacher_name || !course_name || !location || !start_time || !end_time) {
                errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
                return;
            }

            // Add row with default values for optional columns
            results.push([
                day_label,
                teacher_name,
                course_name,
                start_time,
                end_time,
                location,
                building || "",
                room || "",
                block || ""
            ]);
        })
        .on("end", async () => {
            fs.unlink(filePath, () => { });
            if (errors.length > 0) {
                console.error("CSV Errors:", errors);
                return res.status(400).json({ message: "Invalid CSV format", errors: errors });
            }

            if (results.length === 0) {
                console.log("No valid rows to insert.");
                return res.status(400).json({ message: "No valid rows to insert." });
            }

            const placeholders = results.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
            const flattenedResults = results.flat();
            const sql = `INSERT INTO TeachersSchedule (day_label, teacher_name, course_name, start_time, end_time, location, building, room, block) VALUES ${placeholders}`;

            db.query(sql, flattenedResults, (err, result) => {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                res.json({ message: "File uploaded and processed successfully.", rows: results.length });
            });
        })
        .on("error", (error) => {
            console.error("Error processing CSV:", error);
            res.status(500).json({ message: "Error processing CSV", error: error.message });
        });
});

app.post("/check-user-password", async (req, res) => {
  const { role, password, email } = req.body;
  const sql =
    "SELECT password FROM users WHERE role = ? AND email = ? LIMIT 1";

  try {
    db.query(sql, [role, email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No user found with that role or email.",
        });
      }

      const hashedPasswordFromDb = results[0].password;
      const passwordMatch = await bcrypt.compare(
        password,
        hashedPasswordFromDb
      );

      if (passwordMatch) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Incorrect password" });
      }
    });
  } catch (error) {
    console.error("Error during password check:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the password check.",
    });
  }
});

app.post("/upload-substitutes", upload.single("file"), async (req, res) => {
    const expectedHeaders = [
      "Email1",
      "Email2",
      "FirstName",
      "LastName",
      "Phone",
      "Role",
    ];
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    const results = [];
    const filePath = req.file.path;
    const errors = [];
  
    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(),
        })
      )
      .on("headers", (headers) => {
        const missingHeaders = expectedHeaders.filter(
          (header) => !headers.includes(header)
        );
  
        if (missingHeaders.length > 0) {
          errors.push(`Missing headers in CSV: ${missingHeaders.join(", ")}`);
        }
      })
      .on("data", async (row) => {
          if (errors.length > 0) return;
          const { Email1, Email2, FirstName, LastName, Phone, Role } = row;
  
          if (!Email1 || !FirstName || !LastName) {
              errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
              return;
          }
  
          const fullName = `${LastName}, ${FirstName}`;
          
          // Use a default role of 'substitute' if 'Role' is empty or not provided
          const role = Role ? Role : 'substitute';
  
          try {
              const hashedPassword = await bcrypt.hash(`${LastName.slice(0, 3)}${Phone.slice(-4)}`, saltRounds);
  
              results.push([
                  Email1,
                  Email2 || "", // Use empty string if Email2 is empty
                  FirstName,
                  LastName,
                  fullName,
                  Phone || "", // Use empty string if Phone is empty
                  role,
                  hashedPassword
              ]);
          } catch (error) {
              errors.push(`Error processing row: ${error.message}`);
              console.error("Error processing row:", error);
          }
      })
      .on("end", async () => {
        fs.unlink(filePath, () => {});
        if (errors.length > 0) {
          console.error("CSV Errors:", errors);
          return res
            .status(400)
            .json({ message: "Invalid CSV format", errors: errors });
        }
  
        if (results.length === 0) {
          console.log("No valid rows to insert.");
          return res.status(400).json({ message: "No valid rows to insert." });
        }
  
        console.log("Results array before hashing:", results);
  
        try {
          const placeholders = results
            .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
            .join(", ");
          const flattenedResults = results.flat();
          const sql = `INSERT INTO users (email, email2, first_name, last_name, full_name, phone, role, password) VALUES ${placeholders} ON DUPLICATE KEY UPDATE email2 = VALUES(email2), first_name = VALUES(first_name), last_name = VALUES(last_name), full_name = VALUES(full_name), phone = VALUES(phone), role = CASE WHEN role = 'substitute' THEN 'substitute' ELSE CONCAT(role, ', ', VALUES(role)) END, password = VALUES(password)`;
  
          console.log("SQL Query:", sql);
          console.log("Values:", flattenedResults);
  
          db.query(sql, flattenedResults, (err) => {
            if (err) {
              console.error("Database Error:", err);
              return res
                .status(500)
                .json({ message: "Database error", error: err });
            }
            res.json({
              message: "File uploaded and processed successfully.",
              rows: results.length,
            });
          });
        } catch (error) {
          console.error(
            "Error during password hashing or database insertion:",
            error
          );
          return res.status(500).json({
            message: "Error during password hashing or database insertion",
            error: error,
          });
        }
      })
      .on("error", (error) => {
        console.error("Error processing CSV:", error);
        res
          .status(500)
          .json({ message: "Error processing CSV", error: error.message });
      });
  });
  
app.post("/upload-daily-schedule", upload.single("file"), (req, res) => {
  const sql = `INSERT INTO DailySchedule (day, period, period_start, period_end) VALUES ?`;
  handleCsvUpload(
    req,
    res,
    sql,
    ["Day", "Period", "PeriodStart", "PeriodEnd"],
    undefined,
    true
  );
});

app.post("/upload-pay-end-dates", upload.single("file"), (req, res) => {
  const sql = `INSERT INTO PayEndDates (pay_end_date) VALUES ?`;
  handleCsvUpload(
    req,
    res,
    sql,
    ["PayEndDate"],
    (row) => [
      moment(row.PayEndDate, ["M/D/YYYY", "MM/DD/YYYY"], true).format(
        "YYYY-MM-DD"
      ),
    ],
    true
  );
});

app.post("/upload-days-of-school", upload.single("file"), (req, res) => {
  const sql = `INSERT INTO DaysOfSchool (schedule_name, school_year, calendar_date) VALUES ?`;
  handleCsvUpload(
    req,
    res,
    sql,
    ["Schedule name", "School year", "calendar_date"],
    (row) => [
      row["Schedule name"],
      row["School year"],
      moment(row.calendar_date, ["M/D/YYYY", "MM/DD/YYYY"], true).format(
        "YYYY-MM-DD"
      ),
    ],
    true
  );
});

// Platform management user creation
// Updated to check for existing roles and append new roles
app.post("/users", async (req, res) => {
  const { email, first_name, last_name, role } = req.body;
  const fullName = `${last_name}, ${first_name}`;
  const defaultPassword = "P@ssword1234";
  try {
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
      const checkSql = `SELECT role FROM users WHERE email = ?`;
      db.query(checkSql, [email], (checkErr, checkResults) => {
          if (checkErr) {
              console.error("Error checking for existing user:", checkErr);
              return res.status(500).json({ message: "Error checking for existing user", error: checkErr });
          }

          if (checkResults.length > 0) {
              // User with the given email already exists
              let existingRoles = checkResults[0].role.split(',').map(r => r.trim());
              let newRole = role;

              if (!existingRoles.includes(role)) {
                  // If the role doesn't exist, append it
                  existingRoles.push(role);
                  newRole = existingRoles.join(', ');
              } else {
                  // If the role already exists, keep the existing roles
                  newRole = existingRoles.join(', ');
              }

              const updateSql = `
                  UPDATE users 
                  SET first_name = ?, last_name = ?, full_name = ?, role = ?, password = ?
                  WHERE email = ?`;

              db.query(updateSql, [first_name, last_name, fullName, newRole, hashedPassword, email], (updateErr, updateResults) => {
                  if (updateErr) {
                      console.error("Error updating user:", updateErr);
                      return res.status(500).json({ message: "Error updating user", error: updateErr });
                  }
                  res.json({ message: "User updated successfully.", results: updateResults });
              });
          } else {
              // No user with the given email exists, proceed with creating a new user
              const insertSql = `INSERT INTO users (email, first_name, last_name, full_name, password, role) VALUES (?, ?, ?, ?, ?, ?)`;

              db.query(insertSql, [email, first_name, last_name, fullName, hashedPassword, role], (insertErr, insertResults) => {
                  if (insertErr) {
                      console.error("Error creating Platform User:", insertErr);
                      return res.status(500).json({ message: "Error creating Platform User", error: insertErr });
                  }
                  res.json({ message: "Platform user created successfully.", results: insertResults });
              });
          }
      });
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "An error occurred.", error: error });
  }
});

// Password Reset
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const sql = `UPDATE users SET password = ? WHERE email = ?`;
    db.query(sql, [hashedPassword, email], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to update password.", error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "Password reset successfully." });
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to hash password", error: error });
  }
});

// ------------------------
// GET Routes
// ------------------------
app.get("/teachers", (req, res) => {
  db.query(
    "SELECT teacher_id as id, email, first_name, last_name, full_name FROM Teachers",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.get("/schedules", (req, res) => {
  db.query(
    "SELECT schedule_id as id, day_label, teacher_name, course_name, location FROM TeachersSchedule",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.get("/users", (req, res) => {
  const { email, role } = req.query;
  let sql =
    "SELECT user_id as id, email, email2, first_name, last_name, full_name, role, phone FROM users";
  const conditions = [];
  const values = [];
  if (email) {
    conditions.push("email = ?");
    values.push(email);
  }

  if (role) {
    conditions.push("role = ?");
    values.push(role);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/daily-schedule", (req, res) => {
  db.query(
    "SELECT schedule_id as id, day, period, period_start, period_end FROM DailySchedule",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.get("/payEndDates", (req, res) => {
  db.query(
    "SELECT pay_end_id as id, DATE_FORMAT(pay_end_date, '%m/%d/%Y') AS pay_end_date FROM PayEndDates",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.get("/daysOfSchool", (req, res) => {
  db.query(
    "SELECT school_day_id as id, schedule_name, school_year, DATE_FORMAT(calendar_date, '%m/%d/%Y') AS calendar_date FROM DaysOfSchool",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// ------------------------
// DELETE Routes
// ------------------------
app.delete("/teachers/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM Teachers WHERE teacher_id = ?`, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting row", error: err });
    res.json({ message: "Record deleted successfully" });
  });
});
app.delete("/schedules/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM TeachersSchedule WHERE schedule_id = ?`, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting row", error: err });
    res.json({ message: "Record deleted successfully" });
  });
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM users WHERE user_id = ?`, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting row", error: err });
    res.json({ message: "Record deleted successfully" });
  });
});

app.delete("/daily-schedule/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM DailySchedule WHERE schedule_id = ?`, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting row", error: err });
    res.json({ message: "Record deleted successfully" });
  });
});
app.delete("/payEndDates/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM PayEndDates WHERE pay_end_id = ?`, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting row", error: err });
    res.json({ message: "Record deleted successfully" });
  });
});
app.delete("/daysOfSchool/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM DaysOfSchool WHERE school_day_id = ?`, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting row", error: err });
    res.json({ message: "Record deleted successfully" });
  });
});

//Clear table delete routes
app.delete("/teachers", (req, res) => {
  db.query(`DELETE FROM Teachers`, (err) => {
    if (err)
      return res.status(500).json({ message: "Error clearing the table", error: err });
    res.json({ message: "Table cleared successfully" });
  });
});
app.delete("/schedules", (req, res) => {
  db.query(`DELETE FROM TeachersSchedule`, (err) => {
    if (err)
      return res.status(500).json({ message: "Error clearing the table", error: err });
    res.json({ message: "Table cleared successfully" });
  });
});

app.delete("/daily-schedule", (req, res) => {
  db.query(`DELETE FROM DailySchedule`, (err) => {
    if (err)
      return res.status(500).json({ message: "Error clearing the table", error: err });
    res.json({ message: "Table cleared successfully" });
  });
});
app.delete("/payEndDates", (req, res) => {
  db.query(`DELETE FROM PayEndDates`, (err) => {
    if (err)
      return res.status(500).json({ message: "Error clearing the table", error: err });
    res.json({ message: "Table cleared successfully" });
  });
});
app.delete("/daysOfSchool", (req, res) => {
  db.query(`DELETE FROM DaysOfSchool`, (err) => {
    if (err)
      return res.status(500).json({ message: "Error clearing the table", error: err });
    res.json({ message: "Table cleared successfully" });
  });
});
app.delete("/substitutes", (req, res) => {
  db.query(`DELETE FROM users WHERE role = 'substitute'`, (err) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error clearing the table", error: err });
    res.json({ message: "Table cleared successfully" });
  });
});
// ------------------------
// Start Server
// ------------------------
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));