import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, User as UserIcon, BookOpen, Menu, X, Sun, Moon } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
      <nav className={`mx-auto max-w-4xl border border-border/80 bg-background/70 backdrop-blur-lg px-6 py-2.5 shadow-md transition-all duration-300 ${isMenuOpen ? 'rounded-2xl' : 'rounded-full'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <BookOpen className="text-primary h-5 w-5" /> <span>BookStore</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 font-medium text-muted-foreground text-sm">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/books" className="hover:text-primary transition-colors">Books</Link>
            {user && <Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link>}
            {user && <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>}
            {user && user.role === 'admin' && <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>}
            {user && (user.role === 'admin' || user.role === 'organizer') && <Link to="/organizer" className="hover:text-primary transition-colors">Dashboard</Link>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary transition-colors"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Link to="/cart" className="relative text-muted-foreground hover:text-primary transition-colors p-2" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute top-1 right-1 h-4 min-w-4 flex items-center justify-center rounded-full px-1 text-[10px] font-bold translate-x-1/4 -translate-y-1/4">
                  {cartItemCount}
                </Badge>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-xs font-medium items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
                  <UserIcon className="h-3.5 w-3.5" /> {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="h-8 gap-2 border-border text-muted-foreground hover:text-foreground rounded-full text-xs">
                  <LogOut className="h-3.5 w-3.5" /> <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-1">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="h-8 rounded-full text-xs font-medium">Register</Button>
                </Link>
              </div>
            )}

            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col gap-3 mt-4 pt-4 border-t border-border/80 animate-fade-in text-sm font-medium text-muted-foreground">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-1">Home</Link>
            <Link to="/books" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-1">Books</Link>
            {user && <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-1">My Orders</Link>}
            {user && <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-1">Profile</Link>}
            {user && user.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-1">Admin</Link>}
            {user && (user.role === 'admin' || user.role === 'organizer') && <Link to="/organizer" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-1">Dashboard</Link>}
            
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 hover:text-primary transition-colors py-1 text-left"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-4 w-4" /> <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" /> <span>Light Mode</span>
                </>
              )}
            </button>
            
            <div className="border-t border-border/60 pt-3 mt-2 flex flex-col gap-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-secondary rounded-full text-secondary-foreground w-fit">
                    <UserIcon className="h-3 w-3" /> {user.name}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 justify-start gap-2 border-border text-muted-foreground rounded-xl w-full text-xs">
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-1/2">
                    <Button variant="outline" size="sm" className="h-9 rounded-xl w-full text-xs">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-1/2">
                    <Button size="sm" className="h-9 rounded-xl w-full text-xs">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
