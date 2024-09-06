// SecurityCheck.tsx
import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import SecurityCheckModal from "./SecurityCheckModal";
import { Button } from "react-bootstrap";

interface Step {
  name: string;
  completed: boolean;
  status: "pending" | "success" | "failure";
}

interface SecurityCheckResponse {
  progressMap: { [key: string]: boolean };
  step: string;
  score: string;
  results: {
    sslResult: { sslStatus: string };
    xssResult: { error: string };
    headersResult: {
      contentSecurityPolicy: string;
      xFrameOptions: string;
      strictTransportSecurity: string;
    };
    cspResult: { cspStatus: string; cspDetails: string };
    portScanResult: { port: number; status: string }[];
    sqlInjectionResult: { error: string };
    dnsResult: { dnsRecords: { value: string; type: string }[] };
    subdomainsResult: { subdomain: string; status: string }[];
    directoryResult: { path: string; status: string }[];
    cookieResult: {
      cookies: {
        cookie: string;
        flags: { httpOnly: boolean; secure: boolean; sameSite: boolean };
      }[];
    };
  };
}

const SecurityCheck: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [securityResponse, setSecurityResponse] =
    useState<SecurityCheckResponse | null>(null);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [showScore, setShowScore] = useState<boolean>(false);

  const handleUrlSubmit = () => {
    setShowScore(false);
    setProgress(0);
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({ url }));

      const initialSteps: Step[] = [
        { name: "SSL Check", completed: false, status: "pending" },
        { name: "XSS Check", completed: false, status: "pending" },
        { name: "Security Headers Check", completed: false, status: "pending" },
        { name: "CSP Check", completed: false, status: "pending" },
        { name: "Port Scan", completed: false, status: "pending" },
        { name: "SQL Injection Check", completed: false, status: "pending" },
        { name: "DNS Records Check", completed: false, status: "pending" },
        { name: "Subdomain Enumeration", completed: false, status: "pending" },
        { name: "Directory Scanning", completed: false, status: "pending" },
        { name: "Cookie Security Check", completed: false, status: "pending" },
      ];

      setSteps(initialSteps);
    };

    ws.onmessage = (event) => {
      const data: SecurityCheckResponse = JSON.parse(event.data);
      console.log(data);

      if (data.step === "Final Score") {
        setSecurityResponse(data);
        setShowScore(true);
        // setModalShow(true); // Show the modal when final score is received
      } else {
        setSteps((prevSteps: any) => {
          const updatedSteps = prevSteps.map((step: any) =>
            step.name === data.step
              ? { ...step, completed: true, status: "success" }
              : step
          );

          const completedSteps = updatedSteps.filter(
            (step: any) => step.completed
          ).length;
          const totalSteps = updatedSteps.length;
          setProgress((completedSteps / totalSteps) * 100);
          return updatedSteps;
        });
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };

  const handleShowModal = () => {
    setModalShow(true);
  };

  const getScore = (score: string) => {
    const match = score.match(/(\d+)/);
    return match ? parseFloat(match[0]) : 0;
  };
  // Get score for the progress bar and message
  const getScoreColor = (score: string) => {
    if (!score) return { color: "#f88", message: "No score available" };

    // Extract the numeric score using regex
    const numericScore = getScore(score);

    // If a match is found, parse it to float

    // Determine score color and message
    if (numericScore >= 70) return { color: "green", message: "Great job! 🎉" };
    if (numericScore >= 50)
      return {
        color: "orange",
        message: "Good efforts, improvement required!",
      };
    return { color: "red", message: "Needs significant improvement!" };

    return { color: "#f88", message: "Invalid score format" };
  };

  const { color, message } = securityResponse
    ? getScoreColor(securityResponse.score)
    : { color: "#f88", message: "" };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
      <h2>Real-time Security Check</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          style={{ padding: "10px", width: "80%" }}
        />
        <Button
          onClick={handleUrlSubmit}
          style={{ padding: "10px", marginLeft: "10px" }}
        >
          Start
        </Button>
      </div>

      <div style={{ width: 150, height: 150, margin: "auto" }}>
        {!showScore ? (
          <CircularProgressbar
            value={progress}
            text={`${Math.round(progress)}%`}
            styles={buildStyles({
              textColor: "#000",
              pathColor: progress > 50 ? "blue" : "gray",
              trailColor: "#d6d6d6",
            })}
          />
        ) : (
          <CircularProgressbar
            value={getScore(securityResponse?.score!)}
            text={`${Math.round(getScore(securityResponse?.score!))}%`}
            styles={buildStyles({
              textColor: "#000",
              pathColor:
                getScore(securityResponse?.score!) >= 65 ? color : "#f88",
              trailColor: "#d6d6d6",
            })}
          />
        )}
      </div>

      {!showScore && (
        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>Steps Status</h3>
          {steps.map((step, index) => (
            <p key={index} style={{ display: "flex", alignItems: "center" }}>
              {step.status === "success" && (
                <span style={{ color: "green", marginRight: "5px" }}>✅</span>
              )}
              {step.status === "failure" && (
                <span style={{ color: "red", marginRight: "5px" }}>❌</span>
              )}
              {step.status === "pending" && (
                <span style={{ color: "orange", marginRight: "5px" }}>➖</span>
              )}
              {step.name}
            </p>
          ))}
        </div>
      )}

      {showScore && (
        <h4 style={{ color: color, marginTop: "20px" }}>
          <div>{message}</div>
          <div>{securityResponse?.score}</div>
        </h4>
      )}

      <SecurityCheckModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        score={securityResponse ? securityResponse.score : null}
        results={securityResponse ? securityResponse.results : null}
      />
      <Button
        onClick={handleShowModal}
        style={{ marginTop: "20px" }}
        disabled={!securityResponse}
      >
        View Detailed Results
      </Button>
    </div>
  );
};

export default SecurityCheck;
