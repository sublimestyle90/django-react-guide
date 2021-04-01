import React from 'react';
import './Level.css';
import StepProgressBar from "../StepProgressBar/StepProgressBar";

import Confetti from "react-confetti";
import {CharacterStates} from "../helper";
import {ActivityPuzzle} from "../ActivityPuzzle/ActivityPuzzle";

const marked = require("marked");

const CHARACTER_IMAGES = {
    [CharacterStates.IDLE]: 'idle.JPG',
    [CharacterStates.ACTIVE]: 'active.gif',
    [CharacterStates.SUCCESS]: 'success.gif',
    [CharacterStates.FAILURE]: 'failure.gif'
}

// @ts-ignore
const IMAGES = require.context('../Images');

export interface LevelProps {
    feedback: string,
    activityCount: number,
    puzzleMatrix: [][],
    activity: number,
    character: number,
    level: number
}

class Level extends React.Component<LevelProps, any> {
    render() {
        return <div className = "Level">
            <div id="stage">
                <img id="background" src={IMAGES(`./LevelBackground/${this.props.level}.jpg`).default}/>
                <img id="character" src={IMAGES(`./Characters/${CHARACTER_IMAGES[this.props.character as CharacterStates]}`).default}/>
                <ActivityPuzzle activity={this.props.activity} activityCount={this.props.activityCount} puzzleMatrix={this.props.puzzleMatrix} level={this.props.level} />
            </div>
            <StepProgressBar activity={this.props.activity} activityCount={this.props.activityCount}></StepProgressBar>
            <div id="feedback" dangerouslySetInnerHTML={{__html: marked(this.props.feedback)}}></div>
            {this.props.activity>this.props.activityCount ?
            <Confetti></Confetti> : null}
        </div>
    }

}

export default Level;
