import React from 'react';
import {Component} from "react";
import './ActivityPuzzle.scss';

interface ActivityPuzzleProps {
    activity: number,
    activityCount: number,
    puzzleMatrix: [][],
    level: number
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const IMAGES = require.context('../../images/Puzzles', true);

export class ActivityPuzzle extends Component<ActivityPuzzleProps, any> {
    constructor(props: ActivityPuzzleProps) {
        super(props);
    }

    getMatrixIndices(activityNumber: number) {
        const matrixIndices = [];
        for (let row = 0; row < this.props.puzzleMatrix.length; row++) {
            for (let col = 0; col < this.props.puzzleMatrix.length; col++) {
                if (this.props.puzzleMatrix[row][col] === activityNumber) {
                    matrixIndices.push([row, col]);
                }
            }
        }
        return matrixIndices;
    }

    render() {
        let gridItems = [];
        for (let i = 1; i <= this.props.activityCount; i++) {
            const matchingIndices = this.getMatrixIndices(i);
            const [firstCellRow, firstCellCol] = matchingIndices[0];
            const tileNumber = this.props.puzzleMatrix[firstCellRow][firstCellCol];

            // TODO: fix transparency issue with safari (and other browsers?)
            // TODO: determine supported browsers and versions
            const styles = {
                gridColumn: `${firstCellCol + 1} / span 1`,
                gridRow: `${firstCellRow + 1} / span 1`,
                backgroundColor: `rgba(0, 0, 0, ${tileNumber < this.props.activity ? 0 : 1})`
            };

            // TODO: for some reason, this only fails when count is 5
            if (matchingIndices.length === 2) {
                const [secondCellRow, secondCellCol] = matchingIndices[1];
                if (secondCellRow === firstCellRow + 1) {
                    styles.gridRow = `${firstCellRow + 1} / span 2`;
                } else if (secondCellRow === firstCellRow - 1) {
                    styles.gridRow = `${secondCellRow + 1} / span 2`;
                } else if (secondCellCol === firstCellCol + 1) {
                    styles.gridColumn = `${firstCellCol + 1} / span 2`;
                } else if (secondCellCol === firstCellCol - 1) {
                    styles.gridColumn = `${secondCellCol + 1} / span 2`;
                }
            }
            gridItems.push(<div key={i} style={styles}></div>);
        }

        return gridItems.length > 0 ? <div className="ActivityPuzzle">
            <div id="puzzleImage">
                <img src={IMAGES(`./${this.props.level}.png`).default} />
                <div id="overlay">
                    {gridItems}
                </div>
            </div>
        </div> : null;
    }
}
