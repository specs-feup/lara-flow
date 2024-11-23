import ControlFlowNode from "@specs-feup/flow/flow/ControlFlowNode";
import FunctionNode from "@specs-feup/flow/flow/FunctionNode";
import BaseNode from "@specs-feup/flow/graph/BaseNode";
import Node from "@specs-feup/flow/graph/Node";

namespace ControlFlowEndNode {
    export const TAG = "__clava_flow__control_flow_end_node";
    export const VERSION = "1";

    export class Class<
        D extends Data = Data,
        S extends ScratchData = ScratchData,
    > extends ControlFlowNode.Class<D, S> {}

    export class Builder implements Node.Builder<Data, ScratchData> {
        #controlFlowNodeBuilder: ControlFlowNode.Builder;

        constructor(functionNode: FunctionNode.Class) {
            this.#controlFlowNodeBuilder = new ControlFlowNode.Builder(functionNode);
        }

        buildData(data: BaseNode.Data): Data {
            return {
                ...this.#controlFlowNodeBuilder.buildData(data),
                [TAG]: {
                    version: VERSION,
                },
            };
        }

        buildScratchData(scratchData: BaseNode.ScratchData): ScratchData {
            return {
                ...this.#controlFlowNodeBuilder.buildScratchData(scratchData),
            };
        }
    }

    export const TypeGuard = Node.TagTypeGuard<Data, ScratchData>(TAG, VERSION);

    export interface Data extends ControlFlowNode.Data {
        [TAG]: {
            version: typeof VERSION;
        };
    }

    export interface ScratchData extends ControlFlowNode.ScratchData {}
}

export default ControlFlowEndNode;