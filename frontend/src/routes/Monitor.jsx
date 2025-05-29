import { useEffect, useState } from "react";

import { useGlobal } from "../Global.jsx";
import Messaging from "../components/Messaging.jsx";
import Timer from "../components/subcomponents/Timer.jsx";
import "./monitor.css";

import Leaderboard from "../components/Leaderboard.jsx";

function Monitor() {

  document.title = "Monitor";


  const [points, setPoints] = useState("");
  const [taskInfo, setTaskInfo] = useState("");
  const [location, setLocation] = useState("");

  let user = { username: "monitor" };


  const { initSocket, socket, messages, users } = useGlobal();

  const [allTasks, setAllTasks] = useState([]);

  //Start of addTask function
  const addTask = async () => {
    // console.log("Add Task button clicked!");

    if (!points || !taskInfo || !location) {
      alert("Please fill out all fields");
      return;
    }

    try {
      const res = await fetch(`/api/manual-task`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          points,
          taskInfo,
          location,
          status: "pending"
        })
      });
      console.log("Response status:", res.status);

      if (!res.ok) throw new Error("Failed to save task");

      const result = await res.json();
      console.log("Task saved:", result);

      socket.current?.emit("getAllTasks");

      //Clears form
      setPoints("");
      setTaskInfo("");
      setLocation("");

    } catch (err) {
      console.error("Failed to add task:", err);
    }


  }//end of addTask function

  useEffect(() => {

    initSocket(user)



  }, []);

  useEffect(() => {

    if (socket.current) {


      socket.current.on("allTasks", (data) => {
        // console.log("Connected to socket", data);
        setAllTasks(data);

      });

    }
  }, [socket]);


  return (

    <div id="monitor">
   




      {/* <div id="manual-tasks">
        <label htmlFor="points">Points for Task:</label>
        <input type="number" id="points" name="points" value={points} onChange={e => setPoints(e.target.value)} />

        <label htmlFor="info">Task Info/Name:</label>
        <input type="text" id="info" value={taskInfo} onChange={e => setTaskInfo(e.target.value)} />

        <label htmlFor="location">Location:</label>
        <input type="text" id="location" value={location} name="location" onChange={e => setLocation(e.target.value)} />

        <button className="addTaskBtn" onClick={addTask}>Add Task</button>

        <h2>Connected Users</h2>
        {Object.entries(users).map(([email, name]) => (
          <button key={email}>
            {name}
          </button>
        ))}

      </div> */}

      <Messaging socket={socket} messages={messages} user={user} />

      <div>
        <Leaderboard />

        <div id="stats">
          <i className="material-icons-round">group</i>
          {Object.keys(users).length} Users
          <br></br>
          <i className="material-icons-round">task</i>
          {Object.values(allTasks).reduce((sum, tasks) => sum + tasks.length, 0)} Tasks

        </div>
      </div>

      
      <div id="all-tasks">
        {allTasks && Object.entries(allTasks).sort(([, userTasksA], [, userTasksB]) => userTasksB.length - userTasksA.length).map(([username, userTasks]) => (
          <div key={username} className="user-tasks">
            <div className="username">
              <button className="username-button"
              
              onClick={() => {
                const confirmed = window.confirm("Confirm logout?");
                if (confirmed) {
                  socket.current.emit("forceLogout", username);                  
          
                }
      
      
              }}
              > {username}</button>
              {allTasks[username] ? allTasks[username].length : 0} Tasks</div>
            <div id="tasks-container">

              {[...userTasks]
                .sort((a, b) => b.id - a.id)
                .map((task) => (
                  <div key={task.id} className="task">

                    {task.image && (
                      <img
                        width="100px"
                        src={`data:image/jpeg;base64,${task.image}`}
                      />
                    )}
                    <div className="timer">
                      <Timer start={task.id} />
                    </div>

                    <div className="task-info">
                      <b>{task.classname}</b> detected on <b>{task.camera_name}</b> camera  in location <b>{task.location}</b>
                    </div>

                  </div>



                ))}
            </div>

          </div>
        ))}
      </div>


    </div>
  );
}

export default Monitor;