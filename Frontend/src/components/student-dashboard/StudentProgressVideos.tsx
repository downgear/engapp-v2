import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import type { ProgressVideos } from "@/types";
import { Video, Upload, PlayCircle, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudentProgressVideosProps {
  studentId: number;
  courseId: number;
}

export const StudentProgressVideos = ({ studentId, courseId }: StudentProgressVideosProps) => {
  const { language } = useLanguage();
  const [videos, setVideos] = useState<ProgressVideos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<'before' | 'after' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await api.getStudentProgressVideos(studentId, courseId);
      setVideos(data);
    } catch (err) {
      console.error("Failed to fetch progress videos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, courseId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleUpload = async (file: File, videoType: 'before' | 'after') => {
    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError(language === "vi" ? "Video không được vượt quá 100MB" : "Video must be under 100MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError(language === "vi" ? "Chỉ chấp nhận file video" : "Only video files accepted");
      return;
    }

    setUploadingType(videoType);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    // Simulate progress during upload
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const result = await api.uploadStudentVideo(studentId, courseId, videoType, file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setVideos(result);
      setSuccess(`Upload video ${videoType === 'before' ? (language === "vi" ? 'trước' : 'before') : (language === "vi" ? 'sau' : 'after')} ${language === "vi" ? 'thành công!' : 'successful!'}`);
      
      setTimeout(() => {
        setSuccess(null);
        setUploadProgress(0);
      }, 3000);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : (language === "vi" ? "Upload thất bại" : "Upload failed"));
    } finally {
      setUploadingType(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, videoType: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, videoType);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDelete = async (videoType: 'before' | 'after') => {
    if (!confirm(language === "vi" ? `Bạn có chắc muốn xóa video ${videoType === 'before' ? 'trước' : 'sau'}?` : `Are you sure you want to delete the ${videoType} video?`)) return;
    
    try {
      const result = await api.deleteStudentVideo(studentId, courseId, videoType);
      setVideos(result);
      setSuccess(language === "vi" ? `Đã xóa video ${videoType === 'before' ? 'trước' : 'sau'}` : `${videoType === 'before' ? 'Before' : 'After'} video deleted`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === "vi" ? "Xóa thất bại" : "Delete failed"));
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-orange-500" />
            {language === "vi" ? "Video trước và sau" : "Before & After Videos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5 text-orange-500" />
          {language === "vi" ? "Video trước và sau" : "Before & After Videos"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Upload progress */}
        {uploadingType && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {language === "vi" ? "Đang upload video" : "Uploading video"} {uploadingType === 'before' ? (language === "vi" ? 'trước' : 'before') : (language === "vi" ? 'sau' : 'after')}...
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Before Video */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-blue-300 text-blue-600 dark:text-blue-400">
                {language === "vi" ? "Trước khi học" : "Before"}
              </Badge>
              {videos?.beforeVideo && (
                <button 
                  onClick={() => handleDelete('before')}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  title={language === "vi" ? "Xóa video" : "Delete video"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative aspect-[9/16] max-h-[280px] bg-muted rounded-lg overflow-hidden">
              {videos?.beforeVideo ? (
                <video
                  src={videos.beforeVideo.fileUrl}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => beforeInputRef.current?.click()}
                >
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Upload className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-foreground">{language === "vi" ? "Upload video trước" : "Upload before video"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{language === "vi" ? "Nhấn để chọn video (tối đa 100MB)" : "Click to select video (max 100MB)"}</p>
                  </div>
                </div>
              )}
            </div>
            {videos?.beforeVideo ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate max-w-[70%]">
                  {videos.beforeVideo.fileName}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => beforeInputRef.current?.click()}
                  disabled={!!uploadingType}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {language === "vi" ? "Thay đổi" : "Change"}
                </Button>
              </div>
            ) : null}
            <input
              ref={beforeInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'before')}
              disabled={!!uploadingType}
            />
          </div>

          {/* After Video */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-green-300 text-green-600 dark:text-green-400">
                {language === "vi" ? "Sau khi học" : "After"}
              </Badge>
              {videos?.afterVideo && (
                <button 
                  onClick={() => handleDelete('after')}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  title={language === "vi" ? "Xóa video" : "Delete video"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative aspect-[9/16] max-h-[280px] bg-muted rounded-lg overflow-hidden">
              {videos?.afterVideo ? (
                <video
                  src={videos.afterVideo.fileUrl}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => afterInputRef.current?.click()}
                >
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Upload className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-foreground">{language === "vi" ? "Upload video sau" : "Upload after video"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{language === "vi" ? "Nhấn để chọn video (tối đa 100MB)" : "Click to select video (max 100MB)"}</p>
                  </div>
                </div>
              )}
            </div>
            {videos?.afterVideo ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate max-w-[70%]">
                  {videos.afterVideo.fileName}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => afterInputRef.current?.click()}
                  disabled={!!uploadingType}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {language === "vi" ? "Thay đổi" : "Change"}
                </Button>
              </div>
            ) : null}
            <input
              ref={afterInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'after')}
              disabled={!!uploadingType}
            />
          </div>
        </div>

        {/* Info text */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {language === "vi" ? "Upload video nói tiếng Anh trước và sau khóa học để theo dõi sự tiến bộ của bạn" : "Upload your English speaking videos before and after the course to track your progress"}
        </p>
      </CardContent>
    </Card>
  );
};
