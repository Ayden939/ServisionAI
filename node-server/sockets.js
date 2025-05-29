const { Server } = require("socket.io");
const globalState = require("./data");

const sendPushNotification = require("./notifications");


const websocket = (server) => {
  globalState.io = new Server(server, {
    path: "/api/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  globalState.io.on("connection", (socket) => {

    socket.emit("hello", { message: "connected to node server" });

    socket.emit("allTasks", globalState.tasks);


    let userEmail = null;

    socket.on("user", (user) => {
      console.log("User connected:", user);
      if (user?.email) {
        userEmail = user.email;
        globalState.userSocketMap.set(userEmail, socket.id);
        globalState.usersEmails.set(userEmail, user.username);


        if (userEmail && !globalState.tasks[userEmail]) {
          globalState.tasks[userEmail] = [];
        }
        socket.emit("tasks", globalState.tasks[userEmail]);

        globalState.io.emit(
          "allTasks",
          globalState.tasks
        );

        globalState.io.emit(
          "users",
          Object.fromEntries(globalState.usersEmails)
        );
      }

      //sync
      socket.emit("messages", globalState.messages);
      globalState.io.emit(
        "users",
        Object.fromEntries(globalState.usersEmails)
      );

    });

    let redistributeTasks = (tasks) => {
      console.log("redistributing tasks", tasks);

      tasks.forEach((task) => {
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

        globalState.tasks[freeUser].push(task);

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



      })


    }


    socket.on("forceLogout", (userEmail) => {
      console.log("User logged out by monitor:", userEmail);

      redistributeTasks(globalState.tasks[userEmail]);


      let targetSocketId = globalState.userSocketMap.get(userEmail);
      console.log("targetSocketId", targetSocketId);

      if (targetSocketId) {
        let targetSocket = globalState.io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit("logoutNow");


          globalState.userSocketMap.delete(userEmail);
          globalState.usersEmails.delete(userEmail);
          delete globalState.tasks[userEmail];
          globalState.io.emit(
            "users",
            Object.fromEntries(globalState.usersEmails)
          );

          globalState.io.emit(
            "allTasks",
            globalState.tasks
          );
        }
      }

    });

    socket.on("logout", (userEmail) => {
      console.log("User logged out:", userEmail);

      // globalState.tasks[userEmail]

      globalState.userSocketMap.delete(userEmail);
      globalState.usersEmails.delete(userEmail);
      delete globalState.tasks[userEmail];
      globalState.io.emit(
        "users",
        Object.fromEntries(globalState.usersEmails)
      );

      globalState.io.emit(
        "allTasks",
        globalState.tasks
      );

      socket.emit("logout-success");

    });

    socket.on("disconnect", () => {
      globalState.io.emit(
        "users",
        Object.fromEntries(globalState.usersEmails)
      );
    });


    socket.on("sentMessage", (msg) => {
      globalState.messages.push(msg);
      //io send to all clients
      globalState.io.emit("messages", globalState.messages);
    });


    socket.on("notifyEveryone", (msg) => {
      console.log("sendToAll", msg);
      // notify all connected users except the sender
      for (const email of Array.from(globalState.usersEmails.keys()).filter(email => email !== msg.email)) {
        console.log("Sending push notification to", email);
        sendPushNotification({
          title: 'New message',
          message: `${msg.from} : ${msg.message}`,
          target: email,
        });
      }
    });

    socket.on("sendToUser", ({ email, message, from }) => {

      sendPushNotification(
        {
          title: `New message`,
          message: `${from} : ${message}`,
          target: email,
        }
      );

    });
  });
};

module.exports = websocket;
