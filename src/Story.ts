import { Edge, Node } from "reactflow";

export interface StoryNode {
    title: string;
    text: string;
    choices: {text: string, next: string}[];
}

export const storyIDs = [
    "first_day_at_work",
    "golden_retriever",
    "talking_sword"
]

const loadStory =  (id: string): any => {
    // Load story from file in stories folder
    const story = require(`./stories/${id}.json`);
    return story;
}

export class Story {
    public id: string;
    public story: any;
    public flowNodes: Node[] = [];
    public flowEdges: any[] = []

    constructor(id: string) {
        this.id = id;
        this.story = loadStory(id);
        this.setFlowNodes();
        this.setFlowEdges();
    }

    getStartingNode(): StoryNode {
        return this.story.start;
    }

    setFlowNodes() {
        // loop through objects in this.story and create a node for each
        // add each node to this.flowNodes
        const nodes: Node[] = [];
        for (const k in this.story) {
            let nodeType: string = "default";
            if (k === "start") {
                nodeType = "input";
            } else if (this.story[k].end) {
                nodeType = "output";
            }
            const node: Node = {
                id: k,
                type: nodeType,
                position: {x: 0, y: 0},
                data: {label: this.story[k].title}
            }
            nodes.push(node);
        }
        this.flowNodes = nodes;

    }

    setFlowEdges() {
        // loop through objects in this.story and create an edge for each
        // add each edge to this.flowEdges
        const edges: Edge[] = [];
        for (const k in this.story) {
            if (this.story[k].choices) {
                for (const choice of this.story[k].choices) {
                    const edge: Edge = {
                        id: `${k}-${choice.next}`,
                        source: k,
                        target: choice.next,
                        type: "default",
                        label: choice.text
                    }
                    edges.push(edge);
                }
            }
        }
        this.flowEdges = edges;

    }

}
