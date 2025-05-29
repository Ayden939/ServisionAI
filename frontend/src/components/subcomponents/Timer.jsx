import { useState, useEffect } from 'react';

function Timer({ start }) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function update() {
      const now = Date.now();
      const startTime = new Date(start).getTime();
      const elapsedMs = now - startTime;

      const totalSeconds = Math.floor(elapsedMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTime({ hours, minutes, seconds });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [start]);

  return (
    <span>
      {time.hours > 0 && `${time.hours} h `}
      {(time.minutes > 0 || time.hours > 0) && `${time.minutes} m`} {time.seconds} s
      <i className="material-icons-round">alarm</i>

    </span>
  );
}

export default Timer;
