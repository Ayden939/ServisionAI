import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import "./Grabtasks.css";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from "date-fns";

function Grabtasks({ onTasksFetched }) {


  const [selectionRange, setSelectionRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: 'selection',
    },
  ]);


  useEffect(() => {
    handleGrabTasks();
  }, []);

  const handleSelect = (ranges) => {
    setSelectionRange([ranges.selection]);
  };

  const handleGrabTasks = async () => {
    const { startDate, endDate } = selectionRange[0];

    const formattedStart = format(startDate, "yyyy-MM-dd HH:mm:ss");
    const formattedEnd = format(endDate, "yyyy-MM-dd HH:mm:ss");

    try {
      const response = await fetch("/api/grab-tasksusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: formattedStart,
          end: formattedEnd,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Tasks fetched successfully:", data.tasks);
        onTasksFetched(data);
      } else {
        console.error("Error fetching tasks:", data.error);
      }
    } catch (error) {
      console.error("Error making request:", error);
    }
  };

  return (
    <div>
      <div className="datetime">
        <DateRange
          ranges={selectionRange}
          onChange={handleSelect}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={1}
          direction="horizontal"
        />
      </div>

      <button className="grab-task-btn" onClick={handleGrabTasks}>Analyze</button>
    </div>
  );
}

export default Grabtasks;
