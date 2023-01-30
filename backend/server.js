// Imports
const http = require('http');
const app = require('./app');

// Function which returns a valid port, whether it is provided as a number or a string
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // Named pipe
        return val;
    }
    if (port >= 0) {
        // Port number
        return port;
    }
    return false;
};

// Set the port on either the port environment variable or port 3000
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Function which checks for various errors and handles them appropriately
function errorHandler(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Create a server
const server = http.createServer(app);

server.on('error', errorHandler);
// Listening event listener logging the port or named pipe on which the server is running to the console
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

// Set the server up to listen to the port previously set up
server.listen(port);