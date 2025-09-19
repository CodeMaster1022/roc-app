interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="w-full bg-muted h-2">
      <div 
        className="h-full bg-button-gradient transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};