const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Book = require("./models/Book");

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing books...");
    await Book.deleteMany({});

    // Create an Admin User
    const adminPassword = await bcrypt.hash("password123", 10);
    let admin = await User.findOne({ email: "admin@bookstore.com" });
    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: "admin@bookstore.com",
        password: adminPassword,
        role: "admin",
      });
      console.log("Created Admin User");
    }

    // Create Organizer Users
    const organizerPassword = await bcrypt.hash("password123", 10);
    let org1 = await User.findOne({ email: "org1@bookstore.com" });
    if (!org1) {
      org1 = await User.create({
        name: "Penguin Classics",
        email: "org1@bookstore.com",
        password: organizerPassword,
        role: "organizer",
      });
      console.log("Created Organizer 1");
    }

    let org2 = await User.findOne({ email: "org2@bookstore.com" });
    if (!org2) {
      org2 = await User.create({
        name: "SciFi Press",
        email: "org2@bookstore.com",
        password: organizerPassword,
        role: "organizer",
      });
      console.log("Created Organizer 2");
    }

    // Expanded Sample Books (20 Books)
    const books = [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        genre: "Fiction",
        description: "Between life and death there is a library, and within that library, the shelves go on forever.",
        price: 499,
        stock: 50,
        rating: 4.8,
        image: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        genre: "Self-Help",
        description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
        price: 399,
        stock: 120,
        rating: 4.9,
        image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        description: "A stunning blend of adventure and mysticism, environmentalism and politics.",
        price: 550,
        stock: 45,
        rating: 4.8,
        image: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
        organizer: org2._id,
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        genre: "Sci-Fi",
        description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller.",
        price: 600,
        stock: 30,
        rating: 4.7,
        image: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
        organizer: org2._id,
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "Fiction",
        description: "A story of a young shepherd's journey to the pyramids of Egypt.",
        price: 350,
        stock: 200,
        rating: 4.6,
        image: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
        organizer: org1._id,
      },
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        genre: "Finance",
        description: "Timeless lessons on wealth, greed, and happiness.",
        price: 299,
        stock: 150,
        rating: 4.8,
        image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        genre: "Non-Fiction",
        description: "Explores the history of our species, from the emergence of Homo sapiens up to the 21st century.",
        price: 650,
        stock: 80,
        rating: 4.7,
        image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
        organizer: org1._id,
      },
      {
        title: "1984",
        author: "George Orwell",
        genre: "Fiction",
        description: "A dystopian social science fiction novel and cautionary tale.",
        price: 250,
        stock: 60,
        rating: 4.9,
        image: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        organizer: org2._id,
      },
      {
        title: "Neuromancer",
        author: "William Gibson",
        genre: "Sci-Fi",
        description: "The classic cyberpunk novel that launched a thousand visions of the future.",
        price: 400,
        stock: 25,
        rating: 4.5,
        image: "https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg",
        organizer: org2._id,
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        genre: "Psychology",
        description: "The groundbreaking tour of the mind and explains the two systems that drive the way we think.",
        price: 520,
        stock: 90,
        rating: 4.6,
        image: "https://covers.openlibrary.org/b/isbn/9780374275631-L.jpg",
        organizer: org1._id,
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        description: "A great modern classic and the prelude to The Lord of the Rings.",
        price: 399,
        stock: 75,
        rating: 4.9,
        image: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Educated",
        author: "Tara Westover",
        genre: "Non-Fiction",
        description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
        price: 450,
        stock: 40,
        rating: 4.7,
        image: "https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg",
        organizer: org2._id,
      },
      {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        genre: "Mystery",
        description: "A shocking psychological thriller of a woman's act of violence against her husband-and the therapist obsessed with uncovering her motive.",
        price: 320,
        stock: 110,
        rating: 4.5,
        image: "https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "Romance",
        description: "The classic romantic novel of manners written by Jane Austen.",
        price: 199,
        stock: 150,
        rating: 4.8,
        image: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Foundation",
        author: "Isaac Asimov",
        genre: "Sci-Fi",
        description: "The first novel in Isaac Asimov's legendary Foundation trilogy, a classic of science fiction.",
        price: 480,
        stock: 55,
        rating: 4.7,
        image: "https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg",
        organizer: org2._id,
      },
      {
        title: "The Intelligent Investor",
        author: "Benjamin Graham",
        genre: "Finance",
        description: "The greatest investment advisor of the twentieth century, Benjamin Graham taught and inspired people worldwide.",
        price: 599,
        stock: 65,
        rating: 4.8,
        image: "https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Normal People",
        author: "Sally Rooney",
        genre: "Romance",
        description: "A story of mutual influence, aloneness and intimacy between two people who develop a complicated relationship.",
        price: 380,
        stock: 95,
        rating: 4.4,
        image: "https://covers.openlibrary.org/b/isbn/9781984822178-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Man's Search for Meaning",
        author: "Viktor E. Frankl",
        genre: "Psychology",
        description: "Psychiatrist Viktor Frankl's memoir has gripped generations of readers with its descriptions of life in Nazi death camps and its lessons for spiritual survival.",
        price: 299,
        stock: 130,
        rating: 4.9,
        image: "https://covers.openlibrary.org/b/isbn/9780807014295-L.jpg",
        organizer: org1._id,
      },
      {
        title: "The Girl with the Dragon Tattoo",
        author: "Stieg Larsson",
        genre: "Mystery",
        description: "A murder mystery, a family saga, a love story, and a financial intrigue combined into one satisfyingly complex novel.",
        price: 420,
        stock: 70,
        rating: 4.6,
        image: "https://covers.openlibrary.org/b/isbn/9780307269751-L.jpg",
        organizer: org1._id,
      },
      {
        title: "Hyperion",
        author: "Dan Simmons",
        genre: "Sci-Fi",
        description: "On the world called Hyperion, beyond the reach of galactic law, waits a creature called the Shrike.",
        price: 510,
        stock: 40,
        rating: 4.8,
        image: "https://covers.openlibrary.org/b/isbn/9780553283686-L.jpg",
        organizer: org2._id,
      }
    ];

    await Book.insertMany(books);
    console.log(`Seeded ${books.length} books successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Error with data import", error);
    process.exit(1);
  }
};

seedData();
