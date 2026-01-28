import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/reels.css";
import ReelFeed from "../../components/ReelFeed";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch food videos + check auth (middleware based)
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/food", {
        withCredentials: true,
      })
      .then((response) => {
        setVideos(response.data.foodItems);
        setIsLoggedIn(true); // ✅ token valid
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setIsLoggedIn(false); // ❌ not logged in
        }
      });
  }, []);

  // Like video
  async function likeVideo(item) {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                likeCount: response.data.like
                  ? v.likeCount + 1
                  : v.likeCount - 1,
              }
            : v
        )
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  }

  // Save video
  async function saveVideo(item) {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodId: item._id },
        { withCredentials: true }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                saveCount: response.data.save
                  ? v.saveCount + 1
                  : v.saveCount - 1,
              }
            : v
        )
      );
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  // Logout
  async function logout() {
    try {
      await axios.get("http://localhost:3000/api/auth/user/logout", {
        withCredentials: true,
      });

      setIsLoggedIn(false);
      setVideos([]);
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <>
      {/* Logout button – only if logged in */}
      {isLoggedIn && (
        <div style={{ textAlign: "right", padding: "12px" }}>
          <button className="btn-ghost danger" onClick={logout}>
            Logout
          </button>
        </div>
      )}

      <ReelFeed
        items={videos}
        onLike={likeVideo}
        onSave={saveVideo}
        emptyMessage="No videos available."
      />
    </>
  );
};

export default Home;
