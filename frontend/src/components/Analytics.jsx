import React, { useState } from "react";
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from "recharts";
import Grabtasks from "./subcomponents/Grabtasks.jsx";
import "./Analytics.css";
import Navbar from "./Navbar.jsx";

function Analytics({ user, socket }) {
  document.title = "Analytics";

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterDays, setFilterDays] = useState(1);

  //Function from Grabtasks.jsx to grab tasks data from db
  const handleTasksFromChild = (data) => {
    if (Array.isArray(data.tasks)) {
      console.log("Data received from child:", data);
      setTasks(data.tasks);
    } else {
      console.warn("Invalid task data received:", data);
      setTasks([]);
    }
  };



  //method to get average time to complete a task
  const calcAverageTime = () => {
    if (tasks.length === 0)
      return [];

    const taskDurations = {};

    tasks.forEach((task) => {
      if(task.info === "emptyBowl" || task.info === "emptyGlass"){
        const start = new Date(task.start)
        const end = new Date(task.end);
        const totalSeconds = (end - start) / 1000; //convert to seconds

        if (!taskDurations[task.info]) {
          taskDurations[task.info] = { total: 0, count: 0 };
        }

        taskDurations[task.info].total += totalSeconds;
        taskDurations[task.info].count++;
      }

    });
    return Object.entries(taskDurations).map(([info, data]) => ({
      name: info,
      avgTime: Math.floor((data.total / data.count) / 60) +
        ":" +
        String(Math.floor((data.total / data.count) % 60)).padStart(2, '0'),
    }));

  }// end of calcAverageTime

  //method to display when a task appeared
  const TaskAppearanceTime = () => {
    if (tasks.length === 0)
      return "No tasks were generated";

    return tasks.map((task) => {
      const start = new Date(task.start);
      const formattedTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;

      return {
        name: task.info,
        Appearances: formattedTime,
      };
    });
  };//end of TaskAppearance

  //Chart to display when a task appears
  const TaskAppearanceChart = () => {
    const taskOccurrences = TaskAppearanceTime();

    return (
      <ResponsiveContainer width="50%" height={400}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis
            type="category"
            dataKey="Appearances"
            name="Time (HH:MM)"
            tickFormatter={(tick) => tick}
          />
          <YAxis dataKey="name" type="category" name="Task Type" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Tasks" data={taskOccurrences} fill="#82ca9d" />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  const formatHour = (hour) => {
    const h = parseInt(hour, 10);
    const startPeriod = h >= 12 ? 'PM' : 'AM';
    const endPeriod = (h + 1) >= 12 ? 'PM' : 'AM';
    const startHour = h % 12 === 0 ? 12 : h % 12;
    const endHour = (h + 1) % 12 === 0 ? 12 : (h + 1) % 12;
    return `${startHour}:00 ${startPeriod} - ${endHour}:00 ${endPeriod}`;
  };
  
  const peakTimes = () => {
    const activity = {};
  
    tasks.forEach((task) => {
      const start = new Date(task.start).getHours();
      activity[start] = (activity[start] || 0) + 1;
    });
  
    return Object.keys(activity).map(hour => ({
      hour: formatHour(hour),
      count: activity[hour],
    }));
  };
  

  const TaskActivityChart = () => {
    return (
      <ResponsiveContainer width="50%" height={450}>
        <BarChart data={peakTimes()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour">
            <Label value="" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis allowDecimals={false}>
            <Label value="Task Activity" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill="#FFBB28" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const taskDuration = () => {
    const categories = {
      "0 - 2 min": 0,
      "2 - 4 mins": 0,
      "4 - 6 mins": 0,
      "6 - 8 mins": 0,
      "8 - 10 mins": 0,
      "10+ mins": 0,
    };

    tasks.forEach((task) => {
      if(task.info === "emptyBowl" || task.info === "emptyGlass"){
        const start = new Date(task.start);
        const end = new Date(task.end);
        const duration = ((end - start) / 1000) / 60 //convert to seconds then minutes

        if (duration < 2)
          categories["0 - 2 min"]++;
        else if (duration >= 2 && duration < 4)
          categories["2 - 4 mins"]++;
        else if (duration >= 4 && duration < 6)
          categories["4 - 6 mins"]++;
        else if (duration >= 6 && duration < 8)
          categories["6 - 8 mins"]++;
        else if (duration >= 8 && duration < 10)
          categories["8 - 10 mins"]++;
        else
          categories["10+ mins"]++;
      }

    })
    return Object.keys(categories).map((key) => ({
      category: key,
      count: categories[key]
    }))

  }//end of taskDuration method

  const TaskDurationChart = () => {
    return (
      <ResponsiveContainer width="50%" height={400}>
        <BarChart data={taskDuration()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category">
            <Label value="" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis allowDecimals={false}>
            <Label value="Task Duration" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const countTasks = () => {
    const counts = tasks.reduce((acc, task) => {
      if(task.info === "emptyBowl" || task.info === "emptyGlass"){
        acc[task.info] = (acc[task.info] || 0) + 1;
        
      }
      return acc;
    }, {});

    // Convert to an array for the chart
    return Object.keys(counts).map((info) => ({
      name: info,
      count: counts[info]
    }));
  };

  //Chart to show count of each tasks
  const TaskDistributionChart = () => {
    return (
      <ResponsiveContainer width="50%" height={400}>
        <BarChart data={countTasks()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name">
            <Label value="" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis allowDecimals={false}>
            <Label value="Task Distributions" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const avgTimes = calcAverageTime();

  return (
    <div id="analytics">



      <div className="selector">
        <div className="selector-container">
          {/* <h1>Analytics</h1> */}
          <div className="grab">
            <Grabtasks onTasksFetched={handleTasksFromChild} />
          </div>
          <div className="averages">
            <h3>Average Completion Time Per Task:</h3>
            {avgTimes.length > 0 ? (
              <ul>
                {avgTimes.map((task, index) => (
                  <li key={index}>{task.name}: {task.avgTime}</li>
                ))}
              </ul>
            ) : (
              <p>No task data available.</p>
            )}
          </div>

        </div>

      </div>

      <div className="charts-container">
        <div className="charts">
          {/* <h3>Task Appearance Times:</h3>
            <TaskAppearanceChart /> */}
          <TaskActivityChart />
          <div>Peak Activity Times</div>

          <TaskDurationChart />
          <div>Task Duration Times</div>

          <TaskDistributionChart />
          <div>Task Distributions</div>

        </div>
      </div>
    </div>
  );

  //hi
}//end of Anaylitics function

export default Analytics;