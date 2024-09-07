import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  startSecurityCheck,
  updateStep,
  setFinalScore,
} from "../../redux/actions/securityCheckActions";
import StepList from "../../components/StepList";
import { PuffLoader } from 'react-spinners';
import Spinner from "../../components/Spinner/Spinner"; // Assuming Spinner component exists
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  defaultSecurityCheckResult,
  getScore,
  getScoreColor,
} from "../../utils/helperFunctions"; // Utility function for score extraction
import SecurityCheckModal from "../../components/SecurityCheckModal";
import { Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SecurityCheck: React.FC = () => {
  const [url, setUrl] = useState<string>(""); // Store user input URL
  const [loading, setLoading] = useState<boolean>(false); // Control spinner state
  const [modalShow, setModalShow] = useState<boolean>(false);

  const dispatch: AppDispatch = useDispatch();
  const { steps, showScore, securityResponse } = useSelector(
    (state: RootState) => state.securityCheck
  );

  // WebSocket communication handler
  const handleWebSocket = (ws: WebSocket) => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.final) {
        dispatch(setFinalScore(data)); // Dispatch final score to Redux store
        setLoading(false); // Stop spinner
        toast.success('Website security analysis completed!');
      } else {
        dispatch(updateStep({ step: data.step, status: "success" })); // Update step status in Redux
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setLoading(false); // Stop spinner on close
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert("Connection error. Please try again."); // Error handling
      setLoading(false); // Stop spinner on error
    };
  };

  const isValidUrl = (url: string) => {
    // Regular expression to validate URL
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // Validate protocol (optional)
        "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // Domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IPv4
        "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + // Port and path
        "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // Query string
        "(\\#[-a-zA-Z\\d_]*)?$", // Fragment locator
      "i"
    );
    return !!urlPattern.test(url);
  };

  // Handle form submission
  const handleUrlSubmit = () => {
    if (!url || !isValidUrl(url)) {
      toast.error("Please enter a valid URL."); // Basic input validation
      return;
    }

    setLoading(true); // Start spinner
    dispatch(startSecurityCheck()); // Dispatch action to start security check

    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WebSocket connected.");
      ws.send(JSON.stringify({ url })); // Send URL to server for security check
      handleWebSocket(ws); // Set up WebSocket listeners
    };
  };

  const { color, message } = securityResponse
    ? getScoreColor(securityResponse.score)
    : { color: "#f88", message: "" };

  // Function to render the circular progress bar or spinner
  const renderProgress = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '15vmax' }}>
          <PuffLoader color="green" loading={loading} size={150} />
        </div>
      )
    } else if (showScore && securityResponse?.score) {
      const scoreValue = getScore(securityResponse.score);
      return (
        <div style={{ width: "20vmax", height: "20vmax", margin: "0 auto" }}>
          <CircularProgressbar
            value={scoreValue}
            text={`${Math.round(scoreValue)}%`}
            styles={buildStyles({
              textSize: "10px", // Smaller text size for a more compact look
              textColor: "#000",
              pathColor: scoreValue >= 65 ? "green" : "#f88",
              trailColor: "#d6d6d6",
              strokeLinecap: "butt", // Make the ends flat for a thinner line appearance
            })}
          />
        </div>
      );
    }

    return null; // Show nothing if not loading and no score
  };


  return (
    <div style={{ margin: "0 auto", padding: "10px" }}>
      <h2>Website Security Check</h2>

      {/* Input field for URL */}
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          style={{
            padding: "8px",
            width: "70%",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleUrlSubmit}
          style={{
            padding: "8px 16px",
            marginLeft: "10px",
            fontSize: "14px",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Start
        </button>
      </div>

      <div>{renderProgress()}</div>
      {showScore && (
        <h4 style={{ color: color, marginTop: "20px" }}>
          <div>{message}</div>
          <div>{securityResponse?.score}</div>
        </h4>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {!showScore && <StepList steps={steps} />}

      {securityResponse && (
        <SecurityCheckModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          score={securityResponse ? securityResponse.score : null}
          results={securityResponse.results}
        />
      )}
      <Button
        onClick={() => setModalShow(true)}
        disabled={!securityResponse}
        style={{ marginTop: "3vmax" }}
      >
        View Detailed Results
      </Button>
    </div>
  );
};

export default SecurityCheck;
