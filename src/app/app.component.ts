import { Component } from '@angular/core';
import { ExpandTask } from './models/ExpandTask';
import { TaskManagerService } from './services/TaskManagerService';
import { FrontierNodesService } from './services/FrontierNodesService';
import { ServerEvalService } from './services/ServerEvalService';
import { VisitedNodesService } from './services/VisitedNodesService';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { SpyService } from './services/SpyService';
import { SolutionMappingsService } from './services/SolutionMappingsService';
import { ConfigurationService } from './services/ConfigurationService';
import { isSupportedQuery } from './utils';
import { PathPatternIdentifierService } from './services/PathPatternIdentifierService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  public running: boolean
  public modeAutoOff: boolean

  constructor(
    private httpClient: HttpClient,
    private serverEval: ServerEvalService, 
    private taskManager: TaskManagerService,
    private visitedNodes: VisitedNodesService,
    public solutionMappings: SolutionMappingsService,
    private spy: SpyService,
    public frontierNodes: FrontierNodesService,
    private configuration: ConfigurationService,
    private patternsIdentifier: PathPatternIdentifierService) { }

  ngOnInit(): void {
    this.running = false
    this.modeAutoOff = true
  }

  public readyToExecute(): boolean {
    return this.configuration.graph.length > 0
        && this.configuration.query.length > 0
        && !this.serverEval.isBusy()
  }

  public stopQuery(): void {
    this.frontierNodes.clear()
    this.serverEval.stop()
    this.running = false
  } 

  public executeQuery() {
    if (!isSupportedQuery(this.configuration.query)) {
      alert("ERROR: The query is malformed or does not correspond to a BGP query.")
      return
    }
    let url = `${AppSettings.SAGE_ENDPOINT}/backdoor/overwrite-config`
    let body = { 
      quantum: this.configuration.quantum, 
      maxDepth: this.configuration.maxDepth 
    }
    this.spy.clear()
    this.visitedNodes.clear()
    this.frontierNodes.clear()
    this.solutionMappings.clear()
    this.running = true
    this.httpClient.post(url, body).subscribe(() => {
      this.patternsIdentifier.registerOriginalQueryPathPatterns(this.configuration.query)
      let node: ExpandTask = this.taskManager.create(null, this.configuration.query, null)
      this.serverEval.execute(node, this.configuration.graph).then(() => {
        if (this.frontierNodes.queue.length == 0) {
          this.running = false
        } else if (!this.modeAutoOff) {
          this.expandFrontierNode()
        }
      }).catch((error: any) => {
        console.error(error)
        this.running = false
        alert("ERROR: An error occured during the query execution.")
      })
    }, (error: any) => {
      console.error(error)
      this.running = false
      alert("ERROR: The server is unreachable.")
    })
  }

  public expandFrontierNode() {
    let next: ExpandTask = this.frontierNodes.queue.shift()
    if (this.visitedNodes.mustExpand(next.controlTuple)) {
      this.serverEval.execute(next, this.configuration.graph).then(() => {
        if (this.frontierNodes.queue.length == 0) {
          this.running = false
        } else if (!this.modeAutoOff) {
          this.expandFrontierNode()
        }
      }).catch((error: any) => {
        console.error(error)
        this.running = false
        alert("ERROR: An error occured during the query execution.")
      })
    }
  }
}
