import {assertHandler} from '../utility/assert.js';

export class Problem {
  constructor({initialState, goalState, isGoal, actions, result, actionCost}) {
    assertHandler('isGoal', isGoal);
    assertHandler('actions', isGoal);
    assertHandler('result', isGoal);
    assertHandler('actionCost', isGoal);

    this.initialState = initialState;
    this.goalState = goalState;
    this._isGoal = isGoal;
    this._actions = actions;
    this._result = result;
    this._actionCost = actionCost;
  }

  setInitialState(state) {
    this.initialState = state;
  }

  setGoalState(state) {
    this.goalState = state;
  }

  isGoal(state) {
    return this._isGoal(state);
  }

  actions(state) {
    return this._actions(state);
  }

  result(state, action) {
    return this._result(state, action);
  }

  actionCost(state, action, resultState) {
    return this._actionCost(state, action, resultState);
  }
}
