import { useState, useRef, useEffect } from "react";

import { useGlobal } from "../Global.jsx";

import "../css/chat.css";

function Messaging({ user }) {


  const { socket, messages, users } = useGlobal();


  const chats = useRef();


  let sendMessage = (message) => {
    socket.current?.emit("sentMessage", {
      from: user?.username,
      message,
      time: Date.now(),
    });

    
  }

  useEffect(() => {
    chats.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  },[messages])
  

  return (
    <div id="messages"  >
      
      <div id="users">
        {
         Object.entries(users).filter(([email]) => email != user.email).length == 0&& 
         <div className="no-users">
            <i className="material-icons-round">person</i>
           No users available...  
         </div>
        
        }
        {
          Object.entries(users).filter(([email]) => email != user.email).map(([email, name]) => (
            <button key={email}
              onClick={() => {
                let message = prompt(`Enter message to send to ${name}`);
                if (message) {
                  sendMessage(`@${name} ` + message)
                  let data = {
                    email: email,
                    message: message,
                    from: user.username,
                  }
                  socket.current.emit("sendToUser", data);
                }

              }}
            >
              <i className="material-icons-round">person</i>

              {name}
            </button>
          ))}
      </div>
      <div id="messages-container" ref={chats}>
        {messages?.length > 0 ? (

          messages
            .sort((a, b) => b.time - a.time)
            .map((m, index) => (
              <div key={index} className="message">
                <div className="from">
                <i className="material-icons-round">account_circle</i>
                
                  {m?.from}</div>
                <div className="text">{m?.message}</div>
                <div className="time">
                  {new Date(m?.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>

              </div>
            ))

        ) :
          (
            <div className="no-messages">
              No messages available...
            </div>
          )
        }

        <button
          id="send-chat-button"
          onClick={() => {
            let message = prompt("Enter message:")
            if (message) {

              sendMessage(`@everyone ` + message)


              let data = {
                email: user.email,
                message: message,
                from: user.username,
              }
              socket.current.emit("notifyEveryone", data);

          
            }
          }}
        >
          <i className="material-icons-round">send</i>everyone
        </button>
      </div>



    </div>
  );
}

export default Messaging;
