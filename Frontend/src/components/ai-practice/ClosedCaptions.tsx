interface ClosedCaptionsProps {
  text: string;
  isVisible: boolean;
  speaker: "ai" | "user";
}

export const ClosedCaptions = ({ text, isVisible, speaker }: ClosedCaptionsProps) => {
  if (!isVisible || !text) {
    return null;
  }

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-2xl w-[90%] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`px-6 py-4 rounded-xl backdrop-blur-md ${
        speaker === "ai" 
          ? "bg-primary/80 text-primary-foreground" 
          : "bg-secondary/80 text-secondary-foreground"
      }`}>
        <p className="text-center text-lg font-medium">
          {text}
        </p>
      </div>
    </div>
  );
};
