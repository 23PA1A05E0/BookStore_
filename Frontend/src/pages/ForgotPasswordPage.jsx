import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter New Password
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Email found! Please enter a new password.");
        setStep(2);
      } else {
        toast.error("Email not found. Redirecting to registration...");
        setTimeout(() => {
          navigate("/register");
        }, 2000);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[80vh] animate-fade-in">
      <Card className="w-full max-w-md shadow-lg border-border/50 bg-card">
        {step === 1 ? (
          <form onSubmit={handleVerifyEmail}>
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
              <CardDescription>Enter your email to verify your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-secondary/50"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full h-11 text-md font-semibold" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border/50 pt-4 bg-secondary/10">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
              <CardDescription>Enter a strong new password for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  className="w-full bg-secondary/50"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  className="w-full bg-secondary/50"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full h-11 text-md font-semibold" disabled={loading}>
                {loading ? "Saving..." : "Save Password"}
              </Button>
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
