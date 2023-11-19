const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Trie = require('trie-search');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const generateUniqueId = () => {
  return Math.random().toString(36);
};

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://sangamprasad:sangam.0@logs.min3gmc.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  resourceId: String,
  traceId: String,
  spanId: String,
  commit: String,
  metadata: {
    parentResourceId: String,
    environment: String,
    dataCenter: String,
    applicationVersion: String,
  },
});


const Log = mongoose.model('Log', logSchema);

const trie = new Trie('message');

// Example log entries with additional metadata
const exampleLogs = [
    {
        "level": "error",
        "message": "Failed to connect sangam database",
        "resourceId": "server-1234",
        "traceId": "abc-xyz-123",
        "spanId": "span-456",
        "commit": "5e5342f",
        "metadata": {
          "parentResourceId": "server-0987",
          "environment": "production",
          "dataCenter": "us-west-1",
          "applicationVersion": "1.2.3"
        },
        "timestamp": "2023-11-19T12:30:00.000Z"
      },
      {
        "level": "info",
        "message": "Application started successfully",
        "resourceId": "server-5678",
        "traceId": "def-uvw-456",
        "spanId": "span-789",
        "commit": "7f83bbf",
        "metadata": {
          "parentResourceId": "server-0987",
          "environment": "production",
          "dataCenter": "us-east-1",
          "applicationVersion": "2.0.1"
        },
        "timestamp": "2023-11-19T12:45:00.000Z"
      },
      {
        "level": "info",
        "message": "Application not working properly",
        "resourceId": "server-5578",
        "traceId": "def-uvw-436",
        "spanId": "span-789",
        "commit": "5683bbf",
        "metadata": {
          "parentResourceId": "server-5578",
          "environment": "production",
          "dataCenter": "us-east-1",
          "applicationVersion": "2.0.1"
        },
        "timestamp": "2023-11-19T13:00:00.000Z"
      }
];


//bonus features
//1.
app.post('/search', async (req, res) => {
    const { searchQuery, startDate, endDate, useRegex, filters } = req.body;

    try {
        let query = {};

        // Construct the query based on filters
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (key === 'message') {
                    query[key] = new RegExp(value, 'i');
                } else if (key === 'startDate' || key === 'endDate') {
                    query.timestamp = { ...(query.timestamp || {}), [key === 'startDate' ? '$gte' : '$lte']: new Date(value) };
                } else {
                    query[key] = value;
                }
            });
        }

        // Include date range filter in the query
        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);

            if (!isNaN(parsedStartDate.valueOf()) && !isNaN(parsedEndDate.valueOf())) {
                query.timestamp = { $gte: parsedStartDate, $lte: parsedEndDate };
            } else {
                return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
            }
        }

        if (useRegex) {
            query.message = new RegExp(searchQuery, 'i');
        }

        const searchResults = await Log.find(query);

        if (searchResults.length === 0) {
            res.status(404).json({ error: 'No valid input found.' });
        } else {
            console.log('Search results:', searchResults);
            res.status(200).json(searchResults);
        }
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('Internal Server Error');
    }
});

  //3. 

  app.post('/search', async (req, res) => {
    const { filters } = req.body;
  
    try {
      let query = {};
  
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (key === 'message') {
            query[key] = new RegExp(value, 'i');
          } else if (key === 'startDate' || key === 'endDate') {

            query.timestamp = { ...(query.timestamp || {}), [key === 'startDate' ? '$gte' : '$lte']: new Date(value) };
          } else {
           
            query[key] = value;
          }
        });
      }
  
      const searchResults = await Log.find(query);
  
      if (searchResults.length === 0) {
        res.status(404).json({ error: 'No valid input found.' });
      } else {
        console.log('Search results:', searchResults);
        res.status(200).json(searchResults);
      }
    } catch (error) {
      console.error('Error during search:', error);
      res.status(500).send('Internal Server Error');
    }
  });

//Bonus Features
  // 4. Provide real-time log ingestion and searching capabilities:
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log('Received message:', message);
        wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  });

  //5. Implement role-based access to the query interface:
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const secretKey = 'dfa81747e2e6f5e2b834196c3291bd3432089703c577550da09afdfb68c66fc0';

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
}, (jwtPayload, done) => {
  if (jwtPayload.roles.includes('admin')) {
    return done(null, jwtPayload);
  } else {
    return done(null, false);
  }
}));

app.use(passport.initialize());

// Route for authentication and getting JWT
app.post('/login', (req, res) => {
  const user = { username: 'admin', roles: ['admin'] };
  const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

  res.json({ token });
});

// Protected route with role-based access
app.post('/logs', passport.authenticate('jwt', { session: false, failureRedirect: '/unauthorized' }), (req, res) => {
  // Only authenticated users with the 'admin' role can access this route
  res.status(200).send('Protected route: Log entry saved successfully.');
});

app.get('/unauthorized', (req, res) => {
  res.status(403).send('Unauthorized: Insufficient permissions.');
});

// Saving the example log entries to the trie
exampleLogs.forEach((logEntry) => {
    const trieId = logEntry._id ? logEntry._id.toString() : generateUniqueId();
    trie.add({
      ...logEntry,
      _id: trieId,
    });
});
// Endpoint to get all logs from the trie (for demonstration purposes)
app.get('/allLogs', (req, res) => {
  res.status(200).json(trie.getTrie());
});

// app.post('/search', async (req, res) => {
//   const { searchQuery } = req.body;

//   try {
//     const searchResults = trie.get(searchQuery);
//     console.log('Search results:', searchResults);
//     res.status(200).json(searchResults);
//   } catch (error) {
//     console.error('Error during search:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.post('/search', async (req, res) => {
    const { searchQuery } = req.body;
  
    try {
      const searchResults = trie.get(searchQuery);
  
      if (searchResults.length === 0) {
        // No valid input found
        res.status(404).json({ error: 'No valid input found.' });
      } else {
        console.log('Search results:', searchResults);
        res.status(200).json(searchResults);
      }
    } catch (error) {
      console.error('Error during search:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
app.post('/logs', async (req, res) => {
  const logEntry = req.body;

  try {
    const newLog = new Log(logEntry);
    await newLog.save();
    saveExampleLog(logEntry); // Add the new log entry to the trie
    console.log('Log entry saved:', newLog);
    res.status(200).send('Log entry saved successfully.');
  } catch (error) {
    console.error('Error saving log entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Log Ingestor listening at http://localhost:${port}`);
});
