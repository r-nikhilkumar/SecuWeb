import React from 'react';
import { Step } from '../types/securityCheckTypes';

interface StepListProps {
  steps: Step[];
}

const StepList: React.FC<StepListProps> = ({ steps }) => (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop:"5vmin"}}>
    <div style={{ textAlign: 'left'}}>
      {steps.map((step, index) => (
        <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>
            {step.status === 'success' ? '✅' : '⌛'}
          </span>
          <span>{step.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StepList;
