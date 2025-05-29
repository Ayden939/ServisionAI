import React, { useState, useEffect } from "react";

import "./Leaderboard.css";
function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);

  const handleLeaderboard = async (days) => {

    setCurrentDay(days);

    try {
      const res = await fetch(`/api/grab-leaderboard?days=${days}`);
      const data = await res.json();

      if (Array.isArray(data.leaderboard)) {
        setUsers(data.leaderboard);
      } else {
        console.warn("Invalid leaderboard data received");
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  useEffect(() => {
    setCurrentDay(1);
    handleLeaderboard(1);
  }, []);


  let buttons = [1, 7, 30].map((day) => (
    <button className={`timeButtons day-${day} ${day==currentDay?'active':''}`} onClick={() => handleLeaderboard(day)} key={day}>
      {day === 1 ? "Today" : `${day} Days`}
    </button>
  ));

  return (
    <div id="leaderboard">
      <h1>Leaderboard</h1>
      <div>
        {
          buttons
        }
      </div>

      <div id="leaders">
        {users.slice(0, 3).map((user, index) => {
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div key={user.userid} className="leader">
              {medals[index]} {user.username} ⭐  {user.score}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Leaderboard;
