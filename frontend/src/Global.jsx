import { io } from "socket.io-client";

import { createContext, useContext, useState ,useRef, useEffect} from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {

    const socket = useRef(null);

    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);

    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]);

    
  let initSocket = (user) => {

    socket.current = io("/", {
      path: "/api/socket.io",
      transports: ["websocket"],
      secure: true,
    });

    socket.current.on("connect", () => {
      console.log("Connected to socket");
      socket.current.emit("user", user);
    });

    socket.current.on("hello", (data) => {
      console.log("Received from server:", data);
    });

    socket.current?.on("users", (data) => {
      // console.log("Received from server:", data);
      setUsers(data);
    });

    socket.current?.on("messages", (data) => {
        // console.log("Received messages from server:", data);
        setMessages([...data]);
    })

    socket.current?.on("tasks", (data) => {
        // console.log("Received tasks from server:", data);
        setTasks([...data]);
    });

    socket.current?.on("logoutNow", (data) => {
      alert("You have been logged out by the monitor.");
      localStorage.removeItem("userid");
      setUser(null)
      socket.current.disconnect();
      window.location.reload();
      
  });

 
  };



  return (
    <GlobalContext.Provider value={{ socket,initSocket,messages,tasks,user,users,setUser }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}
