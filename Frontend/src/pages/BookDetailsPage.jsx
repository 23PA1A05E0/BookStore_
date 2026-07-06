import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Star, Package, Trash2 } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [selectedFormat, setSelectedFormat] = useState("Paperback");

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this rating/review?")) return;
    try {
      const res = await fetch(`/api/books/${book._id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Review deleted successfully");
        setBook({
          ...book,
          reviews: data.reviews,
          rating: data.rating,
          numReviews: data.numReviews,
        });
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (err) {
      toast.error("Error deleting review");
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
                const res = await fetch(`/api/books/${id}`);
        const data = await res.json();
        if (data.success) {
          setBook(data.book);
        }
      } catch (error) {
        console.error("Failed to fetch book", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground animate-pulse">Loading book details...</div>;
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 w-4 h-4" /> Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 w-4 h-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden smooth-shadow bg-muted border border-border/50">
            {book.image ? (
              <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/30">
                No Image Available
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col">
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="px-3 py-1 font-medium bg-secondary/50">{book.genre}</Badge>
              <div className="flex items-center gap-1 text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">
                <Star size={14} className="fill-primary" /> {book.rating || "New"}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">{book.title}</h1>
            <p className="text-xl text-muted-foreground font-medium">By {book.author}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-2">Synopsis</h3>
            <p className="text-muted-foreground leading-relaxed">
              {book.description || "No description available for this book."}
            </p>
          </div>

          {/* Format Selection */}
          <div className="mb-8 space-y-3">
            <h3 className="text-md font-bold text-foreground">Select Book Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "Paperback", label: "Paperback", desc: "Physical copy", adjust: "Standard" },
                { id: "E-book", label: "E-book", desc: "Digital PDF/EPUB", adjust: "30% Off" },
                { id: "Special Edition", label: "Special Edition", desc: "Hardcover + extras", adjust: "+₹250" }
              ].map((f) => {
                const isActive = selectedFormat === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFormat(f.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                      isActive
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border/60 hover:border-border hover:bg-secondary/10 text-muted-foreground"
                    }`}
                  >
                    <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>{f.label}</span>
                    <span className="text-[10px] mt-0.5 opacity-80 leading-normal">{f.desc}</span>
                    <span className={`text-[10px] mt-1.5 font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>{f.adjust}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto bg-secondary/20 p-6 rounded-xl border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Price</p>
              <div className="text-4xl font-extrabold text-foreground tracking-tight">
                ₹{(selectedFormat === "Paperback" ? book.price : selectedFormat === "E-book" ? Math.max(99, Math.round(book.price * 0.7)) : book.price + 250).toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                {selectedFormat === "E-book" ? (
                  <span className="text-green-600 font-medium">Instant Digital Delivery</span>
                ) : book.stock > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({book.stock} available)</span>
                ) : (
                  <span className="text-destructive font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-8 text-md font-semibold rounded-xl shadow-md"
              disabled={selectedFormat !== "E-book" && book.stock <= 0}
              onClick={() => {
                const finalPrice = selectedFormat === "Paperback"
                  ? book.price
                  : selectedFormat === "E-book"
                  ? Math.max(99, Math.round(book.price * 0.7))
                  : book.price + 250;
                addToCart(book, selectedFormat, finalPrice);
                toast.success(`${book.title} (${selectedFormat}) added to cart!`);
              }}
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              {selectedFormat === "E-book" || book.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 pt-10 border-t border-border/50">
        <h3 className="text-2xl font-bold mb-6">Customer Reviews ({book.reviews ? book.reviews.length : 0})</h3>
        
        {book.reviews && book.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {book.reviews.map((rev) => (
              <div key={rev._id} className="p-5 rounded-xl border border-border/50 bg-secondary/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{rev.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                    {user && user.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteReview(rev._id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < rev.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border/60">
            No reviews yet for this book.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailsPage;
