"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var cors_1 = __importDefault(require("cors"));
var Utils_1 = require("./Utils");
var QUESTION_INTERVAL = 2500; // 2.5 seconds between questions
var TARGET_SCORE = 10;
var PORT = 3000;
var app = (0, express_1.default)();
var server = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(server);
var corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
var connectedClients = new Set();
var players = {};
var currentQuestion = (0, Utils_1.generateQuestion)();
app.get('/ping', function (req, res) {
    res.send('<h1>Super Pong</h1>');
});
io.on('connection', function (socket) {
    console.log('Connected ID: ', socket.id);
    // Add the newly connected client to the set
    connectedClients.add(socket.id);
    socket.on('registerUsername', function (username) {
        console.log('Registering Username: ', username, ' for ID: ', socket.id);
        players[socket.id] = {
            name: username,
            score: 0
        };
        io.emit('updateScoreboard', players);
    });
    // Send the initial question to the client
    socket.emit('question', {
        question: currentQuestion,
        answer: eval(currentQuestion)
    });
    // Listen for answers from clients
    socket.on('updateScore', function (score) {
        var _a, _b;
        // Increase the player's score
        players[socket.id].score += 1;
        io.emit('updateScoreboard', players);
        // Check if the player has won
        if (players[socket.id].score >= TARGET_SCORE) {
            console.log('Game Over');
            io.emit('updateScoreboard', players);
            io.emit('gameOver', { winner: (_a = players[socket.id]) === null || _a === void 0 ? void 0 : _a.name, scores: (_b = players[socket.id]) === null || _b === void 0 ? void 0 : _b.score });
            connectedClients.clear();
            players = {};
        }
    });
    // Listen for client disconnects
    socket.on('disconnect', function () {
        connectedClients.delete(socket.id);
        delete players[socket.id];
    });
});
server.listen(PORT, function () {
    console.log("\uD83D\uDE80 \uD83D\uDE80 Server Start @ http://localhost:".concat(PORT));
});
// Start asking questions
askQuestion();
// Function to handle question generation and broadcasting
function askQuestion() {
    // Check if there are any connected clients
    if (connectedClients.size > 0) {
        currentQuestion = (0, Utils_1.generateQuestion)();
        io.emit('question', {
            question: currentQuestion,
            answer: eval(currentQuestion)
        });
    }
    // Schedule the next question after QUESTION_INTERVAL
    setTimeout(askQuestion, QUESTION_INTERVAL);
}
//# sourceMappingURL=Main.js.map