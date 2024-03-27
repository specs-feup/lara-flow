import FlowNode from "clava-flow/flow/node/FlowNode";
import BaseNode from "clava-flow/graph/BaseNode";
import { NodeBuilder, NodeTypeGuard } from "clava-flow/graph/Node";
import { Joinpoint } from "clava-js/api/Joinpoints.js";

namespace InstructionNode {
    export class Class<
        D extends Data = Data,
        S extends ScratchData = ScratchData,
    > extends FlowNode.Class<D, S> {}

    export class Builder
        extends FlowNode.Builder
        implements NodeBuilder<Data, ScratchData>
    {
        #instructionFlowNodeType: Type;

        constructor($jp: Joinpoint, type: Type) {
            super($jp, FlowNode.Type.INSTRUCTION);
            this.#instructionFlowNodeType = type;
        }

        buildData(data: BaseNode.Data): Data {
            return {
                ...super.buildData(data) as FlowNode.Data & { flowNodeType: FlowNode.Type.INSTRUCTION },
                instructionFlowNodeType: this.#instructionFlowNodeType,
            };
        }

        buildScratchData(scratchData: BaseNode.ScratchData): ScratchData {
            return {
                ...super.buildScratchData(scratchData),
            };
        }
    }

    export const TypeGuard: NodeTypeGuard<Data, ScratchData> = {
        isDataCompatible(data: BaseNode.Data): data is Data {
            if (!FlowNode.TypeGuard.isDataCompatible(data)) return false;
            const d = data as Data;
            if (!(d.flowNodeType !== FlowNode.Type.INSTRUCTION)) return false;
            if (!(d.instructionFlowNodeType in Type)) return false;
            return true;
        },

        isScratchDataCompatible(
            scratchData: BaseNode.ScratchData,
        ): scratchData is ScratchData {
            if (!FlowNode.TypeGuard.isScratchDataCompatible(scratchData)) return false;
            return true;
        },
    };

    export interface Data extends FlowNode.Data {
        flowNodeType: FlowNode.Type.INSTRUCTION;
        instructionFlowNodeType: Type;
    }

    export interface ScratchData extends FlowNode.ScratchData {}

    // ------------------------------------------------------------

    export enum Type {
        FUNCTION_ENTRY = "function_entry",
        FUNCTION_EXIT = "function_exit",
        SCOPE_START = "scope_start",
        SCOPE_END = "scope_end",
        STATEMENT = "statement",
        COMMENT = "comment",
    }
}

export default InstructionNode;