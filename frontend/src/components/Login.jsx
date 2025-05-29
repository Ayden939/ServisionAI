import { useState, useRef, useEffect } from "react";

import Messaging from "./Messaging.jsx";
import Tasks from "./Tasks.jsx";
import Settings from "./Settings.jsx";
import Navbar from "./Navbar.jsx";
import { useGlobal } from "../Global.jsx";

import "../css/login.css";
import loginImage from "../assets/login.svg";
import Leaderboard from "./Leaderboard.jsx";


let getUser = async (userid) => {
  try {
    let response = await fetch(`/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userid }),
    });

    let userData = await response.json();
    return userData;
  } catch (error) {
    console.log("get user error", error);
  }
};

let login = async (formData) => {
  try {
    let response = await fetch(`/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    let loginData = await response.json();
    return loginData;
  } catch (error) {
    console.log("Login Error:", error);
  }
};

function Login() {

  document.title = "Home";
  const { socket, initSocket, messages, tasks, user, setUser } = useGlobal();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  //Auto-login from localStorage
  useEffect(() => {
    console.log("auto-login");
    let userid = localStorage.getItem("userid");

    if (userid) {
      try {
        const parsedId = JSON.parse(userid);
        getUser(parsedId).then((data) => {
          console.log(data);
          setUser(data);
          initSocket(data);
        });
      } catch (error) {
        console.error("Error parsing stored user ID:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    login(formData).then((data) => {
      console.log(data);
      if (data?.userId) {
        localStorage.setItem("userid", JSON.stringify(data.userId));
        getUser(data.userId).then((data) => {
          console.log(data);
          setUser(data);
          initSocket(data);
        });
      }
    });
  };

  const [layer, setLayer] = useState("tasks");

  let layers = {
    "chat": <Messaging key={"chat"} socket={socket} messages={messages} user={user} />,
    "tasks":<Tasks key={"tasks"} socket={socket} user={user} />,
    "settings": <Settings key={"settings"} user={user} />,
  }

  let icons = {
    "chat": "forum",
    "tasks": "task",
    "settings": "manage_accounts",
  }


  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div id="login">
      {user ? (

        <>
        

          {
            windowWidth < 600 && <div id="bottom-bar">
              {Object.keys(layers).map((layerName) => (
                <button
                  id={`${layerName}-button`}
                  key={layerName}
                  onClick={() => {
                    setLayer(layerName);
                  }}
                  className={layer === layerName ? "active" : ""}
                >
                  <div className="icon">

                    <i className="material-icons-round">{icons[layerName]}</i>
                  </div>
                  <div className="text">{layerName}</div>
                </button>
              ))}
            </div>
          }


          {windowWidth < 600 ? layers[layer] :

            <>



              <div id="desktop-mode">

                {Object.keys(layers).map(layer => (
                  layers[layer]
                ))}

              </div>
            </>

          }


        </>
      ) : (
        <>

          <div id="login-container">
            <div id="login-info">
              <h1>AutoTasker</h1>
            </div>
            <img
              id="login-image" src={loginImage} alt="Login" />

            <div id="description">Powered by AI and enhanced with real-time collaboration
            </div>
            <form
              className="login-form"
              onSubmit={handleSubmit}>
              <div className="form-group">
                <div>

                  <input
                    className="login-input"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>


                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div >

                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                </div>
              </div>
              <button className="button" type="submit">Login / Register</button>

              <div id="footer">
          Ronak Mistry • Jay Thao • Ayden Haslam • Kim Bui
            <br/>
            UAFS Computer Science capstone 2025
          </div>

            </form>



            <div id="special-links" >
            
              <a href="/monitor" target="_blank">
                <button>
                  <i className="material-icons-round">dashboard</i>
                  Monitor
                </button>
              </a>
              <a href="/analytics" target="_blank">
                <button>
                  <i className="material-icons-round">query_stats</i>
                  Analytics
                </button>
              </a>
            </div>


          </div>

      

        </>
      )}
    </div>
  );
}

export default Login;
