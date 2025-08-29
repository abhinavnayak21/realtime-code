import React, { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom"; //navigate to editor page

const Home = () => {

  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const createNewRoom = (e) => { //e -> event
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.length === 0) {
      toast.error("Please enter a room id");
      return;
    }
    if (username.length === 0) {
      toast.error("Please enter a username");
      return;
    }

    //redirect to editor page
    // eslint-disable-next-line no-template-curly-in-string
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      joinRoom(e);
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          className="homePageLogo"
          src="/code_live.png"
          alt="code_live_logo"
        />

        <h4 className="mainLabel">Paste Invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            placeholder="ROOM ID"
            className="inputBox"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />

          <input 
            type="text" 
            placeholder="USERNAME" 
            className="inputBox" 
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />

          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>

          <span className="createInfo">
            Create Invitation &nbsp;
            <a onClick={createNewRoom} href=" " className="createNewBtn">
              New Room
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
