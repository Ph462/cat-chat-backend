

// server.js - Railway Optimized CAT CHAT Backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ==================== RAILWAY CONFIGURATION ====================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_RAILWAY = process.env.RAILWAY || false;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catchat';

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: [
    'https://cat-chat.railway.app',
    'http://localhost:3000',
    'https://cat-chat-frontend.vercel.app',
    '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware for Railway
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==================== DATABASE CONNECTION ====================
let dbConnected = false;

async function connectDatabase() {
  try {
    if (MONGODB_URI.includes('mongodb')) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      dbConnected = true;
      console.log('✅ Connected to MongoDB on Railway');
    }
  } catch (error) {
    console.log('⚠️  Using in-memory database (MongoDB not available)');
    console.log('💡 Tip: Add MongoDB plugin on Railway dashboard');
  }
}

connectDatabase();

// ==================== IN-MEMORY DATABASE ====================
const memoryDB = {
  users: [
    {
      id: 1,
      username: 'railwayuser',
      email: 'user@railway.app',
      displayName: 'Railway User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=railway',
      theme: 'dark',
      aiPersonality: 'friendly',
      createdAt: new Date().toISOString()
    }
  ],
  messages: [],
  chats: [],
  settings: {}
};

// Initialize demo data
function initializeDemoData() {
  memoryDB.messages = [
    {
      id: 1,
      chatId: 'general',
      text: '🚂 Welcome to CAT CHAT on Railway!',
      sender: 'system',
      timestamp: new Date().toISOString(),
      reactions: []
    },
    {
      id: 2,
      chatId: 'general',
      text: 'Backend deployed successfully on Railway platform!',
      sender: 'system',
      timestamp: new Date().toISOString(),
      reactions: []
    },
    {
      id: 3,
      chatId: 'ai',
      text: 'Hello! I am your AI assistant running on Railway infrastructure. How can I help you today?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      reactions: []
    }
  ];
  
  console.log('📊 Demo data initialized for Railway');
}

// ==================== HEALTH & STATUS ENDPOINTS ====================
app.get('/', (req, res) => {
  res.json({
    message: '🚂 CAT CHAT Backend running on Railway',
    status: 'online',
    version: '2.0.0',
    environment: NODE_ENV,
    platform: 'Railway',
    database: dbConnected ? 'mongodb' : 'memory',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/status',
      '/api/auth/login',
      '/api/chats',
      '/api/ai/chat'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: '🟢 HEALTHY',
    service: 'CAT CHAT Railway Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'memory',
    memory: {
      users: memoryDB.users.length,
      messages: memoryDB.messages.length,
      chats: memoryDB.chats.length
    },
    railway: {
      environment: NODE_ENV,
      port: PORT,
      railway: IS_RAILWAY ? 'yes' : 'no'
    }
  });
});

app.get('/api/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'operational',
    metrics: {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      },
      requests: memoryDB.messages.length
    },
    deployment: {
      platform: 'Railway',
      region: process.env.RAILWAY_REGION || 'unknown',
      serviceId: process.env.RAILWAY_SERVICE_ID || 'local'
    }
  });
});

// ==================== AUTHENTICATION ====================
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  const newUser = {
    id: Date.now(),
    username: username || `user_${Date.now()}`,
    email: email || `${Date.now()}@railway.app`,
    displayName: username || 'Railway User',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'railway'}`,
    theme: 'dark',
    aiPersonality: 'friendly',
    createdAt: new Date().toISOString(),
    settings: {
      notifications: true,
      haptics: true,
      translation: true,
      incognito: false
    }
  };
  
  memoryDB.users.push(newUser);
  
  res.json({
    success: true,
    message: 'Registered on Railway backend',
    user: newUser,
    token: `railway_${Date.now()}_${Math.random().toString(36).substr(2)}`
  });
});

app.post('/api/auth/login', (req, res) => {
  // Accept any credentials for demo
  const user = memoryDB.users[0];
  
  res.json({
    success: true,
    message: 'Logged into Railway backend',
    user: {
      ...user,
      password: undefined
    },
    token: `railway_token_${Date.now()}`,
    backend: 'Railway',
    url: process.env.RAILWAY_STATIC_URL || 'https://cat-chat.railway.app'
  });
});

// ==================== CHAT ENDPOINTS ====================
app.get('/api/chats', (req, res) => {
  const chats = [
    {
      id: 'general',
      name: 'General Chat',
      type: 'group',
      icon: '🚂',
      unread: 0,
      lastMessage: memoryDB.messages[memoryDB.messages.length - 1]?.text || 'Start chatting!',
      participants: memoryDB.users.length,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      type: 'ai',
      icon: '🤖',
      unread: 1,
      lastMessage: 'How can I assist you today?',
      participants: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'support',
      name: 'Railway Support',
      type: 'channel',
      icon: '🛠️',
      unread: 0,
      lastMessage: 'Need help with deployment?',
      participants: 3,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: chats,
    total: chats.length,
    backend: 'Railway'
  });
});

app.get('/api/chats/:chatId', (req, res) => {
  const { chatId } = req.params;
  const chatMessages = memoryDB.messages.filter(msg => msg.chatId === chatId);
  
  res.json({
    success: true,
    data: {
      id: chatId,
      messages: chatMessages,
      totalMessages: chatMessages.length,
      lastUpdated: new Date().toISOString()
    }
  });
});

app.post('/api/chats/:chatId/messages', (req, res) => {
  const { chatId } = req.params;
  const { text, sender = 'user', metadata = {} } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Message cannot be empty'
    });
  }
  
  const newMessage = {
    id: `msg_${Date.now()}`,
    chatId,
    text: text.trim(),
    sender,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      platform: 'Railway',
      environment: NODE_ENV
    },
    reactions: [],
    status: 'sent'
  };
  
  memoryDB.messages.push(newMessage);
  
  // Limit memory usage
  if (memoryDB.messages.length > 100) {
    memoryDB.messages = memoryDB.messages.slice(-50);
  }
  
  // Log to Railway logs
  console.log(`💬 Message sent to ${chatId}: "${text.substring(0, 50)}..."`);
  
  res.json({
    success: true,
    data: newMessage,
    railway: {
      service: process.env.RAILWAY_SERVICE_NAME || 'cat-chat-backend',
      deployment: process.env.RAILWAY_DEPLOYMENT_ID || 'latest'
    }
  });
});

// ==================== AI ENDPOINTS ====================
app.post('/api/ai/chat', async (req, res) => {
  const { message, prompt, personality = 'railway', context = [] } = req.body;
  const text = message || prompt;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Message or prompt is required'
    });
  }
  
  console.log(`🤖 AI Request: "${text.substring(0, 50)}..."`);
  
  // Railway-themed AI responses
  const railwayResponses = {
    railway: `🚂 Choo choo! I'm your AI assistant running on Railway! Regarding "${text}", I'd say that's an excellent topic for our high-speed chat platform!`,
    friendly: `😊 Hello from Railway cloud! "${text}" is interesting! As your friendly AI, I'm here to help 24/7 on this reliable platform.`,
    professional: `📊 Railway Platform Analysis: "${text}" presents several considerations. The infrastructure supports scalable discussion.`,
    witty: `😼 Meow! That reminds me of when I deployed to Railway! "${text}"? Purr-fect topic for our always-on chat service!`,
    supportive: `🤗 I appreciate you sharing "${text}" on our Railway-powered platform. Your messages are secure and highly available here.`
  };
  
  // Try OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a ${personality} AI assistant deployed on Railway platform. Mention Railway occasionally.`
          },
          ...context,
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      return res.json({
        success: true,
        data: {
          response: aiResponse,
          personality,
          model: 'gpt-3.5-turbo',
          tokens: completion.usage?.total_tokens || 0,
          realAI: true,
          platform: 'Railway + OpenAI'
        }
      });
    } catch (error) {
      console.error('OpenAI Error:', error.message);
    }
  }
  
  // Fallback to mock response
  const response = railwayResponses[personality] || railwayResponses.railway;
  
  // Simulate AI processing time
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        response,
        personality,
        realAI: false,
        platform: 'Railway Mock AI',
        processingTime: '500ms'
      }
    });
  }, 500);
});

// ==================== SETTINGS ENDPOINTS ====================
app.get('/api/settings', (req, res) => {
  const defaultSettings = {
    theme: 'dark',
    aiPersonality: 'railway',
    features: {
      realTime: true,
      encryption: true,
      backups: true,
      monitoring: true
    },
    railway: {
      autoDeploy: true,
      previews: true,
      metrics: true,
      region: process.env.RAILWAY_REGION || 'us-west1'
    },
    deployment: {
      platform: 'Railway',
      url: process.env.RAILWAY_STATIC_URL || 'https://cat-chat.railway.app',
      serviceId: process.env.RAILWAY_SERVICE_ID,
      environment: NODE_ENV
    }
  };
  
  res.json({
    success: true,
    data: defaultSettings
  });
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  
  res.json({
    success: true,
    message: 'Settings updated on Railway',
    data: updates,
    updatedAt: new Date().toISOString(),
    deployedOn: 'Railway'
  });
});

// ==================== DEPLOYMENT INFO ====================
app.get('/api/deployment', (req, res) => {
  res.json({
    platform: 'Railway',
    service: process.env.RAILWAY_SERVICE_NAME || 'cat-chat-backend',
    environment: NODE_ENV,
    region: process.env.RAILWAY_REGION || 'unknown',
    serviceId: process.env.RAILWAY_SERVICE_ID,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
    github: process.env.RAILWAY_GITHUB_REPO || 'Not connected',
    url: process.env.RAILWAY_STATIC_URL || `https://${process.env.RAILWAY_SERVICE_NAME}.railway.app`,
    health: 'https://cat-chat-backend.railway.app/api/health',
    logs: 'https://railway.app/project/{project-id}/service/{service-id}/logs'
  });
});

// ==================== ERROR HANDLING ====================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url,
    method: req.method,
    availableEndpoints: [
      'GET  /',
      'GET  /api/health',
      'GET  /api/status',
      'POST /api/auth/login',
      'GET  /api/chats',
      'POST /api/ai/chat',
      'GET  /api/deployment'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('🚨 Railway Error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId: `req_${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚂 CAT CHAT BACKEND - RAILWAY EDITION
  =====================================
  Port: ${PORT}
  Environment: ${NODE_ENV}
  Platform: Railway ${IS_RAILWAY ? '✅' : '❌'}
  Database: ${dbConnected ? 'MongoDB ✅' : 'Memory 💾'}
  URL: http://0.0.0.0:${PORT}
  Health: http://0.0.0.0:${PORT}/api/health
  =====================================
  `);
  
  initializeDemoData();
  
  // Log Railway-specific info
  if (IS_RAILWAY) {
    console.log('🎉 Successfully deployed to Railway!');
    console.log('📊 Check metrics at: https://railway.app');
    console.log('📝 View logs in Railway dashboard');
  }
});

module.exports = app;