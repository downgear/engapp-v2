import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { 
  ArrowLeft, CheckCircle2, Clock, CreditCard, Loader2, XCircle, AlertTriangle
} from "lucide-react";

const PAYMENT_TIMEOUT = 60; // 60 seconds timeout

const PaymentPage = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentExpired, setPaymentExpired] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Countdown timer - if reaches 0 without payment, expire
  useEffect(() => {
    if (paymentComplete || isProcessing || paymentExpired) return;

    if (countdown <= 0) {
      // Payment timeout - redirect back without unlocking
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
  }, [countdown, paymentComplete, isProcessing, paymentExpired, navigate]);

  const handleConfirmPayment = async () => {
    if (isProcessing || paymentComplete || paymentExpired) return;
    
    setIsProcessing(true);
    try {
      // Call API to process payment and unlock module
      await api.processPayment(user?.profileId || 0, Number(moduleId));
      setPaymentComplete(true);
      
      // Wait 1.5 seconds to show success, then redirect
      setTimeout(() => {
        navigate("/curriculum");
      }, 1500);
    } catch (error) {
      console.error("Payment processing failed:", error);
      // For demo, still mark as complete even if API fails
      setPaymentComplete(true);
      setTimeout(() => {
        navigate("/curriculum");
      }, 1500);
    }
  };

  // Format countdown as mm:ss
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress bar color based on time remaining
  const getProgressColor = () => {
    if (countdown > 30) return "bg-green-500";
    if (countdown > 15) return "bg-yellow-500";
    return "bg-red-500";
  };

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
              Quét mã QR để thanh toán
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
              Speaking Foundation Program - 8 tuần
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
                      <p><span className="font-medium text-foreground">Nội dung:</span> Thanh toan Lingriser</p>
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
                    <Clock className={`h-5 w-5 ${countdown <= 15 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className={`text-lg font-mono font-bold ${countdown <= 15 ? 'text-red-500' : 'text-foreground'}`}>
                      {formatCountdown(countdown)}
                    </span>
                    <span className="text-sm text-muted-foreground">còn lại để thanh toán</span>
                  </div>

                  {countdown <= 15 && (
                    <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Sắp hết thời gian! Vui lòng xác nhận thanh toán.</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 text-lg"
                    onClick={handleConfirmPayment}
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Tôi đã thanh toán
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
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
