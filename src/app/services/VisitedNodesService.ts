import { Injectable } from "@angular/core";
import { Md5 } from 'ts-md5'
import { InlineControlTuple } from "../models/InlineControlTuple";
import { PathPatternIdentifierService } from "./PathPatternIdentifierService";

@Injectable()
export class VisitedNodesService {

    public visitedNodes: Map<string, Map<string, number>>

    constructor(private patternsIdentifier: PathPatternIdentifierService) {
        this.visitedNodes = new Map<string, Map<string, number>>()
    }

    private buildPTCIdentifier(controlTuple: InlineControlTuple): string {
        let path_pattern_id = this.patternsIdentifier.getOriginalPathPatternIdentifier(controlTuple.path_pattern_id)
        let context = controlTuple.context
        return Md5.hashStr(`${JSON.stringify(context)}${path_pattern_id}`).toString()
    }

    public mustExpand(controlTuple: InlineControlTuple): boolean {
        if (controlTuple.depth < controlTuple.max_depth) {
            return false
        } else {
            let id: string = this.buildPTCIdentifier(controlTuple)
            let depth: number = this.visitedNodes.get(id).get(controlTuple.node)
            return depth === controlTuple.depth
        }
    }

    public hasBeenVisited(controlTuple: InlineControlTuple): boolean {
        let id: string = this.buildPTCIdentifier(controlTuple)
        if (this.visitedNodes.has(id)) {
            return this.visitedNodes.get(id).has(controlTuple.node)
        } else {
            return false
        }
    }

    public markAsVisited(controlTuple: InlineControlTuple): void {
        let id: string = this.buildPTCIdentifier(controlTuple)
        if (!this.visitedNodes.has(id)) {
            this.visitedNodes.set(id, new Map<string, number>())
        }
        this.visitedNodes.get(id).set(controlTuple.node, controlTuple.depth)
    }

    public updateVisitedDepth(controlTuple: InlineControlTuple): void {
        let id: string = this.buildPTCIdentifier(controlTuple)
        let depth: number = this.visitedNodes.get(id).get(controlTuple.node)
        this.visitedNodes.get(id).set(controlTuple.node, Math.min(depth, controlTuple.depth))
    }

    public clear(): void {
        this.visitedNodes = new Map<string, Map<string, number>>()
    }
}