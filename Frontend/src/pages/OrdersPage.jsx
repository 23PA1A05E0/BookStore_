import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Star, Truck, CheckCircle2, MessageSquare, Award } from "lucide-react";

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  
  // Book Review state
  const [reviewBook, setReviewBook] = useState(null);
  const [bookRating, setBookRating] = useState(5);
  const [bookComment, setBookComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Experience feedback state
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [expRating, setExpRating] = useState(5);
  const [expComment, setExpComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/myorders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleBookReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBook) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/books/${reviewBook._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rating: bookRating, comment: bookComment }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Review submitted successfully!");
        setReviewBook(null);
        setBookComment("");
        setBookRating(5);
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackOrder) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/orders/${feedbackOrder._id}/experience`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rating: expRating, comment: expComment }),
      });
      if (res.ok) {
        toast.success("Experience feedback submitted!");
        setFeedbackOrder(null);
        setExpComment("");
        setExpRating(5);
        fetchOrders();
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (err) {
      toast.error("Error submitting feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in min-h-[80vh]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">My Orders</h2>
        <p className="text-muted-foreground">View and track your past purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
          <p className="text-xl font-medium text-foreground mb-2">No orders found</p>
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const currentStepIdx = STATUS_STEPS.indexOf(order.status);
            return (
              <Card key={order._id} className="overflow-hidden border-border/50 smooth-shadow bg-card">
                <CardHeader className="bg-secondary/30 pb-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1 font-mono">Order ID: #{order._id}</p>
                    <CardTitle className="text-lg">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Amount</p>
                      <p className="font-bold text-lg text-primary">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                    <Badge variant={order.status === "Delivered" ? "default" : "secondary"} className="h-8 px-3 capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Visual Stepper Tracker */}
                  <div className="py-4">
                    <p className="text-sm font-semibold mb-4 flex items-center gap-1.5 text-foreground">
                      <Truck size={16} /> Delivery Tracking
                    </p>
                    <div className="relative flex items-center justify-between">
                      {/* Tracking Line Background */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-secondary rounded-full -z-10" />
                      {/* Active Tracking Line */}
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500" 
                        style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                      
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isActive = idx === currentStepIdx;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 bg-card px-2">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted 
                                  ? "bg-primary border-primary text-primary-foreground" 
                                  : "bg-background border-border text-muted-foreground"
                              } ${isActive ? "ring-4 ring-primary/20 scale-110" : ""}`}
                            >
                              <CheckCircle2 size={16} className={isCompleted ? "opacity-100" : "opacity-0"} />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold ${isCompleted ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-border/50 border-t border-border/40">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0">
                            {item.book?.image ? (
                              <img src={item.book.image} alt={item.book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-secondary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm sm:text-base">{item.book?.title || 'Unknown Book'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>Price: ₹{item.price.toFixed(2)}</span>
                              <span>|</span>
                              <span>Qty: {item.quantity}</span>
                              <span>|</span>
                              <Badge variant="outline" className="text-[10px] font-semibold bg-secondary/50 border-border/80 h-4 px-1">{item.format || "Paperback"}</Badge>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {order.status === "Delivered" && item.book && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs gap-1.5 h-8"
                              onClick={() => setReviewBook(item.book)}
                            >
                              <MessageSquare size={13} /> Write Review
                            </Button>
                          )}
                          <p className="font-bold text-foreground text-right w-20">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Experience Feedback Row */}
                <CardFooter className="bg-secondary/10 border-t border-border/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                  {order.experienceRating ? (
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                      <Award size={15} className="text-primary" />
                      <span>You rated this shopping experience:</span>
                      <div className="flex items-center text-primary">
                        {[...Array(order.experienceRating)].map((_, i) => (
                          <Star key={i} size={13} className="fill-primary text-primary border-0" />
                        ))}
                      </div>
                      {order.experienceComment && <span className="italic font-medium">"{order.experienceComment}"</span>}
                    </div>
                  ) : order.status === "Delivered" ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-muted-foreground text-xs">How was your shipping & ordering experience?</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:bg-primary/10 text-xs font-semibold p-0 h-auto"
                        onClick={() => setFeedbackOrder(order)}
                      >
                        Rate Experience
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Overall feedback can be shared once order is Delivered.</span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Write Book Review Modal */}
      {reviewBook && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Review Book</CardTitle>
              <p className="text-sm text-muted-foreground">Share your thoughts on "{reviewBook.title}"</p>
            </CardHeader>
            <form onSubmit={handleBookReviewSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBookRating(val)}
                        className="text-primary focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={24} 
                          className={val <= bookRating ? "fill-primary text-primary" : "text-muted-foreground/30"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Your Review</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you liked or disliked about this book..."
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={bookComment}
                    onChange={(e) => setBookComment(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setReviewBook(null)}>Cancel</Button>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Rate Experience Modal */}
      {feedbackOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Rate Shopping Experience</CardTitle>
              <p className="text-sm text-muted-foreground">Let us know how we did with order #{feedbackOrder._id.substring(feedbackOrder._id.length - 6)}</p>
            </CardHeader>
            <form onSubmit={handleFeedbackSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Service Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setExpRating(val)}
                        className="text-primary focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={24} 
                          className={val <= expRating ? "fill-primary text-primary" : "text-muted-foreground/30"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Comments (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any feedback on the shipping speeds, packagings or bookstore service..."
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={expComment}
                    onChange={(e) => setExpComment(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFeedbackOrder(null)}>Cancel</Button>
                <Button type="submit" disabled={submittingFeedback}>
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
