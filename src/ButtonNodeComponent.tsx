import React, { useCallback, useEffect, useState } from 'react';
import 'reactflow/dist/style.css';
import { Handle, Position } from "reactflow";
import { Button } from "primereact/button";

// Define the prop types for this component
interface ButtonNodeProps {
    id: string;
    data: {
        label: string;
        onButtonClick: (param: {id: string, data: any}) => void; // A function to be called when the button is clicked
        hiddenLabel: string
    };
}

const ButtonNodeComponent = (props: ButtonNodeProps) => {

    const [nodeLabel, setNodeLabel] = useState(props.data.label)
    const [showButton, setShowButton] = useState(true);

    useEffect(() => {
        if (nodeLabel.length > 0) {
            setShowButton(false);
        }
    }, [nodeLabel]);

    const handleButtonClick = useCallback((evt: any) => {
        console.log(`button id ${props.id} clicked`);
        props.data.onButtonClick(props);
        setNodeLabel(props.data.hiddenLabel)
    }, [props.data.onButtonClick]);

    // const handleButtonClick = (evt: any) => {
    //     console.log(`button id ${props.id} clicked`);
    //     props.data.onButtonClick(props);
    // }

    const onChange = (event: any) => {
        console.log(event);
    }

    return (

        <div className={"button-node"}  >
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#000' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={true}
            />


            <p>{props.data.label}</p>
            <Button visible={showButton} className="nodrag" label="..." onClick={handleButtonClick} style={{height: "30px"}} />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#000' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={true}
            />
        </div>
    );
};

export default ButtonNodeComponent;
