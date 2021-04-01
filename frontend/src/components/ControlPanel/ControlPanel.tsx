import React, {ChangeEvent} from 'react';
import './ControlPanel.scss';
import {bindHandlersToComponent, CharacterStates, GameStateBase, parseDataType} from "../../helper";
import _, {DebouncedFunc} from "lodash";
import {RestAPI} from "../../api/REST";


interface ControlPanelState extends GameStateBase {
    feedbackCursor: [number, number];
}


// format for typescript enforcing is React.Component<propsInterface, stateInterface>
class ControlPanel extends React.Component<any, ControlPanelState> {
    private readonly debounceGameDataChange: DebouncedFunc<() => void>;
    private levelSettings: any = {};
    private readonly LEVEL_COUNT = 5;

    constructor(props: any) {
        super(props);
        this.state = {
            feedback: "",
            feedbackCursor: [-1, -1],
            level: 0,
            levelCount: this.LEVEL_COUNT,
            activity: 0,
            activityCount: 0,
            character: 0
        };
        bindHandlersToComponent(this);

        for (let i = 0; i <= this.LEVEL_COUNT + 1; i++) {
            this.levelSettings[i] = {count: 0}
        }

        // initialize debounce method so we can call it elsewhere in an event handler
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const classScope = this;
        this.debounceGameDataChange = _.debounce(function () {
            classScope.updateGameData();
        }, 300);
    }

    // HELPER METHODS
    getStateId(level: number | null = null, activity: number | null = null) {
        return `${level === null ? this.state.level : level}-${activity === null ? this.state.activity : activity}`;
    }

    updateGameData(feedback: string | null = null) {
        this.props.sendMessage('game data', {
            state: this.getStateId(),
            data: {feedback: feedback ? feedback : this.state.feedback}
        });
    }

    syncGameData(state_id: string = '') {
        RestAPI.get(state_id.length > 0 ? `game-data/${state_id}` : 'game-data')
            .then((response: any) => {
                const feedback = response.data.feedback || '';
                const activityCount = response.settings.count || 0;
                const [level, activity] = response.state.split('-').map((num: string) => parseDataType(num));
                this.levelSettings[level].count = activityCount;
                this.setState({feedback, activityCount, level, activity});
            });
    }

    updateCharacterState(state: CharacterStates) {
        this.props.sendMessage('character state', state);
        const activity = this.state.activity;
        if (state === CharacterStates.SUCCESS && activity < this.state.activityCount + 1) {
            this.setState({activity: activity + 1});
            this.props.sendMessage('game state', `${this.state.level}-${activity + 1}`);
        }
    }

    // EVENT HANDLERS
    handleCharacterIsActive(event: { type: string }) {
        if (event.type === 'mousedown' || event.type === 'touchstart') {
            this.updateCharacterState(CharacterStates.ACTIVE);
            const eventToRegister = event.type === 'mousedown' ? 'mouseup' : 'touchend';
            window.addEventListener(eventToRegister, this.handleCharacterIsIdle, true);
        }
    }

    handleCharacterIsIdle(event: { type: string }) {
        if (event.type === 'mouseup' || event.type === 'touchend') {
            this.updateCharacterState(CharacterStates.IDLE);
            window.removeEventListener(event.type, this.handleCharacterIsIdle, true);
        }
    }

    handleEmojiFeedback(event: any) {
        const feedback = this.state.feedback;
        const feedbackCursor = this.state.feedbackCursor;
        let newVal;
        if (feedbackCursor.every(i => i !== -1)) {
            const openingStr = feedback.substring(0, feedbackCursor[0]);
            const closingStr = feedback.substring(feedbackCursor[1], feedback.length);
            newVal = `${openingStr}${event.target.innerHTML}${closingStr}`;
        } else {
            newVal = feedback + event.target.innerHTML;
        }
        this.setState({feedback: newVal, feedbackCursor: [-1, -1]});
        this.updateGameData(newVal);
    }

    handleActivityChange(event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) {
        const activity = parseInt(event.target.value);
        this.setState({activity});
        this.syncGameData(this.getStateId(this.state.level, activity));
    }

    handleFeedbackChange(event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) {
        this.handleActivityChange(event);
    }

    handleFeedbackClickWithin(event: any) {
        this.setState({
            feedbackCursor: [event.currentTarget.selectionStart || 0, event.currentTarget.selectionEnd || 0]
        });
    }

    handleGameDataChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        event.persist();
        this.setState({[event.target.name]: parseDataType(event.target.value)} as any);
        this.debounceGameDataChange();
    }

    handleLevelChange(event: any) {
        const level = parseInt(event.target.value);
        this.setState({
            level,
            activity: 0,
            activityCount: this.levelSettings[level].count
        });
        this.syncGameData(this.getStateId(level, 0));
    }

    handleNavigateToState() {
        this.props.sendMessage('game state', this.getStateId());
    }

    handleUpdateActivityCount(event: any) {
        const activityCount = parseInt(event.target.value);
        this.levelSettings[this.state.level].count = activityCount;
        this.setState({activityCount});

        this.props.sendMessage('level settings', {
            level: this.state.level,
            settings: {count: activityCount}
        });
    }

    componentDidMount() {
        this.props.onConnect.subscribe((registerEvent: any) => {
            this.syncGameData();

            registerEvent('game state')
                .subscribe((data: any) => {
                    const gameStateId = data['state'];
                    const [level, activity] = gameStateId.split('-').map((num: string) => parseDataType(num));
                    this.setState({level, activity});
                });
        });
    }

    // LIFECYCLE METHODS
    render() {
        const generateOptions = (label: string, count: number) => {
            let options = [];
            for (let i = 1; i < count + 1; i++) {
                const liText = `${label} ${i}`;
                options.push(<option key={liText} value={i}>{liText}</option>);
            }
            options.push(<option key={`${label} Completed`} value={count + 1}>Completed</option>)
            return options;
        };
        // TODO: set conditional boolean vars here
        // TODO: const isActivityActive
        return <div>
            <div id='navigate'>
                <h3>Game Navigation</h3>
                <div>
                    <label>World Level</label>
                    <select name="level" value={this.state.level} onChange={this.handleLevelChange}>
                        <option key={`Level Initial`} value={0}>Lobby</option>
                        {generateOptions('Level', this.state.levelCount)}
                    </select>
                </div>

                { // if activity is in 'setup' state, show the activity count input
                    this.state.activity === 0 && this.state.level !== 0 && this.state.level !== this.state.levelCount + 1 ?
                        <div>
                            <label htmlFor="activityCount">Activity Count</label>
                            <input
                                id="activityCount"
                                type='number'
                                min="0"
                                size={2}
                                value={this.levelSettings[this.state.level].count}
                                onChange={this.handleUpdateActivityCount}/>
                        </div>
                        : null}

                { // if level is not in 'initial' or 'completed' state, show the activity select box
                    this.state.level !== 0 && this.state.level !== this.state.levelCount + 1 && this.levelSettings[this.state.level].count > 0 ?
                        <div>
                            <label>Activity Level</label>
                            <select value={this.state.activity} onChange={this.handleActivityChange}>
                                <option key={`Activity Setup`} value={0}>World Map</option>
                                {generateOptions('Activity', this.state.activityCount)}
                            </select>
                        </div>
                        : null}

                <button onClick={this.handleNavigateToState}>Navigate</button>
            </div>

            { // if activity is not in 'setup' or 'completed' state, show the activity panel
                this.state.activity !== 0 && this.state.activity !== this.state.activityCount + 1 ?
                    <div id="activityPanel">
                        <h3><label htmlFor="feedback">Feedback</label></h3>
                        <button onClick={this.handleEmojiFeedback}>✋</button>
                        <button onClick={this.handleEmojiFeedback}>👍</button>
                        <button onClick={this.handleEmojiFeedback}>✨</button>
                        <button onClick={this.handleEmojiFeedback}>🤩</button>
                        <button onClick={this.handleEmojiFeedback}>😎</button>
                        <br/>
                        <textarea name="feedback"
                                  id="feedback"
                                  value={this.state.feedback}
                                  onChange={this.handleGameDataChange}
                                  onClick={this.handleFeedbackClickWithin} >
                    </textarea>
                        <br/>

                        <div id="characterActions">
                            <h3>Character Actions</h3>
                            <div>
                                <button onMouseDown={this.handleCharacterIsActive}
                                        onTouchStart={this.handleCharacterIsActive}>Walk
                                </button>
                                <button onClick={() => {
                                    this.updateCharacterState(CharacterStates.FAILURE)
                                }}>Failure
                                </button>
                                <button onClick={() => {
                                    this.updateCharacterState(CharacterStates.SUCCESS)
                                }}>Success
                                </button>
                            </div>
                        </div>
                    </div>
                    : null}
        </div>
    }
}

export default ControlPanel;
