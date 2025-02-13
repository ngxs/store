import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TodoModel } from './types/todo';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly _url = 'https://jsonplaceholder.typicode.com/todos';
  private _http = inject(HttpClient);

  get(): Observable<TodoModel[]> {
    return this._http.get<TodoModel[]>(this._url);
  }

  create(todoName: string): Observable<TodoModel> {
    return this._http.post<TodoModel>(this._url, {
      title: todoName,
      completed: false
    });
  }

  updateCompleted(id: number, todo: TodoModel): Observable<TodoModel> {
    return this._http.put<TodoModel>(`${this._url}/${id}`, {
      ...todo
    });
  }
}
