import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

const Editorpage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //Listeing for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} Joined the room.`);
            console.log(`${username} Joined.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE,{ 
            code : codeRef.current,
            socketId,
        }); 
        }
      );

      //listening for disconnecting
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((perv) =>
          perv.filter((client) => client.socketId !== socketId)
        );
      });
    };
    init();

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
        } catch (e) {
          console.warn("Cleanup error:", e);
        } finally {
          socketRef.current = null;
        }
      }
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
      console.log(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img
              className="logoImage"
              src="/code_live.png"
              alt="code_live_logo"
            />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          {" "}
          COPY ROOMID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          {" "}
          LEAVE ROOM
        </button>
      </div>
      <div className="editorWrap">
        <Editor socketRef={socketRef} roomId={roomId} 
          onCodeChange={(code)=>{
            codeRef.current=code;
          }}
        />
      </div>
    </div>
  );
};

export default Editorpage;
