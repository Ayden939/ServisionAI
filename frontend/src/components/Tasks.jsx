import { useState, useRef, useEffect } from "react";
import Timer from "./subcomponents/Timer";
import "../css/tasks.css";


function toMySQLDate(ms) {
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

import { useGlobal } from "../Global.jsx";

import Leaderboard from "./Leaderboard.jsx";


function Tasks({ user, socket }) {

  const { tasks } = useGlobal();

  let taskAction = async (action, task) => {

    let data = {}
    data.userid = user.id;
    data.email = user.email;
    data.points = task.points;
    data.info = task.classname;
    data.status = action;
    data.location = task.location
    data.start = toMySQLDate(task.id)
    data.end = toMySQLDate(Date.now())
    data.taskid = task.id

    try {
      let response = await fetch(`/api/save-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let userData = await response.json();
      return userData;
    } catch (error) {
      console.log("get user error", error);
    }


  }

  return (
    <div id="tasks">
      <Leaderboard />
      <div id="tasks-container">
        {tasks?.length > 0 ? (
          [...tasks]
            .sort((a, b) => b.id - a.id)
            .map((task) => (
              <div key={task.id} className="task">



                {task.image && (
                  <img
                    width="100px"
                    src={`data:image/jpeg;base64,${task.image}`}
                  />
                )}


                <div className="task-info">
                  <div className="points">
                    <i className="material-icons-round">star</i>{task.points}
                  </div>
                  <div className="timer">
                    <Timer start={task.id} />
                  </div>
                  <div className="task-desc">
                    <b>{task.classname}</b> detected on <b>{task.camera_name}</b> camera  in location <b>{task.location}</b>
                  </div>

                </div>

                <button
                  id="dismiss-button"
                  onClick={() => {
                    const confirmed = window.confirm("Dismiss task?");
                    if (confirmed) {
                      taskAction("dismiss", task);
                    }
                  }}

                >
                  <i className="material-icons-round">close</i>

                  dismiss</button>


                <button
                  id="confirm-button"
                  onClick={() => {
                    const confirmed = window.confirm("Confirm task?");
                    if (confirmed) {
                      taskAction("confirm", task);
                    }
                  }}

                >
                  <i className="material-icons-round">check</i>
                  confirm </button>



              </div>
            ))
        ) : (
          <div className="no-tasks">No tasks available...</div>
        )}
      </div>

    </div>
  );
}

export default Tasks;
