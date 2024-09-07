import { SecurityCheckResult } from "../components/SecurityCheckModal";

export const getScore = (score: string) => {
  const match = score.match(/(\d+)/);
  return match ? parseFloat(match[0]) : 0;
};
// Get score for the progress bar and message
export const getScoreColor = (score: string) => {
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


export const defaultSecurityCheckResult: SecurityCheckResult = {
    sslResult: { sslStatus: '' },
    xssResult: { error: '' },
    headersResult: { contentSecurityPolicy: '', xFrameOptions: '', strictTransportSecurity: '' },
    cspResult: { cspStatus: '', cspDetails: '' },
    portScanResult: [],
    sqlInjectionResult: { error: '' },
    dnsResult: { dnsRecords: [] },
    subdomainsResult: [],
    directoryResult: [],
    cookieResult: { cookies: [] },
};