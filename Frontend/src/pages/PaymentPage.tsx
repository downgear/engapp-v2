import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { 
  ArrowLeft, CheckCircle2, Clock, CreditCard, Loader2, XCircle, AlertTriangle, Copy, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_TIMEOUT = 300; // 5 minutes (300 seconds)
const POLL_INTERVAL = 3000; // Poll every 3 seconds

interface LocationState {
  cohortCourseId?: number;
  courseName?: string;
  moduleId?: number;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Get course info from location state
  const locationState = location.state as LocationState | null;
  const courseName = locationState?.courseName || "Khóa học tiếng Anh";
  
  const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentExpired, setPaymentExpired] = useState(false);
  const [transactionCode, setTransactionCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize pending payment
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.profileId) {
      initializePendingPayment();
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const initializePendingPayment = async () => {
    try {
      const result = await api.createPendingPayment(user?.profileId || 0);
      setTransactionCode(result.transactionCode);
      setCountdown(result.expiresIn);
      setIsInitializing(false);
    } catch (error) {
      console.error("Failed to create pending payment:", error);
      setIsInitializing(false);
      // Use a fallback transaction code
      setTransactionCode(`LR${user?.profileId || 0}${Date.now().toString(36).toUpperCase()}`);
    }
  };

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (paymentComplete || paymentExpired || !user?.profileId || !accessToken) return;

    try {
      const status = await api.checkPaymentStatus(user.profileId);
      
      if (status.paid) {
        // Mark cohort enrollment as paid if we have cohortCourseId
        if (locationState?.cohortCourseId) {
          try {
            await api.markCohortEnrollmentPaid(accessToken, user.profileId, locationState.cohortCourseId);
          } catch (e) {
            console.error("Failed to mark cohort enrollment as paid:", e);
          }
        }
        
        setPaymentComplete(true);
        toast({
          title: "Thanh toán thành công! 🎉",
          description: "Khóa học đã được mở khóa. Đang chuyển hướng...",
        });
        setTimeout(() => {
          // Navigate to curriculum with enrolled status
          navigate("/curriculum", { 
            state: { enrolled: true },
            replace: true 
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
    }
  }, [user, accessToken, paymentComplete, paymentExpired, navigate, toast, locationState]);

  // Start polling
  useEffect(() => {
    if (isInitializing || paymentComplete || paymentExpired) return;

    const pollInterval = setInterval(checkPaymentStatus, POLL_INTERVAL);
    
    // Initial check
    checkPaymentStatus();

    return () => clearInterval(pollInterval);
  }, [isInitializing, checkPaymentStatus, paymentComplete, paymentExpired]);

  // Countdown timer
  useEffect(() => {
    if (paymentComplete || isProcessing || paymentExpired || isInitializing) return;

    if (countdown <= 0) {
      setPaymentExpired(true);
      setTimeout(() => {
        navigate("/curriculum");
      }, 2000);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, paymentComplete, isProcessing, paymentExpired, isInitializing, navigate]);

  // Manual confirmation (demo/backup)
  const handleManualConfirm = async () => {
    if (isProcessing || paymentComplete || paymentExpired) return;
    
    setIsProcessing(true);
    try {
      await api.processPayment(user?.profileId || 0, Number(moduleId));
      setPaymentComplete(true);
      toast({
        title: "Thanh toán thành công! 🎉",
        description: "Khóa học đã được mở khóa.",
      });
      setTimeout(() => {
        navigate("/curriculum");
      }, 1500);
    } catch (error) {
      console.error("Payment processing failed:", error);
      setPaymentComplete(true);
      setTimeout(() => {
        navigate("/curriculum");
      }, 1500);
    }
  };

  // Copy transaction code
  const copyTransactionCode = () => {
    const transferContent = `Thanh toan Lingriser ${transactionCode}`;
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    toast({
      title: "Đã sao chép!",
      description: "Nội dung chuyển khoản đã được sao chép.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Format countdown as mm:ss
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress bar color
  const getProgressColor = () => {
    const percentage = countdown / PAYMENT_TIMEOUT;
    if (percentage > 0.5) return "bg-green-500";
    if (percentage > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-8 max-w-2xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Đang khởi tạo thanh toán...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/curriculum")}
            disabled={isProcessing}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thanh Toán Khóa Học</h1>
            <p className="text-muted-foreground">
              Quét mã QR để thanh toán - Tự động xác nhận
            </p>
          </div>
        </div>

        {/* Payment Card */}
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Mở khóa toàn bộ khóa học</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {courseName} - 8 tuần
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Price Info */}
            <div className="text-center py-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Học phí</p>
              <p className="text-3xl font-bold text-primary">2,990,000 VNĐ</p>
              <p className="text-xs text-muted-foreground mt-1">
                (Khuyến mãi khai trương - Giá gốc: 3,990,000 VNĐ)
              </p>
            </div>

            {/* Status Messages */}
            {paymentComplete ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">Thanh toán thành công!</h3>
                <p className="text-muted-foreground">Đang mở khóa khóa học...</p>
              </div>
            ) : paymentExpired ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Hết thời gian thanh toán</h3>
                <p className="text-muted-foreground">Đang chuyển hướng về trang khóa học...</p>
              </div>
            ) : isProcessing ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Đang xử lý thanh toán...</h3>
                <p className="text-muted-foreground text-sm">Vui lòng chờ trong giây lát</p>
              </div>
            ) : (
              <>
                {/* Auto-detect notice */}
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-400">Tự động xác nhận thanh toán</p>
                      <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                        Hệ thống sẽ tự động phát hiện khi bạn chuyển khoản thành công. 
                        Không cần bấm xác nhận thủ công!
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="text-center">
                  <p className="text-sm font-medium mb-4">Quét mã QR để chuyển khoản</p>
                  
                  {/* Actual QR Code Image */}
                  <div className="mx-auto w-72 bg-white rounded-xl overflow-hidden shadow-md">
                    <img 
                      src="/qr-payment.jpeg" 
                      alt="QR Code thanh toán" 
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Bank Info */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left">
                    <p className="text-sm font-medium mb-2">Thông tin chuyển khoản:</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Ngân hàng:</span> BIDV - CN Quảng Nam</p>
                      <p><span className="font-medium text-foreground">Số TK:</span> 5622486301</p>
                      <p><span className="font-medium text-foreground">Chủ TK:</span> LUU CHI LAP</p>
                    </div>
                    
                    {/* Transaction Code - Important! */}
                    <div className="mt-3 p-3 bg-primary/10 rounded-lg border-2 border-primary/30">
                      <p className="text-xs text-muted-foreground mb-1">Nội dung chuyển khoản (BẮT BUỘC):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono font-bold text-primary text-sm">
                          Thanh toan Lingriser {transactionCode}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={copyTransactionCode}
                          className="shrink-0"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-red-500 mt-2">
                        ⚠️ Vui lòng ghi đúng nội dung để hệ thống tự động xác nhận!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${getProgressColor()}`}
                      style={{ width: `${(countdown / PAYMENT_TIMEOUT) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Clock className={`h-5 w-5 ${countdown <= 60 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className={`text-lg font-mono font-bold ${countdown <= 60 ? 'text-red-500' : 'text-foreground'}`}>
                      {formatCountdown(countdown)}
                    </span>
                    <span className="text-sm text-muted-foreground">còn lại</span>
                  </div>

                  {countdown <= 60 && (
                    <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Sắp hết thời gian! Vui lòng hoàn tất thanh toán.</span>
                    </div>
                  )}

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Đang chờ xác nhận từ ngân hàng...</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Manual confirm button (backup) */}
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleManualConfirm}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Tôi đã chuyển khoản (xác nhận thủ công)
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={() => navigate("/curriculum")}
                  >
                    Hủy thanh toán
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ hotline: 0123-456-789
        </p>
      </main>
    </div>
  );
};

export default PaymentPage;
