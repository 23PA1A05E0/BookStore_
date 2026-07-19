import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Users, ShoppingBag, BookOpen, Plus, Trash2, Edit, Save, X, Check, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // "users", "books", "orders"

  // User creation states
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "", role: "user" });

  // User edit states
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({ name: "", email: "", password: "", role: "user", isApproved: true });

  // Book edit states
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookFormData, setBookFormData] = useState({ title: "", author: "", genre: "", description: "", price: "", stock: "", image: "" });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders");
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error("Failed to fetch books");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    fetchBooks();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(userFormData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User created successfully!");
        setShowUserForm(false);
        setUserFormData({ name: "", email: "", password: "", role: "user" });
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("Error creating user");
    }
  };

  const handleEditUser = (u) => {
    setEditingUserId(u._id);
    setEditingUserData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      isApproved: u.isApproved !== undefined ? u.isApproved : true
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingUserData.name,
        email: editingUserData.email,
        role: editingUserData.role,
        isApproved: editingUserData.isApproved
      };
      if (editingUserData.password) {
        payload.password = editingUserData.password;
      }

      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("User details updated successfully!");
        setEditingUserId(null);
        fetchUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    }
  };

  const handleToggleApproval = async (u) => {
    try {
      const res = await fetch(`/api/users/${u._id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ isApproved: !u.isApproved })
      });
      if (res.ok) {
        toast.success(u.isApproved ? "Seller account suspended!" : "Seller account approved!");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Error updating approval status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Book management
  const handleEditBook = (book) => {
    setEditingBookId(book._id);
    setBookFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description || "",
      price: book.price.toString(),
      stock: book.stock.toString(),
      image: book.image || ""
    });
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/books/${editingBookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...bookFormData,
          price: Number(bookFormData.price),
          stock: Number(bookFormData.stock)
        })
      });
      if (res.ok) {
        toast.success("Book details updated!");
        setEditingBookId(null);
        fetchBooks();
      } else {
        toast.error("Failed to save book");
      }
    } catch (error) {
      toast.error("Error saving book");
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Book deleted successfully");
        fetchBooks();
      }
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

  // Order management
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
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
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Order deleted successfully!");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-3xl font-bold tracking-tight text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in min-h-[85vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Admin Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive overview and administration dashboard.</p>
        </div>
        <div>
          {activeTab === "users" && (
            <Button onClick={() => setShowUserForm(!showUserForm)} className="gap-2">
              <Plus size={18} /> {showUserForm ? "Cancel" : "Create User"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 mb-8 gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Users & Sellers ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all whitespace-nowrap ${
            activeTab === "books"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Book Listings ({books.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all whitespace-nowrap ${
            activeTab === "orders"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Recent Orders ({orders.length})
        </button>
      </div>

      {/* User Create Form */}
      {activeTab === "users" && showUserForm && (
        <Card className="mb-8 border-primary/20 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Create New User Account</CardTitle>
            <CardDescription>Register a customer, seller, or admin user directly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name / Business Name</label>
                <Input placeholder="John Doe or Penguin Classics" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="john@example.com" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Password</label>
                <Input type="password" placeholder="••••••••" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} required minLength="6" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">User Role</label>
                <select
                  value={userFormData.role}
                  onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1"
                >
                  <option value="user">User (Customer)</option>
                  <option value="organizer">Seller (Organizer)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-4">
                <Button type="submit">Create Account</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User Edit Dialog Form */}
      {activeTab === "users" && editingUserId && (
        <Card className="mb-8 border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Edit Account Information</CardTitle>
              <CardDescription>Modify details for {editingUserData.name}'s account.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditingUserId(null)} className="rounded-full h-8 w-8">
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full / Business Name</label>
                <Input value={editingUserData.name} onChange={e => setEditingUserData({...editingUserData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" value={editingUserData.email} onChange={e => setEditingUserData({...editingUserData, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password (leave empty to keep current)</label>
                <Input type="password" placeholder="••••••••" value={editingUserData.password} onChange={e => setEditingUserData({...editingUserData, password: e.target.value})} minLength="6" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Role</label>
                <select
                  value={editingUserData.role}
                  onChange={e => setEditingUserData({...editingUserData, role: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1"
                >
                  <option value="user">User (Customer)</option>
                  <option value="organizer">Seller (Organizer)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {editingUserData.role === 'organizer' && (
                <div className="flex items-center gap-2 md:col-span-2 py-2">
                  <input
                    type="checkbox"
                    id="editIsApproved"
                    checked={editingUserData.isApproved}
                    onChange={e => setEditingUserData({...editingUserData, isApproved: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="editIsApproved" className="text-sm font-medium text-foreground">
                    Seller Account Approved by Administrator
                  </label>
                </div>
              )}
              <div className="md:col-span-2 mt-4 flex gap-2">
                <Button type="submit" className="gap-1.5"><Save size={16} /> Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingUserId(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Book Edit Dialog Form */}
      {activeTab === "books" && editingBookId && (
        <Card className="mb-8 border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Edit Book Details</CardTitle>
              <CardDescription>Adjust listing details and inventory levels for the bookstore catalog.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditingBookId(null)} className="rounded-full h-8 w-8">
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Book Title" value={bookFormData.title} onChange={e => setBookFormData({...bookFormData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Input placeholder="Author Name" value={bookFormData.author} onChange={e => setBookFormData({...bookFormData, author: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Input placeholder="Fiction, Sci-Fi..." value={bookFormData.genre} onChange={e => setBookFormData({...bookFormData, genre: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input placeholder="https://..." value={bookFormData.image} onChange={e => setBookFormData({...bookFormData, image: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                  placeholder="Synopsis of book"
                  value={bookFormData.description}
                  onChange={e => setBookFormData({...bookFormData, description: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input type="number" min="0" step="0.01" value={bookFormData.price} onChange={e => setBookFormData({...bookFormData, price: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Inventory Stock</label>
                <Input type="number" min="0" value={bookFormData.stock} onChange={e => setBookFormData({...bookFormData, stock: e.target.value})} required />
              </div>
              <div className="md:col-span-2 mt-4 flex gap-2">
                <Button type="submit" className="gap-1.5"><Save size={16} /> Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingBookId(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users Panel */}
      {activeTab === "users" && (
        <Card className="border-border/50 smooth-shadow bg-card flex flex-col">
          <CardHeader className="bg-secondary/25 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Manage Users & Sellers ({users.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-secondary/10 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User Details</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Seller Approval</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground leading-tight">{u.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'organizer' ? 'default' : 'secondary'} className="capitalize">
                          {u.role === 'organizer' ? 'Seller' : u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'organizer' ? (
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={u.isApproved ? "default" : "outline"} 
                              className={`border-0 ${u.isApproved ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}`}
                            >
                              {u.isApproved ? "Approved" : "Pending"}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleApproval(u)}
                              className="text-xs font-semibold h-7 text-primary hover:bg-primary/10 px-2 py-0"
                            >
                              {u.isApproved ? "Suspend" : "Approve"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Auto-Approved</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(u)} className="text-muted-foreground hover:text-foreground h-8 w-8">
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            disabled={u._id === user.id}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Books Panel */}
      {activeTab === "books" && (
        <Card className="border-border/50 smooth-shadow bg-card flex flex-col">
          <CardHeader className="bg-secondary/25 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Store Book Listings ({books.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
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
                            <img src={book.image} alt={book.title} className="w-8 h-10 object-cover rounded shrink-0 bg-muted border" />
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${book.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {book.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditBook(book)} className="text-muted-foreground hover:text-foreground h-8 w-8">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book._id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Panel */}
      {activeTab === "orders" && (
        <Card className="border-border/50 smooth-shadow bg-card flex flex-col">
          <CardHeader className="bg-secondary/25 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Platform Order History ({orders.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-secondary/10 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order Details</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Total Paid</th>
                    <th className="px-6 py-4 font-semibold">Shipment Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground font-mono">#{order._id.substring(order._id.length - 6)}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{order.user?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{order.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        ₹{order.totalPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          className="flex h-9 w-32 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
