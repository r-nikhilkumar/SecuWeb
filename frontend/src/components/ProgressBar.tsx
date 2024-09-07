import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressBarProps {
  progress: number;
  score: string | undefined;
  showScore: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, score, showScore }) => {
  return (
    <div style={{ width: 150, height: 150 }}>
      {!showScore ? (
        <CircularProgressbar value={progress} text={`${Math.round(progress)}%`} styles={buildStyles({ pathColor: 'blue' })} />
      ) : (
        <CircularProgressbar value={parseFloat(score || '0')} text={`${score || 0}%`} styles={buildStyles({ pathColor: 'green' })} />
      )}
    </div>
  );
};

export default ProgressBar;
