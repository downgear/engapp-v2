import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface VideoPlayerProps {
  src: string;
  label: string;
  badge: string;
}

const VideoPlayer = ({ src, label, badge }: VideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
          {badge}
        </span>
      </div>
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden shadow-lg group">
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Overlay Controls */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleMute}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RealResults = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            {t("results.title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("results.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <VideoPlayer
            src="/videos/student-before.mp4"
            label={t("results.before")}
            badge={t("results.entryTest")}
          />
          <VideoPlayer
            src="/videos/student-after.mp4"
            label={t("results.after")}
            badge={t("results.graduation")}
          />
        </div>

        {/* Demo Note */}
        <p className="text-center text-sm text-muted-foreground mt-8 italic">
          * {t("results.demoNote")}
        </p>

        {/* View Program Button */}
        <div className="text-center mt-8">
          <Button asChild size="lg" className="text-lg h-14 px-8">
            <Link to="/inaugural-program">{t("results.viewProgram")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
