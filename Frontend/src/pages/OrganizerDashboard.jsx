import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Plus, Trash2, Package, Edit, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";

const OrganizerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" or "orders"
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [formData, setFormData] = useState({ title: "", author: "", genre: "", description: "", price: "", stock: "", image: "" });

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books/organizer", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setBooks(data.books);
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/organizer", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBookId ? `/api/books/${editingBookId}` : "/api/books";
      const method = editingBookId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...formData, price: Number(formData.price), stock: Number(formData.stock) })
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ title: "", author: "", genre: "", description: "", price: "", stock: "", image: "" });
        setEditingBookId(null);
        fetchBooks();
        toast.success(editingBookId ? "Book updated successfully!" : "Book listed successfully!");
      } else {
        toast.error("Action failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (book) => {
    setEditingBookId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      price: book.price.toString(),
      stock: book.stock.toString(),
      image: book.image || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ title: "", author: "", genre: "", description: "", price: "", stock: "", image: "" });
    setEditingBookId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Listing deleted successfully");
        fetchBooks();
      } else {
        toast.error("Failed to delete book");
      }
    } catch (error) {
      toast.error("Error deleting book");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success("Order status updated!");
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-3xl font-bold tracking-tight text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in min-h-[80vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Organizer Dashboard</h2>
          <p className="text-muted-foreground">Manage your book inventory, details, and customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "inventory" && (
            <Button onClick={() => (showForm ? handleCancel() : setShowForm(true))} className="gap-2">
              <Plus size={18} /> {showForm ? "Cancel" : "Add New Book"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 mb-8 gap-4">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all ${
            activeTab === "inventory"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Inventory ({books.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all ${
            activeTab === "orders"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Customer Orders ({orders.length})
        </button>
      </div>

      {activeTab === "inventory" && (
        <>
          {showForm && (
            <Card className="mb-8 border-primary/20 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle>{editingBookId ? "Edit Book details" : "Add New Book"}</CardTitle>
                <CardDescription>Fill in the details to list or update a book in the marketplace.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Book Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Author</label>
                    <Input placeholder="Author Name" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Genre</label>
                    <Input placeholder="E.g., Fiction, Sci-Fi" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input placeholder="https://unsplash.com/..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="A brief description of the book..." 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (₹)</label>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock</label>
                    <Input type="number" placeholder="0" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                  </div>
                  <div className="md:col-span-2 mt-4 flex gap-2">
                    <Button type="submit" className="w-full sm:w-auto">
                      {editingBookId ? "Update Details" : "List Book"}
                    </Button>
                    {editingBookId && (
                      <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">Cancel</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50 smooth-shadow bg-card">
            <CardHeader className="bg-secondary/25 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Your Inventory ({books.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {books.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-muted-foreground bg-secondary/10 border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Title & Author</th>
                        <th className="px-6 py-4 font-semibold">Genre</th>
                        <th className="px-6 py-4 font-semibold">Price</th>
                        <th className="px-6 py-4 font-semibold">Stock</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {books.map(book => (
                        <tr key={book._id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {book.image && (
                                <img src={book.image} alt={book.title} className="w-8 h-10 object-cover rounded shrink-0 bg-muted" />
                              )}
                              <div>
                                <p className="font-semibold text-foreground leading-tight">{book.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 capitalize">{book.genre}</td>
                          <td className="px-6 py-4 font-medium">₹{book.price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {book.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(book)} className="text-muted-foreground hover:text-foreground h-8 w-8">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(book._id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="w-12 h-12 text-muted mb-4" />
                  <p className="text-lg font-medium text-foreground">Your inventory is empty</p>
                  <p className="text-muted-foreground text-sm mt-1">Start by adding your first book to the marketplace.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "orders" && (
        <Card className="border-border/50 smooth-shadow bg-card">
          <CardHeader className="bg-secondary/25 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Orders Containing Your Books ({orders.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-muted-foreground bg-secondary/10 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order ID & Date</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Items Ordered</th>
                      <th className="px-6 py-4 font-semibold">Current Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {orders.map((order) => {
                      // Get only items belonging to this organizer
                      const myItems = order.orderItems.filter(
                        (item) => item.book?.organizer === user.id
                      );
                      return (
                        <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-foreground font-mono">#{order._id.substring(order._id.length - 6)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{order.user?.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{order.user?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {myItems.map((item, idx) => (
                                <p key={idx} className="text-xs text-foreground font-medium">
                                  {item.book?.title || "Book"} (x{item.quantity})
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              order.status === "Delivered" 
                                ? "bg-green-100 text-green-800" 
                                : order.status === "Shipped" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="flex h-9 w-32 ml-auto items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="w-12 h-12 text-muted mb-4" />
                <p className="text-lg font-medium text-foreground">No orders found</p>
                <p className="text-muted-foreground text-sm mt-1">Orders containing your books will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizerDashboard;
