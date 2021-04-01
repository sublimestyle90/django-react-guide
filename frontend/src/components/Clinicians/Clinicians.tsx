import {Component} from 'react';
import React from 'react';
import { filter } from 'rxjs/operators';
import './Clinicians.scss';
import {SocketAPI} from '../../api/Socket';
import Kiddos from "../Kiddos/Kiddos";
import ControlPanel from "../ControlPanel/ControlPanel";
import {bindHandlersToComponent} from "../../helper";
import {Observable, Subject} from "rxjs";


interface CliniciansState {
    connectedUsers: string[],
    isConnected: boolean
}

class Clinicians extends Component<any, CliniciansState> {
    private socketService: SocketAPI = new SocketAPI();
    private onConnectRegisterEvent = new Subject<(eventName: string) => Observable<any>>();

    constructor(props: any) {
        super(props);
        this.state = {
            connectedUsers: [],
            isConnected: false
        };
        bindHandlersToComponent(this);
    }

    handleKiddosIdEvent(kiddosId: string) {
        this.setState({connectedUsers: this.state.connectedUsers.filter((id: any) => this.isValidId(id) && id !== kiddosId)});
    }

    isValidId(id: string) {
        return id !== this.socketService.currentId();
    }

    // LIFECYCLE METHODS
    componentDidMount() {
        // initialize socket, set isConnected to true, and emit onConnect observable event
        this.socketService.init()
            .pipe(filter(() => !this.state.isConnected))
            .subscribe(() => {
                const registerEvent = this.socketService.register.bind(this.socketService);
                this.onConnectRegisterEvent.next(registerEvent);
                this.setState({isConnected: true});
            });

        // register to connect event and filter out current ID for all other connected users
        this.socketService.register('connect')
            .pipe(filter((value) => {
                return value && this.isValidId(value.socket_id);
            }))
            .subscribe(data => {
                this.setState({connectedUsers: [...this.state.connectedUsers, data.socket_id]});
            });

        // register to disconnect event and remove disconnected ID
        this.socketService.register('disconnect')
            .pipe(filter((value) => {
                return value && this.isValidId(value);
            }))
            .subscribe(value => {
                this.setState({connectedUsers: this.state.connectedUsers.filter((id: any) => id !== value)});
            });
    }

    componentWillUnmount() {
        this.socketService.disconnect();
    }

    render() {
        // TODO: justify or remove this comment
        // progress bar src: https://steemit.com/utopian-io/@alfarisi94/how-to-make-step-progress-bar-only-using-css
        // note: progressbar needs to fit in clinicians panel
        // if activity component, if level component, if world component.
        return <div className="Clinicians">
            <div>
                <h2>Clinician Portal v0.1</h2>
                <div id="qrConnect">
                    <h3>Scan QR code to connect as kiddo</h3>
                    <div>
                        <img alt="Kiddos QR code" width="75"
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=75x75&data=${window.location.host}/kiddos`}>
                        </img>
                    </div>
                </div>
                {
                    // TODO: fix recent regression of current ID showing up in list
                    this.state.connectedUsers.length > 0 ?
                    <div id="connectedClients">
                        <h3>Connected Client IDs</h3>
                        <ol>{this.state.connectedUsers.map((data: any) => <li key={data}>{data.substring(0, 5)}</li>)}</ol>
                    </div> : null
                }
                <div id="controlPanel">
                    <ControlPanel sendMessage={this.socketService.send.bind(this.socketService)} onConnect={this.onConnectRegisterEvent} />
                </div>
            </div>
            {
                // normally, we'd be able to just let Kiddos initialize their own socket, but because we need the ID of that socket,
                // we need to either control the socket, or be able to listen to an event in kiddos that emits the ID
            }
            {this.state.isConnected ? <Kiddos onConnectEmitSocketId={this.handleKiddosIdEvent} /> : null}
        </div>
    }
}

export default Clinicians;
