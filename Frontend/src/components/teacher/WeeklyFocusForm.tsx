import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, X, Save, Loader2, CheckCircle2, BookOpen } from "lucide-react";
import { api, type WeeklyFocusResponse } from "@/services/api";
import { toast } from "sonner";

interface WeeklyFocusFormProps {
  teacherId: number;
  accessToken: string;
  language: string;
  modules: Array<{ id: number; moduleNumber: number; title: string; topic: string }>;
}

export const WeeklyFocusForm = ({ teacherId, accessToken, language, modules }: WeeklyFocusFormProps) => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [weekTopic, setWeekTopic] = useState("");
  const [speakingGoals, setSpeakingGoals] = useState<string[]>([""]);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingFocus, setExistingFocus] = useState<WeeklyFocusResponse | null>(null);
  const [savedFocuses, setSavedFocuses] = useState<WeeklyFocusResponse[]>([]);

  // Load existing focuses for this teacher
  useEffect(() => {
    const load = async () => {
      try {
        const focuses = await api.getWeeklyFocusByTeacher(accessToken, teacherId);
        setSavedFocuses(focuses);
      } catch {
        // ignore
      }
    };
    load();
  }, [accessToken, teacherId]);

  // When module is selected, load existing focus
  useEffect(() => {
    if (!selectedModuleId) return;
    const existing = savedFocuses.find(f => f.moduleId === selectedModuleId);
    if (existing) {
      setExistingFocus(existing);
      setWeekTopic(existing.weekTopic);
      setSpeakingGoals(existing.speakingGoals.length > 0 ? existing.speakingGoals : [""]);
      setTeacherNotes(existing.teacherNotes || "");
    } else {
      setExistingFocus(null);
      const mod = modules.find(m => m.id === selectedModuleId);
      setWeekTopic(mod?.topic || "");
      setSpeakingGoals([""]);
      setTeacherNotes("");
    }
  }, [selectedModuleId, savedFocuses, modules]);

  const addGoal = () => {
    if (speakingGoals.length < 3) {
      setSpeakingGoals([...speakingGoals, ""]);
    }
  };

  const removeGoal = (index: number) => {
    setSpeakingGoals(speakingGoals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, value: string) => {
    const updated = [...speakingGoals];
    updated[index] = value;
    setSpeakingGoals(updated);
  };

  const handleSave = async () => {
    if (!selectedModuleId || !weekTopic.trim()) {
      toast.error(language === "vi" ? "Vui lòng chọn module và nhập chủ đề" : "Please select a module and enter the topic");
      return;
    }

    const filteredGoals = speakingGoals.filter(g => g.trim());
    
    setSaving(true);
    try {
      const result = await api.createOrUpdateWeeklyFocus(accessToken, {
        moduleId: selectedModuleId,
        teacherId,
        weekTopic: weekTopic.trim(),
        speakingGoals: filteredGoals,
        teacherNotes: teacherNotes.trim() || undefined,
      });

      // Update local saved focuses
      setSavedFocuses(prev => {
        const filtered = prev.filter(f => f.moduleId !== selectedModuleId);
        return [result, ...filtered];
      });
      setExistingFocus(result);

      toast.success(language === "vi" ? "Đã lưu trọng tâm tuần!" : "Weekly focus saved!");
    } catch (error) {
      console.error("Failed to save weekly focus:", error);
      toast.error(language === "vi" ? "Không thể lưu" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          {language === "vi" ? "Trọng tâm tuần (3L)" : "Weekly Focus (3L)"}
        </CardTitle>
        <CardDescription>
          {language === "vi"
            ? "Ghi lại chủ đề và mục tiêu speaking sau buổi học offline. Thông tin này sẽ được chia sẻ cho AI Practice và Mentor."
            : "Record the topic and speaking goals after offline class. This will be shared with AI Practice and Mentors."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Module Selector */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {language === "vi" ? "Chọn Module / Tuần" : "Select Module / Week"}
          </label>
          <Select
            value={selectedModuleId?.toString() || ""}
            onValueChange={(val) => setSelectedModuleId(Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder={language === "vi" ? "Chọn module..." : "Select module..."} />
            </SelectTrigger>
            <SelectContent>
              {modules.map((mod) => (
                <SelectItem key={mod.id} value={mod.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>Module {mod.moduleNumber}: {mod.title}</span>
                    {savedFocuses.some(f => f.moduleId === mod.id) && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModuleId && (
          <>
            {/* Week Topic */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === "vi" ? "Chủ đề tuần" : "Week Topic"}
              </label>
              <Input
                value={weekTopic}
                onChange={(e) => setWeekTopic(e.target.value)}
                placeholder={language === "vi" ? "Ví dụ: Describing your hometown" : "e.g., Describing your hometown"}
              />
            </div>

            {/* Speaking Goals */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === "vi" ? "Mục tiêu Speaking (tối đa 3)" : "Speaking Goals (max 3)"}
              </label>
              <div className="space-y-2">
                {speakingGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={
                        language === "vi"
                          ? `Mục tiêu ${index + 1}, ví dụ: Nói đủ 60 giây mỗi câu trả lời`
                          : `Goal ${index + 1}, e.g., Speak for at least 60 seconds per answer`
                      }
                    />
                    {speakingGoals.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeGoal(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {speakingGoals.length < 3 && (
                  <Button variant="outline" size="sm" onClick={addGoal}>
                    <Plus className="h-3 w-3 mr-1" /> {language === "vi" ? "Thêm mục tiêu" : "Add goal"}
                  </Button>
                )}
              </div>
            </div>

            {/* Teacher Notes */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === "vi" ? "Ghi chú cho Mentor (tùy chọn)" : "Notes for Mentor (optional)"}
              </label>
              <Textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder={
                  language === "vi"
                    ? "Ghi chú ngắn gọn để mentor tham khảo trước buổi video call..."
                    : "Brief notes for the mentor to review before the video call..."
                }
                rows={3}
              />
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {existingFocus
                ? (language === "vi" ? "Cập nhật trọng tâm tuần" : "Update Weekly Focus")
                : (language === "vi" ? "Lưu trọng tâm tuần" : "Save Weekly Focus")}
            </Button>
          </>
        )}

        {/* Previously saved focuses */}
        {savedFocuses.length > 0 && !selectedModuleId && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-muted-foreground font-medium">
              {language === "vi" ? "Đã ghi nhận:" : "Recorded:"}
            </p>
            {savedFocuses.map((focus) => (
              <div
                key={focus.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedModuleId(focus.moduleId)}
              >
                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {focus.module ? `Module ${focus.module.moduleNumber}: ` : ""}{focus.weekTopic}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {focus.speakingGoals.map((g, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
