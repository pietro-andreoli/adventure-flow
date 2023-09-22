import {
    applyEdgeChanges,
    applyNodeChanges,
    Edge,
    Node,
    ReactFlow,
    MiniMap,
    Background,
    Controls,
    BackgroundVariant, useOnSelectionChange, addEdge
} from "reactflow";
import { useCallback, useEffect, useState } from "react";
import { PathChoice, Story, StoryNode } from "./Story";
import 'reactflow/dist/style.css';
import { graphlib, dagre } from "dagre-d3";
import { tree } from "d3";
import "primereact/resources/primereact.min.css";
import { Dropdown } from "primereact/dropdown";
import { ListBox } from "primereact/listbox";
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import StorySelectorComponent from "./StorySelectorComponent";
import ButtonNodeComponent from "./ButtonNodeComponent";
import "./styles.css";

export interface FlowComponentProps {
}

interface DropdownOption {
    name: string;
    code: string;
}

const nodeTypes = {
    buttonNode: ButtonNodeComponent,
}

const FlowComponent = (props: FlowComponentProps) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [story, setStory] = useState<Story>();
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

    }, []);

    // useEffect to handle changes when a new story is selected.
    useEffect(() => {
        if (story) {
            const laidOutNodes = layoutNodes(story.flowNodes, story.flowEdges);
            story.flowNodes = laidOutNodes;
            // Find starting node and set it as the current node
            const startingNode = story.flowNodes.find(n => n.id === "start");
            if (startingNode) {
                setNodes([startingNode]);
                setCurrentFlowNode(startingNode);
                setCurrentStoryNode({ title: startingNode.data.label, text: startingNode.data.text, choices: [] });
            }
            setEdges(story.flowEdges);
        }
    }, [story]);

    // Whenever nodes or edges changes, call layoutNodes to update the layout
    useEffect(() => {
        // if (nodes.length > 0 && edges.length > 0) {
        //     const formattedNodes = layoutNodes(nodes, edges);
        //     setNodes(formattedNodes);
        // }
    }, [nodes, edges]);

    // useEffect to handle the visualization of edge styles and edge labels
    useEffect(() => {
        if (story) {
            // Update the edges with the new edge style and edge label visibility
            const updatedEdges: Edge[] = story.flowEdges.map(edge => {
                return {
                    ...edge,
                    // Update edge style
                    type: edgeStyle.code,
                    // Update edge label visibility
                    label: showEdgeLabels ? edge.label : undefined
                }
            });
            setEdges(updatedEdges);
        }

    }, [edgeStyle, showEdgeLabels]);

    useEffect(() => {
        if (currentFlowNode) {
            const nextNodes = getNextOptions(currentFlowNode);
            setNodes([...nodes, ...nextNodes.nextNodes]);
            // setEdges([...edges, ...nextNodes.nextEdges]);
        }
    }, [currentFlowNode]);

    useOnSelectionChange({
        onChange: ({ nodes: selectedNodes, edges: selectedEdges }) => {
            console.log('changed selection', selectedNodes, edges)
            if (selectedNodes.length === 1) {
                const selectedNode = selectedNodes[0];
                // selectedNode.data.label = selectedNode.data.hiddenLabel ? selectedNode.data.hiddenLabel : selectedNode.data.label;
                if (selectedNode.data.label.length > 0) {
                    setCurrentStoryNode({title: selectedNode.data.label, text: selectedNode.data.content, choices: []});

                }
                // const index = nodes.findIndex(n => n.id === selectedNode.id);
                // let x = [...nodes];
                // x = x.map(n => {
                //     return {
                //         ...n,
                //         data: { ...n.data, updateTrigger: !n.data.updateTrigger },
                //     }
                // })
                // setNodes(x);
            }
        },
    });

    const nodeButtonOnClick =  useCallback((nodeData: {id: string, data: any}) => {
        setNodes((prevNodes) => {
            const selectedNode = prevNodes.find(n => n.id === nodeData.id);
            if (selectedNode) {
                selectedNode.data.label = selectedNode.data.hiddenLabel ? selectedNode.data.hiddenLabel : selectedNode.data.label;
                let newNodes = [...prevNodes];
                newNodes.splice(newNodes.indexOf(selectedNode), 1);
                newNodes = [...newNodes, selectedNode];
                const {nextNodes, nextEdges} = getNextOptions(selectedNode);
                setCurrentFlowNode(selectedNode);
                return [...newNodes, ...nextNodes];
            }
            return [...prevNodes];
        });


        // const y = nodes;
        // const selectedNode = nodes.find(n => n.id === nodeData.id);
        // if (selectedNode) {
        //     selectedNode.data.label = selectedNode.data.hiddenLabel ? selectedNode.data.hiddenLabel : selectedNode.data.label;
        //     setCurrentFlowNode(selectedNode);
        // }
    }, [story]);

    const getNextOptions = (currentNode: Node) => {
        if (story) {
            const nextPathChoices: PathChoice[] = story.story[currentNode.id].choices;
            if (nextPathChoices) {
                const nextNodeIds = nextPathChoices.map((c: PathChoice) => c.next);
                let nextNodes = story.flowNodes.filter(n => nextNodeIds.includes(n.id));
                nextNodes = nextNodes.map(n => {
                    return {
                        ...n,
                        type: "buttonNode",
                        data: {
                            hiddenLabel: n.data.label,
                            label: "",
                            hidden: true,
                            updateTrigger: false,
                            content: n.data.content,
                            onButtonClick: nodeButtonOnClick
                        },
                        style: { border: '1px solid #000', padding: "5px", maxWidth: "250px" }
                    }
                });
                const nextEdges: Edge[] = nextNodes.map(n => {
                    const currPathChoice: PathChoice | undefined = nextPathChoices.find((c: PathChoice) => c.next === n.id);
                    const edgeObj = {
                        id: `${currentNode.id}-${n.id}`,
                        source: currentNode.id,
                        target: n.id,
                        label: "MISSING LABEL"
                    };
                    if (currPathChoice) {
                        return {
                            ...edgeObj,
                            label: currPathChoice.text
                        }
                    }
                    return edgeObj;
                });
                const x = nodes;
                const y = edges;
                return { nextNodes, nextEdges };
            }

        }
        return { nextNodes: [], nextEdges: [] };
    }

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
            treeGraph.setNode(node.id, { width: 250, height: 50 });
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

    // const onConnect = useCallback(
    //     (params: any) =>
    //         setEdges((eds) => addEdge({ ...params, style: { stroke: '#fff' } }, eds)),
    //     []
    // );

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
                <StorySelectorComponent onStoryChange={setStory}></StorySelectorComponent>
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
            <div style={{ width: '100vw', height: '70vh' }}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="top-right"
                    panOnScroll={true}>
                    <MiniMap pannable zoomable />
                    <Controls />
                    <Background color="#aaa" gap={16} variant={backgroundType.code as BackgroundVariant} />
                </ReactFlow>

            </div>
            <div style={{display: "flex", flexDirection: "column", maxHeight: "20vh", borderTop: "black 1px solid"}}>
                <p style={{fontSize: "1.1vw"}}>{currentStoryNode?.text}</p>
            </div>
        </div>
    );
}

export default FlowComponent;
