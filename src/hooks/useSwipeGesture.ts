import { useRef, useState } from 'react';
import { Animated } from 'react-native';

export interface SwipeGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const SWIPE_THRESHOLD = 50;

export const useSwipeGesture = (handlers: SwipeGestureHandlers) => {
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);

  const handleTouchStart = (event: any) => {
    setSwipeStartX(event.nativeEvent.locationX);
    setSwipeStartY(event.nativeEvent.locationY);
  };

  const handleTouchEnd = (event: any) => {
    const swipeEndX = event.nativeEvent.locationX;
    const swipeEndY = event.nativeEvent.locationY;

    const deltaX = swipeEndX - swipeStartX;
    const deltaY = swipeEndY - swipeStartY;

    // Horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > SWIPE_THRESHOLD && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      } else if (deltaX < -SWIPE_THRESHOLD && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
    } else {
      // Vertical swipes
      if (deltaY > SWIPE_THRESHOLD && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      } else if (deltaY < -SWIPE_THRESHOLD && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

/**
 * Hook para animações simples
 */
export const useAnimation = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = (toValue: number, duration: number = 300) => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver: false,
    }).start();
  };

  const resetAnimation = () => {
    animatedValue.setValue(initialValue);
  };

  return {
    animatedValue,
    animate,
    resetAnimation,
  };
};
