import type { Socket } from "socket.io";

export function registerSocketEvents(socket: Socket) {
  socket.on("join_poll", (pollId: string) => {
    socket.join(`poll:${pollId}`);

    console.log(`Socket joined poll room: ${pollId}`);
  });

  socket.on("leave_poll", (pollId: string) => {
    socket.leave(`poll:${pollId}`);

    console.log(`Socket left poll room: ${pollId}`);
  });
}
