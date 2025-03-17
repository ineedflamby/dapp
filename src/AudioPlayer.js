import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const AudioPlayer = forwardRef(({ audioSrc, trackName }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Expose play method to parent component
  useImperativeHandle(ref, () => ({
    playAudio() {
      if (!error && !isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Playback started successfully");
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error("Playback failed:", err);
              setError(
                "Playback failed. This might be due to browser restrictions. Please try again."
              );
            });
        }
      }
    },
  }));

  // Load audio metadata when component mounts
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
      setError(null);
    };

    const handleError = (e) => {
      console.error("Audio error details:", e);
      setError(`Failed to load audio file. Check the path: ${audioSrc}. Error: ${e.message}`);
      setLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
    };
  }, [audioSrc]);

  // Update current time while playing
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (error) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Playback started successfully");
          })
          .catch((err) => {
            console.error("Playback failed:", err);
            setError(
              "Playback failed. This might be due to browser restrictions. Please try again."
            );
          });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e) => {
    if (error || !duration) return;

    const newTime = (e.nativeEvent.offsetX / progressBarRef.current.offsetWidth) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="audio-player"
      style={{
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        padding: "10px",
        width: "680px",
        height: "90px",
        boxShadow: "0 2px 50px rgba(0,0,0,0.8)",
        marginRight: "auto",
        marginLeft: "20px",
        position: "fixed",
        bottom: "138px",
        right: "1210px",
        stroke: "10px"
      }}
    >
      <audio
        ref={audioRef}
        style={{
          display: "none",
          visibility: "hidden",
          opacity: 0,
          position: "absolute",
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
      >
        <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="track-info" style={{ marginBottom: "5px" }}>
        <span style={{ fontSize: "14px", color: "#333" }}>{trackName || "Unknown Track"}</span>
      </div>

      {loading && !error && <div style={{ padding: "10px", textAlign: "center" }}>Loading audio...</div>}

      {error && (
        <div style={{ color: "red", padding: "10px", fontSize: "12px" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            className="time-display"
            style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleProgressChange}
            style={{
              height: "6px",
              backgroundColor: "#ddd",
              borderRadius: "3px",
              cursor: "pointer",
              position: "relative",
              marginBottom: "10px",
            }}
          >
            <div
              className="progress"
              style={{
                width: `${(currentTime / duration) * 100}%`,
                backgroundColor: "#ff0000",
                height: "100%",
                borderRadius: "3px",
              }}
            />
          </div>
        </>
      )}

      <div className="controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={togglePlay}
          style={{
            backgroundColor: error ? "#999" : "#333",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: error ? "not-allowed" : "pointer",
          }}
          disabled={error}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>

        <div className="volume-control" style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "5px" }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.5"
            onChange={(e) => (audioRef.current.volume = e.target.value)}
            style={{ width: "80px" }}
            disabled={error}
          />
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;