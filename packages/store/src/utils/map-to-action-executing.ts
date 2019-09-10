import { Observable, merge } from 'rxjs';
import { ActionContext } from '../actions-stream';
import { mapTo } from 'rxjs/operators';
import { ActionType } from '../actions/symbols';
import { ofActionDispatched, ofActionCompleted } from '../operators/of-action';

export function mapToActionExecuting(allowedType: ActionType) {
  return (source: Observable<ActionContext>) =>
    merge(
      source.pipe(
        ofActionDispatched(allowedType),
        mapTo(true)
      ),
      source.pipe(
        ofActionCompleted(allowedType),
        mapTo(false)
      )
    );
}
