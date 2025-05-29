
import { Notifications } from "./Notifications.jsx";

import "../css/settings.css";

import { useGlobal } from "../Global.jsx";
function Settings() {

  const { socket, setUser, user } = useGlobal();

  const { requestNotificationPermission } =
    Notifications(user);

  return (
    <div id="settings">

      <div className="user-info">
        <i className="material-icons-round">person</i>
        {user?.username}
        <i className="material-icons-round">email</i>
        {user?.email}
      </div>


      <button
        id="notifications-button"
        onClick={() => {
          const confirmed = window.confirm("Approve notifications? \nIphone users need to add the app to their home screen to get notifications.");
          if (confirmed) {
            requestNotificationPermission()
          }

        }}>
        <i className="material-icons-round">notifications</i>

        approve notifications
      </button>

      <button
        id="logout"
        onClick={() => {
          const confirmed = window.confirm("Confirm logout?");
          if (confirmed) {
            socket.current.emit("logout", user.email);

            socket.current.on("logout-success", () => {
              localStorage.removeItem("userid");
              socket.current.disconnect();
              setUser(null);
            });
            
     
          }


        }}
      >
        <i className="material-icons-round">logout</i>
        Logout
      </button>

    </div>
  );
}

export default Settings;
