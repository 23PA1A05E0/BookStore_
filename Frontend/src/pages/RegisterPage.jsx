import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { toast } from "sonner";

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "bg-muted", suggestions: [] };

  const suggestions = [];
  let score = 0;

  if (pwd.length >= 8) {
    score += 1;
  } else {
    suggestions.push("Make it at least 8 characters");
  }

  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
    score += 1;
  } else {
    suggestions.push("Mix uppercase and lowercase letters");
  }

  if (/\d/.test(pwd)) {
    score += 1;
  } else {
    suggestions.push("Include at least one number");
  }

  if (/[^A-Za-z0-9]/.test(pwd)) {
    score += 1;
  } else {
    suggestions.push("Include a special character (e.g., @, #, $, !)");
  }

  let label = "Very Weak";
  let color = "bg-destructive";

  if (pwd.length < 6) {
    return {
      score: 1,
      label: "Too Short",
      color: "bg-destructive",
      suggestions: ["Minimum length is 6 characters", ...suggestions.filter(s => !s.includes("characters"))]
    };
  }

  switch (score) {
    case 1:
      label = "Weak";
      color = "bg-destructive";
      break;
    case 2:
      label = "Fair";
      color = "bg-orange-500";
      break;
    case 3:
      label = "Good";
      color = "bg-sky-500";
      break;
    case 4:
      label = "Strong";
      color = "bg-emerald-500";
      break;
    default:
      label = "Very Weak";
      color = "bg-destructive";
  }

  return { score, label, color, suggestions };
};

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User Registered Successfully!");
        login(data.user, data.token);
        navigate("/");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[80vh] animate-fade-in">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription>Join us to start buying your favorite books</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {role === "organizer" ? "Business Name" : "Full Name"}
              </label>
              <Input
                type="text"
                placeholder={role === "organizer" ? "E.g., Penguin Classics" : "John Doe"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-secondary/50"
                minLength="6"
              />
              
              {/* Premium Password Strength Indicator */}
              {password && (
                <div className="space-y-2.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className={`font-bold transition-colors duration-300 ${
                      getPasswordStrength(password).score <= 1
                        ? "text-destructive"
                        : getPasswordStrength(password).score === 2
                        ? "text-orange-500"
                        : getPasswordStrength(password).score === 3
                        ? "text-sky-500"
                        : "text-emerald-500"
                    }`}>
                      {getPasswordStrength(password).label}
                    </span>
                  </div>
                  
                  {/* Progress Indicator Pills */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((index) => {
                      const strength = getPasswordStrength(password);
                      const isActive = index <= strength.score;
                      return (
                        <div
                          key={index}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isActive
                              ? strength.color
                              : "bg-secondary"
                          }`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Contextual Suggestion Alerts */}
                  {getPasswordStrength(password).suggestions.length > 0 && (
                    <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                      {getPasswordStrength(password).suggestions.map((suggestion, idx) => (
                        <li key={idx} className="transition-all duration-300">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">I want to register as a</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="user">Customer</option>
                <option value="organizer">Organizer (Seller)</option>
              </select>
            </div>
            <Button type="submit" className="w-full mt-6 h-11 text-md font-semibold">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6 bg-secondary/10">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
