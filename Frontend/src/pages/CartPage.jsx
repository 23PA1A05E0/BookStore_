import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    try {
      const orderItems = cartItems.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.price || item.book.price,
        format: item.format || "Paperback",
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          orderItems,
          totalPrice: cartTotal,
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/orders/confirmation/${orderData._id}`);
      } else {
        toast.error("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error during checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center animate-fade-in text-center min-h-[70vh]">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't added any books to your cart yet. Let's find your next great read.
        </p>
        <Link to="/books">
          <Button size="lg" className="h-12 px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-4">
          {cartItems.map((item) => (
            <Card key={`${item.book._id}-${item.format}`} className="overflow-hidden border-border/50 smooth-shadow bg-card">
              <CardContent className="p-0 sm:p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-24 aspect-[3/4] bg-muted sm:rounded-md overflow-hidden shrink-0 hidden sm:block">
                  {item.book.image && (
                    <img src={item.book.image} alt={item.book.title} className="w-full h-full object-cover" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row justify-between w-full p-4 sm:p-0 gap-4">
                  <div className="space-y-1 flex-1 flex flex-col justify-center">
                    <Link to={`/books/${item.book._id}`} className="hover:underline">
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.book.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">By {item.book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 bg-secondary/60">
                        {item.format}
                      </Badge>
                    </div>
                    <p className="font-semibold text-primary mt-1">₹{(item.price || item.book.price).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                    <div className="flex items-center gap-2 bg-secondary rounded-md p-1 border border-border">
                      <button 
                        onClick={() => updateQuantity(item.book._id, item.format, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-background rounded disabled:opacity-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.book._id, item.format, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-background rounded transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <p className="font-bold hidden sm:block w-24 text-right">
                      ₹{((item.price || item.book.price) * item.quantity).toFixed(2)}
                    </p>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeFromCart(item.book._id, item.format)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:w-1/3">
          <Card className="sticky top-24 border-border/50 smooth-shadow bg-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border/50">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="text-foreground font-medium">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">Free</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span className="text-foreground font-medium">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-border/50 mb-6">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              <Button onClick={handleCheckout} className="w-full h-12 text-md font-semibold">
                Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
