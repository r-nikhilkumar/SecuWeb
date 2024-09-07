import { createReducer } from "@reduxjs/toolkit";
import {
  startSecurityCheck,
  updateStep,
  setFinalScore,
  resetSecurityCheck,
} from "../actions/securityCheckActions";
import { SecurityCheckState } from "../../types/securityCheckTypes";
import SecurityCheckModal from "../../components/SecurityCheckModal";
import { SecurityCheckResult } from "../../components/SecurityCheckModal";

const initialState: SecurityCheckState = {
  steps: [],
  progress: 0,
  securityResponse: null,
  showScore: false,
};

const securityCheckReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(startSecurityCheck, (state) => {
      state.steps = [
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
      state.progress = 0;
      state.showScore = false;
      state.securityResponse = null;
    })
    .addCase(updateStep, (state, action) => {
      const updatedSteps = state.steps.map((step) =>
        step.name === action.payload.step
          ? { ...step, completed: true, status: action.payload.status }
          : step
      );
      state.steps = updatedSteps;
      const completedSteps = updatedSteps.filter(
        (step) => step.completed
      ).length;
      state.progress = (completedSteps / updatedSteps.length) * 100;
    })
    .addCase(setFinalScore, (state, action) => {
      state.securityResponse = action.payload;
      state.showScore = true;
    })
    .addCase(resetSecurityCheck, (state) => {
      return initialState;
    });
});

export default securityCheckReducer;
