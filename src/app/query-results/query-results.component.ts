import { Component, OnInit } from '@angular/core';
import { SolutionMappingsService } from '../services/SolutionMappingsService';
import { faAngleDoubleLeft, faAngleLeft, faAngleRight, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-query-results',
  templateUrl: './query-results.component.html',
  styleUrls: ['./query-results.component.sass']
})
export class QueryResultsComponent implements OnInit {

  private readonly PAGE_SIZE = 10

  public faAngleDoubleLeft = faAngleDoubleLeft
  public faAngleLeft = faAngleLeft
  public faAngleRight = faAngleRight
  public faAngleDoubleRight = faAngleDoubleRight

  public currentPage: number
  public collapsed: boolean

  constructor(public solutionMappings: SolutionMappingsService) { }

  ngOnInit(): void {
    this.currentPage = 0
    this.collapsed = true
  }

  public collapse(): void {
    this.collapsed = !this.collapsed
  }

  public numLastPage(): number {
    if (this.solutionMappings.results.length < this.PAGE_SIZE) {
      return 0
    } else if (this.solutionMappings.results.length % this.PAGE_SIZE === 0) {
      return (this.solutionMappings.results.length / this.PAGE_SIZE) - 1
    }
    return Math.floor(this.solutionMappings.results.length / this.PAGE_SIZE)
  }

  public firstPage(): void {
    this.currentPage = 0
  }

  public previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--
    }
  }

  public nextPage(): void {
    if (this.currentPage < this.numLastPage()) {
      this.currentPage++
    }
  }

  public lastPage(): void {
    this.currentPage = this.numLastPage()
  }

  public getVariables(): Array<string> {
    if (this.solutionMappings.results.length == 0)  {
      return []
    } else {
      return Object.keys(this.solutionMappings.results[0]).filter((variable: string) => {
        return variable != '?imprint'
      })
    }
  }

  public getMappings(solution: Object): Array<string> {
    return Object.entries(solution).filter(([variable, _]) => {
      return variable != '?imprint'
    }).map(([_, value]) => {
      return value
    })
  }

  public getCurrentPage(): Array<Object> {
    let offset: number = this.currentPage * this.PAGE_SIZE
    return this.solutionMappings.results.slice(offset, offset + this.PAGE_SIZE)
  }
}
