import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

export function push(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name as any, params));
  }
}

export function replace(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name as any, params));
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export default {
  navigate,
  push,
  replace,
  goBack,
  navigationRef,
};
