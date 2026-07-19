import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import BookCard from "../components/BookCard";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AuthContext } from "../context/AuthContext";

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Mystery", "Romance", "Psychology", "Self-Help", "Finance"];

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        if (data.success) {
          setAllBooks(data.books);
        }
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    };
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayedBooks = selectedCategory === "All" 
    ? allBooks.slice(0, 8) 
    : allBooks.filter(b => b.genre.toLowerCase() === selectedCategory.toLowerCase()).slice(0, 8);

  const recommendedBooks = user && user.favoriteGenre
    ? allBooks.filter(b => b.genre.toLowerCase() === user.favoriteGenre.toLowerCase()).slice(0, 4)
    : [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/20 py-16 sm:py-24 border-b border-border/50">
        <div className="container px-4 md:px-8 relative z-10 animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start text-left max-w-2xl">
            <Badge className="mb-6 py-1.5 px-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0">
              <BookOpen className="w-4 h-4 mr-2" /> Welcome to BookStore
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
              Discover Your Next <span className="text-primary bg-clip-text">Great Adventure</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Explore thousands of books across all genres. From bestsellers to hidden gems, 
              find the perfect story waiting just for you.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2 bg-background p-1.5 rounded-full border border-border/80 shadow-md">
              <div className="pl-3 text-muted-foreground">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by Title, Author, or Genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button type="submit" size="sm" className="rounded-full px-5 h-9 font-semibold shrink-0">
                Search
              </Button>
            </form>
          </div>
          
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-[4/3] sm:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-border/60">
              <img 
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800&h=800" 
                alt="Stack of vintage books" 
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Decorative background gradients */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Categories */}
      <section className="py-16 container px-4 md:px-8">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Browse by Category</h2>
          <div className="w-16 h-1 bg-primary rounded-full" />
        </div>
        
        <div className="flex overflow-x-auto pb-3 md:pb-0 gap-3 md:flex-wrap md:justify-center no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORIES.map((cat, idx) => (
            <Button 
              key={idx} 
              variant={selectedCategory === cat ? "default" : "outline"}
              className="rounded-full px-6 transition-all shrink-0"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {user && user.favoriteGenre && recommendedBooks.length > 0 && (
        <section className="py-16 container px-4 md:px-8 border-t border-border/50 animate-fade-in">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Recommended for You</h2>
              <p className="text-muted-foreground flex items-center gap-1.5">
                Based on your preference for <span className="font-semibold text-primary capitalize">{user.favoriteGenre}</span>.
              </p>
            </div>
            <Link to={`/books?genre=${encodeURIComponent(user.favoriteGenre)}`}>
              <Button variant="ghost" className="group text-xs sm:text-sm">
                See More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
            {recommendedBooks.map((book) => (
               <BookCard key={book._id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Books */}
      <section className="py-16 bg-secondary/20 border-t border-border/50">
        <div className="container px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Trending Now</h2>
              <p className="text-muted-foreground">Top picks for you based on current trends.</p>
            </div>
            <Link to="/books">
              <Button variant="ghost" className="hidden sm:flex group">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {displayedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
              {displayedBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground bg-background rounded-xl border border-dashed border-border">
              No books found in this category.
            </div>
          )}
          
          <div className="mt-10 flex justify-center sm:hidden">
            <Link to="/books" className="w-full">
              <Button variant="outline" className="w-full">
                View All Books
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
