import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import si from 'systeminformation';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Emit system stats every second
setInterval(async () => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const network = await si.networkStats();
    const disk = await si.fsSize();
    const processes = await si.processes();
    const uptime = process.uptime();

    io.emit('systemStats', {
      cpu: cpu.currentLoad,
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
      },
      network: network[0],
      disk: disk[0],
      processes: processes.list || [], // Ensure `list` is an array
      uptime: uptime,
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
  }
}, 1000);

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});