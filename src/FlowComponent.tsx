import {
    applyEdgeChanges,
    applyNodeChanges,
    Edge,
    Node,
    ReactFlow,
    MiniMap,
    Background,
    Controls,
    BackgroundVariant
} from "reactflow";
import { useCallback, useEffect, useState } from "react";
import { Story, StoryNode } from "./Story";
import 'reactflow/dist/style.css';
import { graphlib, dagre } from "dagre-d3";
import { tree } from "d3";
import "primereact/resources/primereact.min.css";
import { Dropdown } from "primereact/dropdown";
import { ListBox } from "primereact/listbox";
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";

export interface FlowComponentProps {
    story: Story;
}

interface DropdownOption {
    name: string;
    code: string;
}

const FlowComponent = (props: FlowComponentProps) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [story, setStory] = useState<Story>(props.story);
    const [currentStoryNode, setCurrentStoryNode] = useState<StoryNode | null>(null);
    const [currentFlowNode, setCurrentFlowNode] = useState<Node | null>(null);
    const [edgeStyle, setEdgeStyle] = useState<DropdownOption>({ name: "Curved", code: "default" });
    const [showEdgeLabels, setShowEdgeLabels] = useState<boolean>(true);
    const [backgroundType, setBackgroundType] = useState<DropdownOption>({ name: "Dots", code: "dots" });

    const edgeStyleOptions: DropdownOption[] = [
        { name: "Curved", code: "default" },
        { name: "Straight", code: "straight" },
        { name: "Step", code: "step" },
        { name: "Smooth Step", code: "smoothstep" },
    ];

    const backgroundTypeOptions: DropdownOption[] = [
        { name: "Dots", code: BackgroundVariant.Dots },
        { name: "Lines", code: BackgroundVariant.Lines },
        { name: "Crosshatch", code: BackgroundVariant.Cross },
    ]

    useEffect(() => {
        setStory(props.story);
    }, []);

    useEffect(() => {
        const formattedNodes = layoutNodes(story.flowNodes, story.flowEdges);
        setNodes(formattedNodes);
        const updatedEdges = story.flowEdges.map(edge => {
            return {
                ...edge,
                // Update edge style
                type: edgeStyle.code,
                // Update edge label visibility
                label: showEdgeLabels ? edge.label : undefined
            }
        });
        setEdges(updatedEdges);
        const startingNode = story.flowNodes.find(n => n.id === "start");
        if (startingNode) {
            setCurrentFlowNode(startingNode);
        }

    }, [story, edgeStyle, showEdgeLabels]);


    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = useCallback(
        // @ts-ignore
        (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const layoutNodes = (nodes: Node[], edges: any[]) => {
        // Create a new graph instance
        const treeGraph = new graphlib.Graph();
        treeGraph.setGraph({});
        treeGraph.setDefaultEdgeLabel(() => ({}));

        // Add nodes to the graph. The name is the node id. The second parameter is metadata about the node.
        // In this case we're going to add labels to each of our nodes.
        nodes.forEach(node => {
            treeGraph.setNode(node.id, { width: 150, height: 50 });
        });

        // Add edges to the graph.
        edges.forEach(edge => {
            treeGraph.setEdge(edge.source, edge.target);
        });

        // @ts-ignore
        dagre.layout(treeGraph);

        treeGraph.nodes().forEach(nodeId => {
            const nodeInfo = treeGraph.node(nodeId);
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
                node.position = { x: nodeInfo.x - nodeInfo.width / 2, y: nodeInfo.y - nodeInfo.height / 2 };
            }
        });

        return nodes;
    };

    const handleEdgeStyleChange = (styleOption: any) => {
        setEdgeStyle(styleOption);
    }

    const handleShowEdgeLabelChange = (e: InputSwitchChangeEvent) => {
        if (e.value !== undefined && e.value !== null) {
            setShowEdgeLabels(e.value);
        }
    }

    const handleBackgroundTypeChange = (e: any) => {
        if (e.value) {
            setBackgroundType(e.value);
        }
    }

    return (
        <div>
            <h2>Flow Page</h2>
            <div className={"card"} style={{
                outline: "1px solid black",
                height: '10vh',
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center"}}>
                <span className="p-float-label">
                    <Dropdown
                        inputId={"edgeStyleDropdown"}
                        value={edgeStyle}
                        onChange={(e) => handleEdgeStyleChange(e.value)}
                        options={edgeStyleOptions}
                        optionLabel="name"
                        style={{display: "flex", width: "200px"}}
                        className="w-full md:w-14rem">

                    </Dropdown>
                    <label htmlFor="edgeStyleDropdown">Edge Style</label>
                </span>
                <span className="p-float-label">
                    <Dropdown
                        inputId={"backgroundStyleDropdown"}
                        value={backgroundType}
                        onChange={(e) => handleBackgroundTypeChange(e)}
                        options={backgroundTypeOptions}
                        optionLabel="name"
                        style={{display: "flex", width: "200px"}}
                        className="w-full md:w-14rem">

                    </Dropdown>
                    <label htmlFor="backgroundStyleDropdown">Background Style</label>
                </span>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{paddingBottom: "4px"}} htmlFor="edgeStyleSwitch">Toggle Edge Labels</label>
                    <InputSwitch inputId="edgeStyleSwitch" checked={showEdgeLabels} onChange={(e) => handleShowEdgeLabelChange(e)} />
                </div>
            </div>
            <div style={{ width: '100vw', height: '80vh' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="top-right">
                    <MiniMap style={{height: "250px"}} zoomable pannable nodeStrokeWidth={3} />
                    <Controls />
                    <Background color="#aaa" gap={16} variant={backgroundType.code as BackgroundVariant} />
                </ReactFlow>

            </div>
        </div>
    );
}

export default FlowComponent;
