import React from 'react';
import './WorldMap.scss';

import {bindHandlersToComponent} from "../../helper";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const IMAGES = require.context('../../images/WorldMap', true);

interface WorldMapProps {
    level: number,
}

class WorldMap extends React.Component<any,WorldMapProps>{
    constructor(props: any){
        super(props);
        bindHandlersToComponent(this);
    }

    render() {
        return <div>
        <img src={IMAGES(`./${this.props.level + 1}.jpg`).default}/>
        </div>
    }
}

export default WorldMap;
