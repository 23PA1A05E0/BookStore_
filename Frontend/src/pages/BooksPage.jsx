import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import { Button } from "../components/ui/button";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Mystery", "Romance", "Psychology", "Self-Help", "Finance"];

const BooksPage = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("default");

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

  const authors = ["All", ...new Set(allBooks.map((b) => b.author))];

  // Apply filters
  let displayedBooks = [...allBooks];

  if (selectedCategory !== "All") {
    displayedBooks = displayedBooks.filter((b) => b.genre === selectedCategory);
  }

  if (searchKeyword.trim() !== "") {
    const kw = searchKeyword.toLowerCase();
    displayedBooks = displayedBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(kw) ||
        b.author.toLowerCase().includes(kw) ||
        b.genre.toLowerCase().includes(kw)
    );
  }

  if (selectedAuthor !== "All") {
    displayedBooks = displayedBooks.filter((b) => b.author === selectedAuthor);
  }

  if (minRating > 0) {
    displayedBooks = displayedBooks.filter((b) => (b.rating || 0) >= minRating);
  }

  // Sorting
  if (sortBy === "title-asc") {
    displayedBooks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "title-desc") {
    displayedBooks.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortBy === "price-asc") {
    displayedBooks.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    displayedBooks.sort((a, b) => b.price - a.price);
  } else if (sortBy === "popularity") {
    displayedBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in min-h-[80vh]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">All Books</h2>
        <p className="text-muted-foreground">Browse our entire collection and filter by your favorite genres.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-secondary/20 border border-border/50 rounded-2xl p-5 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author..."
              className="pl-10 h-11 bg-background border-border/60"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Author Selection */}
          <div>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="flex h-11 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Authors</option>
              {authors.filter(a => a !== "All").map((author, idx) => (
                <option key={idx} value={author}>{author}</option>
              ))}
            </select>
          </div>

          {/* Rating Selection */}
          <div>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="flex h-11 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={2}>2+ Stars</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex h-11 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="default">Sort By: Featured</option>
              <option value="popularity">Popularity (Rating)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="title-desc">Title: Z-A</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Category badges */}
      <div className="flex overflow-x-auto pb-3 md:pb-0 gap-2 mb-10 border-b border-border/50 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-start">
        {CATEGORIES.map((cat, idx) => (
          <Button 
            key={idx} 
            variant={selectedCategory === cat ? "default" : "outline"}
            className="rounded-full px-5 transition-all shrink-0"
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {displayedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {displayedBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
          <p className="text-xl font-medium text-foreground mb-2">No books found</p>
          <p className="text-muted-foreground">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </div>
  );
};
export default BooksPage;
