import { createStore, applyMiddleware, compose } from 'redux';
import {
  forwardToMain,
  forwardToRenderer,
  replayActionMain,
  replayActionRenderer,
  triggerAlias,
  getInitialStateRenderer
} from 'electron-redux';
import createRootReducer from '../../renderer/reducers/index';

export function configureStore(initialState: any, scope: 'main' | 'renderer' = 'main'): any {
  const rootReducer = createRootReducer();
  const store = createStore(createRootReducer(), );

  if (!process.env.NODE_ENV && module.hot) {
  }

  if (scope === 'main') {
    replayActionMain(store);
  } else {
    replayActionRenderer(store);
  }

  return store;
}
