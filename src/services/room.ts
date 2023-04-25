import { Socket } from "socket.io-client";
import { Player } from "@/interface";


class RoomService {
  public async joinRoom(socket: Socket, roomId: string, name:string): Promise<boolean> {
    return new Promise((rs, rj) => {
      if (name.length < 2 || name.length > 10) {
        rj("Name must be between 2 and 10 characters");
        return;
      }
      if (roomId.length != 6) {
        rj("Room ID must be 6 characters");
      }
      socket.emit("join_room", { roomId, name });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async createRoom(socket: Socket, name:string): Promise<string> {

    return new Promise((rs, rj) => {
      if (name.length < 2 || name.length > 10) {
        rj("Name must be between 2 and 10 characters");
        return;
      }
      socket.emit("create_room", {name});
      socket.on("room_joined", (roomId) => {
        rs(roomId)
      });
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async checkRoom(socket: Socket, roomId: string): Promise<{[key:string]: Player}> {
    console.log("Checking", roomId)
    return new Promise((rs, rj) => {
      socket.emit("check_room", {roomId});
      socket.on("room_data", ({players}: {players: {[key:string]: Player}}) => {
        console.log("check_room", players)
        rs(players)
      });
      socket.on("not_joined", ({ error }) => rj(error));
    });
  }
}

export default new RoomService();
