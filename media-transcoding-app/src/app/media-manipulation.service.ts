import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class MediaManipulationService {

  private _url = "http://localhost:55556/api/TestResult";
  

  constructor(
    private _http: HttpClient
  ) { }

  addTestResult(testResult): Observable<any> {
    return this._http.post<any>(this._url, testResult, httpOptions)    
  }
  //getValueTables() {
  //  return this._httpService.get('/api/ValueTable');
  //}
  //getValueTable(tableName: string): Observable<any> {
  //  return this._httpService.get(`/api/ValueTable/${tableName}`);
  //}

}
