const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer, corsOptions) {
  io = new Server(httpServer, {
    cors: corsOptions || {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Allow agents to join user-specific room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] Socket ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

/**
 * Emit lead:created event to all connected clients
 */
function emitLeadCreated(lead) {
  if (io) {
    io.emit('lead:created', lead);
    console.log(`[Socket] Emitted lead:created for lead ${lead._id}`);
  }
}

/**
 * Emit lead:stage_updated event to all connected clients
 */
function emitLeadStageUpdated(payload) {
  if (io) {
    io.emit('lead:stage_updated', payload);
    console.log(`[Socket] Emitted lead:stage_updated for lead ${payload._id || payload.leadId}`);
  }
}

/**
 * Emit followup:due event when follow-up time arrives
 */
function emitFollowupDue(reminder) {
  if (io) {
    // Broadcast to everyone or to specific assigned agent's room
    if (reminder.agentId) {
      io.to(`user:${reminder.agentId}`).emit('followup:due', reminder);
    }
    // Also broadcast globally so dashboard activity feeds catch it
    io.emit('followup:due', reminder);
    console.log(`[Socket] Emitted followup:due for activity ${reminder.activityId}`);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitLeadCreated,
  emitLeadStageUpdated,
  emitFollowupDue
};
