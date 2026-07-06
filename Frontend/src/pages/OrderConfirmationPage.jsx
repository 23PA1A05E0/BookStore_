import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch("/api/orders/myorders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const orders = await res.json();
        const found = orders.find((o) => o._id === id);
        if (found) {
          setOrder(found);
        }
      } catch (error) {
        console.error("Failed to fetch order details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground animate-pulse">Loading order details...</div>;
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl py-10 animate-fade-in min-h-[85vh] flex flex-col justify-center">
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Order Confirmed!</h2>
        <p className="text-muted-foreground">Thank you for your purchase. Your order is being processed.</p>
        <p className="text-xs text-muted-foreground bg-secondary/40 px-3 py-1.5 rounded-full inline-block font-mono">
          Order ID: #{id}
        </p>
      </div>

      {order && (
        <Card className="border-border/50 smooth-shadow bg-card mb-8 overflow-hidden">
          <CardHeader className="bg-secondary/25 border-b border-border/50 py-4">
            <CardTitle className="text-lg">Summary of Purchase</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-14 bg-muted rounded overflow-hidden shrink-0">
                      {item.book?.image ? (
                        <img src={item.book.image} alt={item.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{item.book?.title || 'Book'}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} | Format: {item.format || "Paperback"}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm">₹{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-secondary/10 p-5 space-y-3 border-t border-border/50 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground font-medium">Free Shipping</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/40">
                <span className="font-bold text-base text-foreground">Total Paid</span>
                <span className="font-extrabold text-xl text-primary">₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/orders" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full h-11 px-6">
            Track Shipment & Orders
          </Button>
        </Link>
        <Link to="/books" className="w-full sm:w-auto">
          <Button className="w-full h-11 px-6 gap-2">
            Continue Shopping <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
