import LaraFlowError from "lara-flow/error/LaraFlowError";
import FunctionNode from "lara-flow/flow/FunctionNode";
import BaseGraph from "lara-flow/graph/BaseGraph";
import BaseNode from "lara-flow/graph/BaseNode";
import Graph from "lara-flow/graph/Graph";
import { NodeCollection } from "lara-flow/graph/NodeCollection";

/**
 * A graph for building CFGs, DFGs, CDFGs, SCGs, etc.
 * 
 * This graph is language and weaver agnostic. In fact,
 * it may contain custom nodes and edges not associated
 * with any language or weaver.
 */
namespace FlowGraph {
    export const TAG = "__lara_flow__flow_graph";
    export const VERSION = "1";

    export class Class<
        D extends Data = Data,
        S extends ScratchData = ScratchData,
    > extends BaseGraph.Class<D, S> {
        /**
         * Adds a {@link FunctionNode} to the graph, updating the function map.
         *
         * @param name The name of the function. This name must be unique in the graph,
         * so it should be mangled if the use case permits overloading.
         * @param node The node to initialize as the {@link FunctionNode}. If not 
         * provided, a new node will be created.
         * @returns The {@link FunctionNode} that was added.
         * @throws {} {@link LaraFlowError} if the function name already exists in the graph.
         * This should be seen as a logic error and should not catched. Instead, ensure that
         * no existing function shares the same name by renaming or removing.
         */
        addFunction(name: string, node?: BaseNode.Class): FunctionNode.Class {
            if (this.hasFunction(name)) {
                throw new LaraFlowError(`Function ${name} already exists in the graph.`);
            }
            if (node === undefined) {
                node = this.addNode();
            }
            this.data[FlowGraph.TAG].functions.set(name, node.id);
            return node.init(new FunctionNode.Builder(name)).as(FunctionNode);
        }

        /**
         * Retrieves a {@link FunctionNode} from the graph by the name of the function.
         * 
         * If the function is not in the map, the node does not exist, or the node 
         * is not a {@link FunctionNode}, `undefined` will be returned.
         *
         * @param name The name of the function.
         * @returns The {@link FunctionNode}, or `undefined` if it does not exist.
         */
        getFunction(name: string): FunctionNode.Class | undefined {
            const id = this.data[FlowGraph.TAG].functions.get(name);
            if (id === undefined) return undefined;
            const node = this.getNodeById(id);
            if (node === undefined || !node.is(FunctionNode)) {
                return undefined;
            }
            return node.as(FunctionNode);
        }

        /**
         * Checks if the graph has a function with the given name.
         * 
         * The function must be in the map, the respective node must exist, and the node
         * must be a {@link FunctionNode} for this method to return `true`.
         *
         * @param name The name of the function.
         * @returns `true` if the graph has a function with the given name, `false` otherwise.
         */
        hasFunction(name: string): boolean {
            // Must fully get function, since the key may point to a node
            // that no longer exists
            return this.getFunction(name) !== undefined;
        }

        /**
         * Retrieves all functions in the graph.
         * 
         * The functions must be in the map, the respective nodes must exist, and the nodes
         * must be {@link FunctionNode} to be included in the collection.
         * 
         * @returns A collection of all functions in the graph.
         */
        get functions(): NodeCollection<FunctionNode.Data, FunctionNode.ScratchData, FunctionNode.Class> {
            const nodes = Array.from(this.data[FlowGraph.TAG].functions.values())
                .map(id => this.getNodeById(id))
                .filter(node => node !== undefined && node.is(FunctionNode))
                .map(node => node.as(FunctionNode));
            return this.arrayCollection(FunctionNode, nodes);
        }
    }

    export class Builder implements Graph.Builder<Data, ScratchData> {
        buildData(data: BaseGraph.Data): Data {
            return {
                ...data,
                [TAG]: {
                    version: VERSION,
                    functions: new Map(),
                },
            };
        }

        buildScratchData(scratchData: BaseGraph.ScratchData): ScratchData {
            return {
                ...scratchData,
            };
        }
    }

    export const TypeGuard = Graph.TagTypeGuard<Data, ScratchData>(TAG, VERSION);

    export interface Data extends BaseGraph.Data {
        [TAG]: {
            version: typeof VERSION;
            /**
             * Maps function name to its node id
             */
            functions: Map<string, string>;
        };
    }

    export interface ScratchData extends BaseGraph.ScratchData {}
}

export default FlowGraph;
