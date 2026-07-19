import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { User, Mail, Lock, ShieldCheck, Heart } from "lucide-react";

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [favoriteGenre, setFavoriteGenre] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setFavoriteGenre(user.favoriteGenre || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name, email, favoriteGenre };
      if (password) {
        payload.password = password;
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        login(data, localStorage.getItem("token"));
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground animate-pulse">
        Please sign in to view your profile.
      </div>
    );
  }

  const isSeller = user.role === "organizer";

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[85vh] animate-fade-in">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1.5 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Profile Settings</CardTitle>
          <CardDescription>Update your personal and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <User size={15} className="text-muted-foreground" />
                {isSeller ? "Business Name" : "Full Name"}
              </label>
              <Input
                type="text"
                placeholder={isSeller ? "Business Name" : "Full Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-secondary/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Mail size={15} className="text-muted-foreground" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-secondary/50"
              />
            </div>

            {/* Favorite Genre Dropdown Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Heart size={15} className="text-muted-foreground" />
                Favorite Genre Preference
              </label>
              <select
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1"
              >
                <option value="">Select a Genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Sci-Fi">Sci-Fi (Science Fiction)</option>
                <option value="Finance">Finance</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery & Thriller</option>
                <option value="Romance">Romance</option>
                <option value="Psychology">Psychology</option>
              </select>
            </div>

            <div className="pt-2 border-t border-border/40 my-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Change Password (Optional)</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Lock size={15} className="text-muted-foreground" />
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/50"
                    minLength="6"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Lock size={15} className="text-muted-foreground" />
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-secondary/50"
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-secondary/15 rounded-xl border text-xs text-muted-foreground">
              <ShieldCheck size={16} className="text-primary shrink-0" />
              <span>Role: <strong className="capitalize text-foreground">{user.role === "organizer" ? "Seller" : user.role}</strong> account.</span>
            </div>

            <Button type="submit" className="w-full mt-4 h-11 text-md font-semibold" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
