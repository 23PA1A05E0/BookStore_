import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

const BookCard = ({ book }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden smooth-shadow hover:-translate-y-1 transition-all duration-300 border-border group bg-card">
      <Link to={`/books/${book._id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-muted block">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={14} className="fill-primary text-primary" />
          {book.rating || "New"}
        </div>
      </Link>
      
      <CardHeader className="p-3 sm:p-4 pb-1 space-y-1">
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          {book.genre}
        </div>
        <Link to={`/books/${book._id}`}>
          <CardTitle className="text-sm sm:text-lg font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </CardTitle>
        </Link>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">By {book.author}</p>
      </CardHeader>

      <CardFooter className="p-3 sm:p-4 pt-2 mt-auto flex items-center justify-between border-t border-border/50 bg-secondary/20 gap-2">
        <div className="text-sm sm:text-lg font-bold text-foreground shrink-0">
          ₹{book.price.toFixed(2)}
        </div>
        <Link to={`/books/${book._id}`} className="shrink-0">
          <Button size="sm" variant="default" className="h-8 text-xs px-2.5 sm:h-9 sm:text-sm sm:px-4 font-semibold shadow-sm rounded-full">
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BookCard;
