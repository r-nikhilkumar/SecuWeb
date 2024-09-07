export interface Step {
    name: string;
    completed: boolean;
    status: 'pending' | 'success' | 'failure';
  }
  
  export interface SecurityCheckResponse {
    score: string;
    step: string;
    progressMap: { [key: string]: boolean };
    results: {
      sslResult: { sslStatus: string };
      // Add other results...
    };
  }
  
  export interface SecurityCheckState {
    steps: Step[];
    progress: number;
    securityResponse: SecurityCheckResponse | null;
    showScore: boolean;
  }
  