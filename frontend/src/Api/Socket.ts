import io from 'socket.io-client';
import { fromEvent, Observable } from 'rxjs';
import {parseDataType} from "../helper";


export class SocketAPI {
    private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

    public init(): Observable<any> {
        this.socket = io('localhost:5000');
        return fromEvent(this.socket, 'connect', {once: true});
        // TODO: move this URI argument into an environment-specific context injection
    }

    public currentId(): string {
        return this.socket.id;
    }

    public disconnect(): void {
        this.socket.disconnect();
    }

    public send(eventName: string, data: any): void {
        this.socket.emit(eventName, data);
    }

    public register(eventName: string): Observable<any> {
        return fromEvent(this.socket, eventName).pipe(parseDataType);
    }
}
