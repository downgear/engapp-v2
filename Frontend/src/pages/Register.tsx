import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole, RegisterData } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, GraduationCap, User, Users, BookOpen } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();
  
  const [role, setRole] = useState<UserRole>("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    // Student fields
    grade: "",
    cefrLevel: "A1",
    // Teacher fields
    teacherType: "video_call" as "in_person" | "video_call" | "both",
    bio: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(language === "vi" ? "Mật khẩu xác nhận không khớp" : "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError(language === "vi" ? "Mật khẩu phải có ít nhất 6 ký tự" : "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role,
      };

      if (role === "student") {
        registerData.grade = formData.grade;
        registerData.cefrLevel = formData.cefrLevel;
      } else if (role === "teacher") {
        registerData.teacherType = formData.teacherType;
        registerData.bio = formData.bio;
      }

      await register(registerData);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : language === "vi" ? "Đăng ký thất bại" : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">Lingriser</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{language === "vi" ? "Đăng ký tài khoản" : "Create Account"}</CardTitle>
            <CardDescription>
              {language === "vi" ? "Chọn loại tài khoản và điền thông tin" : "Choose account type and fill in your information"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="student" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === "vi" ? "Học sinh" : "Student"}</span>
                  </TabsTrigger>
                  <TabsTrigger value="parent" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === "vi" ? "Phụ huynh" : "Parent"}</span>
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === "vi" ? "Giáo viên" : "Teacher"}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Common Fields */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{language === "vi" ? "Họ và tên" : "Full Name"} *</Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{language === "vi" ? "Số điện thoại" : "Phone Number"}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{language === "vi" ? "Mật khẩu" : "Password"} *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{language === "vi" ? "Xác nhận" : "Confirm"} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Role-specific Fields */}
              {role === "student" && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="grade">{language === "vi" ? "Lớp" : "Grade"}</Label>
                    <Select value={formData.grade} onValueChange={(v) => handleChange("grade", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "vi" ? "Chọn lớp" : "Select grade"} />
                      </SelectTrigger>
                      <SelectContent>
                        {[6, 7, 8, 9, 10, 11, 12].map(g => (
                          <SelectItem key={g} value={`Lớp ${g}`}>{language === "vi" ? `Lớp ${g}` : `Grade ${g}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cefrLevel">{language === "vi" ? "Trình độ CEFR" : "CEFR Level"}</Label>
                    <Select value={formData.cefrLevel} onValueChange={(v) => handleChange("cefrLevel", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["A1", "A2", "B1", "B1+", "B2", "C1", "C2"].map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {role === "teacher" && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="teacherType">{language === "vi" ? "Loại giáo viên" : "Teacher Type"}</Label>
                    <Select value={formData.teacherType} onValueChange={(v) => handleChange("teacherType", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video_call">{language === "vi" ? "Giáo viên nước ngoài" : "Foreign Teacher"}</SelectItem>
                        <SelectItem value="in_person">{language === "vi" ? "Giáo viên Việt Nam" : "Vietnamese Teacher"}</SelectItem>
                        <SelectItem value="both">{language === "vi" ? "Cả hai" : "Both"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">{language === "vi" ? "Giới thiệu bản thân" : "About You"}</Label>
                    <Textarea
                      id="bio"
                      placeholder={language === "vi" ? "Mô tả kinh nghiệm và chuyên môn của bạn..." : "Describe your experience and expertise..."}
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "vi" ? "Đang đăng ký..." : "Signing up..."}
                  </>
                ) : (
                  language === "vi" ? "Đăng ký" : "Sign Up"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {language === "vi" ? "Đã có tài khoản?" : "Already have an account?"}{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {language === "vi" ? "Đăng nhập" : "Sign In"}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;

