const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

// const db = require("./database.js");
const queryDatabase = require("./database.js");

const globalState = require("./data.js");

const sendPushNotification = require("./notifications");



// send notification and emit
// setTimeout(() => {
//   const socketId = globalState.userSocketMap.get("x@x");
//   if (socketId) {
//     console.log("sending");
//     globalState.io.to(socketId).emit("hello", { message: "hellog from routes file" });

//     sendPushNotification({
//       user: { username: "ronak", email: "ronak@x" },
//       message: "hello",target:""
//     });
//   }
// }, 5000);


router.post("/grab-tasks", (req, res) => {
  const { start, end } = req.body;

  if (!start || !end) {
    return res.status(400).json({ error: "Start and end times are required" });
  }

  const query = `
    SELECT * FROM tasks 
    WHERE start >= ? AND end <=?
  `;

  queryDatabase(query, [start, end], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No tasks found within the specified time range" });
    }

    res.status(200).json({ tasks: results });
  });
});

//Route for Grabtasks for analytics
router.post("/grab-tasksusers", (req, res) => {
  const { start, end } = req.body;
  // console.log("Fetching tasks from:", start, "to:", end);


  if (!start || !end) {
    return res.status(400).json({ error: "Start and end times are required" });
  }

  const query = `
    SELECT *
    FROM tasks
    INNER JOIN users ON tasks.userid = users.id
    WHERE start >= ? AND end <=?
    
    `;

  queryDatabase(query, [start, end], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No tasks found within the specified time range" });
    }

    res.status(200).json({ tasks: results });
  });
})

//Route for leaderboard
router.get("/grab-leaderboard", (req, res) => {
  const days = parseInt(req.query.days, 10) || 1;

  const query = `
    SELECT t.userid, u.username, SUM(t.point) AS score
    FROM tasks t
    JOIN users u ON t.userid = u.id
    WHERE t.start >= NOW() - INTERVAL ? DAY
    GROUP BY t.userid, u.username
    ORDER BY score DESC
  `;


 queryDatabase(query, [days], (err, results) => {
    if (err) {
      console.error("Leaderboard query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    res.status(200).json({ leaderboard: results });
  });
})



const taskQueue = [];
setInterval(() => {
  // console.log("taskQueue", taskQueue.length);
  if (taskQueue.length > 0) {
    const task = taskQueue.shift();
    if (task) {

      const {
        userid,
        points,
        info,
        status,
        start,
        end,
        location
      } = task;
      const saveTaskToDB = (userid, points, info, status, start, end, location, callback) => {
        if (!userid || points === undefined || !info || !start || !end || !location) {
          return callback({ error: "User ID, Point, Task Description, Start Time, End Time, and Location are required" });
        }

        const query = `
      INSERT INTO tasks (userid, point, info, status, start, end, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        queryDatabase(query, [userid, points, info, status, start, end, location], (err, result) => {
          if (err) {
            console.error("Error saving task:", err);
            return callback({ error: "Database error" });
          }
          callback(null, { message: "Task saved successfully!", taskId: result.insertId });
        });
      };


      saveTaskToDB(userid, points, info, status, start, end, location, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          // console.log(result);
        }
      });
    }

  }
}, 1000);

router.post("/save-task", (req, res) => {
  const { email, taskid, userid, points, info, status, start, end, location } = req.body;

  if (globalState.tasks[email]) {
    globalState.tasks[email] = globalState.tasks[email].filter(task => task.id !== taskid);

    const socketId = globalState.userSocketMap.get(email);
    if (socketId) {

      globalState.io.to(socketId).emit("tasks", globalState.tasks[email]);
      globalState.io.emit("allTasks", globalState.tasks);

    }

  }


  // Create task object
  const task = {
    email,
    taskid,
    userid,
    points,
    info,
    status,
    start,
    end,
    location,
    timestamp: Date.now() // optional for tracking
  };

  if(task.status=="confirm"){
    taskQueue.push(task);
    // console.log("Task added to queue:", task);
  
  }


})



router.post("/add-task", (req, res) => {
  // console.log(req.body)
  let { classname, location, image, camera_name, yoloname } = req.body;


  const taskPoints = {
    "default": 0,
    "emptyGlass": 3,
    "emptyBowl": 2,
  }

  let points = 1; //default point is 1
  points = taskPoints?.[classname] ?? taskPoints["default"];

  const connectedUsers = Array.from(globalState.userSocketMap.keys());
  if (connectedUsers.length === 0) {
    return res.status(503).json({ error: "No connected users to assign task" });
  }

  let freeUser = connectedUsers[0];

  connectedUsers.forEach((user) => {
    if (!globalState.tasks[user]) {
      globalState.tasks[user] = [];
    }
  });

  for (const user of connectedUsers) {
    if (globalState.tasks[user].length < globalState.tasks[freeUser].length) {
      freeUser = user;
    }
  }

  const task = {
    id: Date.now(),
    classname,
    yoloname,
    location,
    image,
    camera_name,
    points
  };

  globalState.tasks[freeUser].push(task);
  // console.log(globalState.tasks);
  // console.log("Emitting task data:", task);
  const socketId = globalState.userSocketMap.get(freeUser);
  if (socketId) {

    globalState.io.to(socketId).emit("tasks", globalState.tasks[freeUser]);
    globalState.io.emit("allTasks", globalState.tasks);

    // sendPushNotification({
    //   title: `Task: ${task.id}`,
    //   message: `${task.classname}: ${task.points} point(s)`,
    //   target: freeUser,
    // });
  }

  res.status(200).json({ success: true, task });
});

router.post("/send-notification", async (req, res) => {
  try {
    await sendPushNotification(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to send push:", err);
    res.status(500).json({ error: "Failed to send push notification" });
  }
});

//subcribe to notifications
router.post("/subscribe", async (req, res) => {
  const { user, subscription } = req.body;

  if (!user?.email || !subscription?.endpoint) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { endpoint, keys } = subscription;
  const { p256dh, auth } = keys;

  queryDatabase(
    `
    INSERT INTO subscriptions (email, endpoint, p256dh, auth)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      endpoint = VALUES(endpoint),
      p256dh = VALUES(p256dh),
      auth = VALUES(auth)
  `,
    [user.email, endpoint, p256dh, auth],
    async (err, results) => {
      if (err) {
        console.error("Failed to save subscription:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ success: true });
    }
  );
});

// Get user by id
router.post("/user", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  queryDatabase(
    "SELECT id,username,email FROM users WHERE ID = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("MySQL Query Error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(results[0]);
    }
  );
});

//Login or Register Automatically
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  // Hash the password before storing
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Email and password are required!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    //Check if user exists
    const query = "SELECT id, password FROM users WHERE email = ?";
    queryDatabase(query, [email], async (err, results) => {
      if (err) {
        console.error("MySQL Query Error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (results.length > 0) {
        const user = results[0];

        try {
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return res
              .status(401)
              .json({ error: "Incorrect password. Please try again." });
          }

          return res.json({ message: "Welcome back!", userId: user.id });
        } catch (error) {
          return res.status(500).json({ error: "Internal server error" });
        }
      }

      //User doesn't exist, register them
      const insertQuery =
        "INSERT INTO users (username,email, password) VALUES (?,?, ?)";

      queryDatabase(
        insertQuery,
        [username, email, hashedPassword],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Registration failed" });
          }

          return res.json({
            message: "User registered successfully!",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    console.log("Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
