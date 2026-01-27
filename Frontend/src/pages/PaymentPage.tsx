import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { 
  ArrowLeft, CheckCircle2, Clock, CreditCard, QrCode, Loader2
} from "lucide-react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [countdown, setCountdown] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Countdown timer - after 7 seconds, process payment
  useEffect(() => {
    if (countdown <= 0) {
      processPayment();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const processPayment = async () => {
    if (isProcessing || paymentComplete) return;
    
    setIsProcessing(true);
    try {
      // Call API to process payment and unlock module
      await api.processPayment(user?.profileId || 0, Number(moduleId));
      setPaymentComplete(true);
      
      // Wait 1 second to show success, then redirect
      setTimeout(() => {
        navigate("/curriculum");
      }, 1500);
    } catch (error) {
      console.error("Payment processing failed:", error);
      // For demo, still redirect even if API fails
      setTimeout(() => {
        navigate("/curriculum");
      }, 1500);
    }
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

            {/* QR Code Section */}
            <div className="text-center">
              <p className="text-sm font-medium mb-4">Quét mã QR để chuyển khoản</p>
              
              {/* QR Code Placeholder - Replace with actual QR image later */}
              <div className="mx-auto w-64 h-64 bg-white rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-32 w-32 mx-auto text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground mt-2">
                    QR Code thanh toán
                  </p>
                </div>
              </div>

              {/* Bank Info */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm font-medium mb-2">Thông tin chuyển khoản:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Ngân hàng:</span> Vietcombank</p>
                  <p><span className="font-medium text-foreground">Số TK:</span> 1234567890</p>
                  <p><span className="font-medium text-foreground">Chủ TK:</span> LINGRISER EDUCATION</p>
                  <p><span className="font-medium text-foreground">Nội dung:</span> LINGRISER {user?.profileId || "USER"}</p>
                </div>
              </div>
            </div>

            {/* Countdown / Status */}
            <div className="text-center py-4">
              {paymentComplete ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="font-medium">Thanh toán thành công! Đang chuyển hướng...</span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="font-medium">Đang xử lý thanh toán...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>Đang chờ xác nhận thanh toán...</span>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {countdown}s
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hệ thống sẽ tự động xác nhận sau khi nhận được thanh toán
                  </p>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            {!paymentComplete && !isProcessing && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/curriculum")}
              >
                Hủy thanh toán
              </Button>
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
