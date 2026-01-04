import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import eventsRoutes from "./routes/events.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import itemRoutes from "./routes/items.js";
import loanRoutes from "./routes/loan.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'https://localhost'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/children", childrenRoutes);
app.use("/events", eventsRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/items", itemRoutes);
app.use("/loan", loanRoutes);

// MongoDB Express Admin interface
let db;

// Connect to MongoDB for Mongoose (models)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((err) => {
    console.error("Mongoose error:", err);
  });

// Connect to MongoDB for Admin interface
MongoClient.connect(process.env.MONGO_URI)
  .then(client => {
    db = client.db('games-db');
    console.log("MongoDB Admin interface connected");
  })
  .catch(err => {
    console.error("MongoDB Admin error:", err);
  });

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Admin interface routes
app.get('/admin', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'MongoDB not connected' });
  }
  
  try {
    // List all collections
    const collections = await db.collections();
    
    // Get database stats
    const stats = await db.stats();
    
    // Get all documents from each collection
    const collectionsData = {};
    for (let collection of collections) {
      const name = collection.collectionName;
      const count = await collection.countDocuments({});
      const docs = await collection.find({}).limit(10).toArray();
      collectionsData[name] = {
        count,
        sample: docs
      };
    }
    
    // Generate admin HTML
    const adminHtml = generateAdminHtml(collectionsData, stats);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(adminHtml);
  } catch (error) {
    console.error('Admin interface error:', error);
    res.status(500).json({ error: 'Failed to load admin interface' });
  }
});

function generateAdminHtml(collectionsData, stats) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB Admin - WDM</title>
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .collection-card { @apply bg-white border rounded-lg p-4 shadow-md; }
        .document-item { @apply bg-gray-50 p-2 rounded mb-2 text-sm; }
        .document-fields { @apply grid grid-cols-2 gap-2 text-xs text-gray-600; }
        .nav-tab { @apply px-4 py-2 rounded-t-lg font-medium hover:bg-blue-50 cursor-pointer; }
        .nav-tab.active { @apply bg-blue-500 text-white hover:bg-blue-600; }
        .json-view { @apply bg-gray-900 text-green-400 p-4 rounded text-xs font-mono overflow-x-auto; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div x-data="{ activeTab: 'collections' }" class="container mx-auto p-6">
        <header class="mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">🗄️ MongoDB Admin - WDM</h1>
            <div class="text-sm text-gray-600 mb-4">
                Base de données: <span class="font-mono text-blue-600">${process.env.MONGO_URI?.split('/')[2] || 'games-db'}</span>
            </div>
            
            <nav class="flex space-x-2 mb-6">
                <button @click="activeTab = 'collections'" 
                        :class="activeTab === 'collections' ? 'nav-tab active' : 'nav-tab'">
                    Collections
                </button>
                <button @click="activeTab = 'stats'" 
                        :class="activeTab === 'stats' ? 'nav-tab active' : 'nav-tab'">
                    Statistiques
                </button>
            </nav>
        </header>

        <!-- Collections Tab -->
        <div x-show="activeTab === 'collections'" class="space-y-4">
            <template x-for="(data, collection) in Object.entries(collectionsData)">
                <div class="collection-card">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 capitalize" x-text="'📁 ' + collection">
                    </h3>
                    <div class="text-sm text-gray-600 mb-3">
                        Total documents: <span class="font-bold text-blue-600" x-text="data.count"></span>
                    </div>
                    
                    <div class="space-y-2">
                        <template x-for="(doc, index) in data.sample.slice(0, 3)">
                            <div class="document-item">
                                <div class="font-medium text-gray-800 mb-1" x-text="'#' + (index + 1)"></div>
                                <div class="document-fields">
                                    <template x-for="(value, key) in Object.entries(doc)">
                                        <div><span class="font-mono text-gray-500" x-text="key + ':'"></span></div>
                                        <div class="text-gray-700 truncate" x-text="JSON.stringify(value[1])"></div>
                                    </template>
                                </div>
                            </div>
                        </template>
                        <div x-show="data.sample.length > 3" class="text-sm text-gray-500 mt-2" x-text="'... et ' + (data.sample.length - 3) + ' autres documents'">
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Stats Tab -->
        <div x-show="activeTab === 'stats'" class="collection-card">
            <h3 class="text-lg font-bold text-gray-800 mb-4">📊 Statistiques de la base</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-700">Collections</h4>
                    <p class="text-2xl font-bold text-blue-600">${Object.keys(collectionsData).length}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Total Documents</h4>
                    <p class="text-2xl font-bold text-green-600">${Object.values(collectionsData).reduce((sum, data) => sum + data.count, 0)}</p>
                </div>
            </div>
            
            <div class="mt-6">
                <h4 class="font-semibold text-gray-700">Informations Système</h4>
                <div class="json-view">
                    <pre>${JSON.stringify(stats, null, 2)}</pre>
                </div>
            </div>
        </div>
    </div>

    <script>
        function refreshPage() {
            window.location.reload();
        }
        
        // Auto-refresh every 30 seconds
        setInterval(refreshPage, 30000);
    </script>
</body>
</html>
  `;
}

// Start server
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
  console.log("📊 MongoDB Admin interface: http://localhost:" + PORT + "/admin");
  console.log("🔗 Database: " + process.env.MONGO_URI);
});
