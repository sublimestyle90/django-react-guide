import React from 'react';
import './Kiddos.scss';
import {SocketAPI} from '../../api/Socket';
//import Confetti from 'react-confetti';

import {bindHandlersToComponent, CharacterStates, GameStateBase, parseDataType} from '../../helper';
import WorldMap from "../WorldMap/WorldMap";
import Level from "../Level/Level";
import {RestAPI} from "../../api/REST";

interface KiddosProps {
    onConnectEmitSocketId?: (socketId: string) => void;
}

interface KiddosState extends GameStateBase {
    isConnected: boolean,
    activityPuzzleMatrix: [][]
}

class Kiddos extends React.Component<KiddosProps, KiddosState> {
    private socketService: SocketAPI = new SocketAPI();

    constructor(props: any) {
        super(props);
        this.state = {
            isConnected: false,
            activityPuzzleMatrix: [[]],
            feedback: '',
            level: 0,
            levelCount: 5,
            activity: 0,
            activityCount: 0,
            character: CharacterStates.IDLE
        };
        bindHandlersToComponent(this);
    }

    syncGameData() {
        RestAPI.get('game-data')
            .then((response) => {
                const [level, activity] = response.state.split('-').map(parseDataType);
                this.setState({
                    level,
                    activity,
                    activityCount: response.settings.count || 0,
                    activityPuzzleMatrix: response.settings.puzzle_matrix || [[]],
                    feedback: response.data.feedback?.toString() || ''
                });
            });
    }

    // LIFECYCLE METHODS
    componentDidMount() {
        // initialize socket and emit socket ID
        this.socketService.init()
            .subscribe(() => {
                if (this.props.onConnectEmitSocketId) {
                    this.props.onConnectEmitSocketId(this.socketService.currentId());
                }
                this.setState({isConnected: true});
                this.syncGameData();
            });

        this.socketService.register('game state')
            .subscribe((event: any) => {
                const [level, activity] = event.state.split('-').map(parseDataType);
                let stateToSet: any = {
                    level,
                    activity,
                    activityCount: event.settings.count || 0,
                    activityPuzzleMatrix: event.settings.puzzle_matrix || [[]],
                    feedback: event.data.feedback?.toString() || ''
                };

                if (activity === 0) {
                    stateToSet.character = CharacterStates.IDLE;
                    this.socketService.send('character state', stateToSet.character);
                }

                this.setState(stateToSet);
            });

        this.socketService.register('game data')
            .subscribe((event: any) => {
                const [level, activity] = event['state'].split('-').map(parseDataType);
                const isSameState = level === this.state.level && activity === this.state.activity;
                if (isSameState) {
                    this.setState({feedback: event.data.feedback || ''});
                }
            });

        this.socketService.register('character state')
            .subscribe((stateIndex: number) => {
                this.setState({character: stateIndex})
            });
    }

    componentWillUnmount() {
        this.socketService.disconnect();
    }

    render() {
        return <div className="Kiddos">
            <h2>Kiddos Portal v0.1</h2>
            {
                this.state.activity === 0 ?
                    <WorldMap level={this.state.level < 1 ? this.state.level : this.state.level - 1}></WorldMap>
                    : <Level feedback={this.state.feedback}
                             activityCount={this.state.activityCount} activity={this.state.activity}
                             level={this.state.level} character={this.state.character} puzzleMatrix={this.state.activityPuzzleMatrix}></Level>
            }
        </div>
    }
}

export default Kiddos;
