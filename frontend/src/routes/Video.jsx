
import React, { useState, useRef, useEffect } from "react";

import "../css/video.css";
import Navbar from "../components/Navbar.jsx";
function Video() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraNameRef = useRef();

  const [cameraName, setCameraName] = useState("cam");
  useEffect(() => {
    cameraNameRef.current = cameraName;
  }, [cameraName]);

  
  const width = 640;
  const height = 480;
  

  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  let test = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    canvasRef.current.toBlob((blob) => {
      const formData = new FormData();
      formData.append("frame", blob);

      fetch("/ai/collect", {
        method: "POST",
        body: formData,
      });
    }, "image/jpeg");
  }

  let sendFrame = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    canvasRef.current.toBlob((blob) => {
      const formData = new FormData();
      formData.append("frame", blob);
      formData.append("camera_name", cameraNameRef.current);

      fetch("/ai/video", {
        method: "POST",
        body: formData,
      });
    }, "image/jpeg");
  }


  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        sendFrame();
      }, 3000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isStreaming]);

  const [isCollecting, setIsCollecting] = useState(false);
  const intervalRefCollecting = useRef(null);
  useEffect(() => {
    if (isCollecting) {
      intervalRefCollecting.current = setInterval(() => {
        test();
      }, 500);
    } else {
      clearInterval(intervalRefCollecting.current);
    }

    return () => clearInterval(intervalRefCollecting.current);
  }, [isCollecting]);

  return (
    <div id="video-container">
    
        <video ref={videoRef} autoPlay playsInline height={height} width={width} />

      <div id="controls">
       
          <input
          placeholder="Camera Name"
            type="text"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
            className="camera-name-input"
          />
    

        <div id="buttons">
          <button onClick={()=>setIsCollecting(prev=>!prev)} className="send-frame-btn"
          >{isCollecting ? "Stop Collecting" : "Collect Data"}</button>
          <button onClick={() => setIsStreaming(prev => !prev)} className="stream-btn">
            {isStreaming ? "Stop Streaming" : "Start Streaming"}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} width={width} height={height} style={{ display: "none" }} />
    </div>
  );
}
export default Video;



