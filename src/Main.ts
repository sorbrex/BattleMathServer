import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import cors from 'cors';
import { generateQuestion } from './Utils';
import {PlayerInfo} from "./Interfaces";

const QUESTION_INTERVAL = 2_500; // 2.5 seconds between questions
const TARGET_SCORE = 10;

const PORT = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

// const corsOptions = {
//   origin: '*',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204,
// };
//
// app.use(cors(corsOptions));

const connectedClients = new Set();

let players: {[key: string]: PlayerInfo} = {};
let currentQuestion = generateQuestion();


app.get('/ping', (req, res) => {
  console.log('Received Ping');
  res.send('<h1>Super Pong</h1>');
});

io.on('connection', (socket) => {
  console.log('Connected ID: ', socket.id);
  // Add the newly connected client to the set
  connectedClients.add(socket.id);

  socket.on('registerUsername', (username) => {
    console.log('Registering Username: ', username, ' for ID: ', socket.id);
    players[socket.id] = {
      name: username,
      score: 0
    }
    io.emit('updateScoreboard', players)
  })

  // Send the initial question to the client
  socket.emit('question', {
    question: currentQuestion,
    answer: eval(currentQuestion)
  });

  // Listen for answers from clients
  socket.on('updateScore', (score:number) => {
      // Increase the player's score
      players[socket.id].score += 1

      io.emit('updateScoreboard', players);

      // Check if the player has won
      if (players[socket.id].score >= TARGET_SCORE) {
        console.log('Game Over');
        io.emit('updateScoreboard', players)
        io.emit('gameOver', { winner: players[socket.id]?.name, scores: players[socket.id]?.score });
        connectedClients.clear();
        players = {};
      }
  });

  // Listen for client disconnects
  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    delete players[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`🚀 🚀 Server Start @ http://localhost:${PORT}`);
});

// Start asking questions
askQuestion();


// Function to handle question generation and broadcasting
function askQuestion() {
  // Check if there are any connected clients
  if (connectedClients.size > 0) {
    currentQuestion = generateQuestion();
    io.emit('question', {
      question: currentQuestion,
      answer: eval(currentQuestion)
    });
  }
  // Schedule the next question after QUESTION_INTERVAL
  setTimeout(askQuestion, QUESTION_INTERVAL);
}
