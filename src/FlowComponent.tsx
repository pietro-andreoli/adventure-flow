import { applyEdgeChanges, applyNodeChanges, Edge, Node, ReactFlow } from "reactflow";
import { useCallback, useEffect, useState } from "react";
import { Story, StoryNode } from "./Story";
import 'reactflow/dist/style.css';

export interface FlowComponentProps {
    story: Story;
}

const FlowComponent = (props: FlowComponentProps) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [story, setStory] = useState<Story>(props.story);
    const [currentStoryNode, setCurrentStoryNode] = useState<StoryNode | null>(null);
    const [currentFlowNode, setCurrentFlowNode] = useState<Node | null>(null);

    useEffect(() => {
        setStory(props.story);
    }, []);

    useEffect(() => {
        setNodes(story.flowNodes);
        setEdges(story.flowEdges);
        const startingNode = story.flowNodes.find(n => n.id === "start");
        if (startingNode) {
            setCurrentFlowNode(startingNode);
        }

    }, [story]);

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = useCallback(
        // @ts-ignore
        (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    return (
        <div>
            <h2>Flow Page</h2>
            <div>
                {/* Add controls for the flow component here */}
                <button>Add Node</button>
            </div>
            <div style={{ width: '100vw', height: '80vh' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    style={{width: "100vw", height: "80vh"}}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                   />

            </div>
        </div>
    );
}

export default FlowComponent;
