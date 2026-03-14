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
    <div className="border-t border-border p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className={`max-w-3xl mx-auto px-6 py-4 rounded-xl ${
        speaker === "ai" 
          ? "bg-primary/85 text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      }`}>
        <p className="text-center text-lg font-medium">
          {text}
        </p>
      </div>
    </div>
  );
};
