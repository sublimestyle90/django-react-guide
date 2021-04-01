import {Component} from "react";
import React from 'react';
import "react-step-progress-bar/styles.css";
import './StepProgressBar.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - there are no type definitions available for this library
import {ProgressBar, Step} from 'react-step-progress-bar';

export interface StepProgressBarProps {
    activity: number;
    activityCount: number;
}

class StepProgressBar extends Component<StepProgressBarProps, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        const steps = [];
        for (let i = 0; i < this.props.activityCount + 1; ++i) {
            steps.push(
                <Step key={i}>
                    {() =>
                        <div className={`indexedStep ${i < this.props.activity ? "accomplished" : null}`}>
                            {i}
                        </div>
                    }
                </Step>
            );
        }
        return (
            <ProgressBar percent={Math.round(100 / this.props.activityCount * (this.props.activity - 1))}>
                {steps}
            </ProgressBar>
        );
    }
}

export default StepProgressBar;
