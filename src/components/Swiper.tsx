import React from 'react';
import {Animated, Platform, useWindowDimensions, ViewProps} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import BottomTabBarProgressContext from '../contexts/BottomTabBarProgressContext';

const useNativeDriver = Platform.OS !== 'web';

interface SwiperProps {
  leftChildren?: React.ReactNode;
  leftProps?: ViewProps;
  rightChildren?: React.ReactNode;
  rightProps?: ViewProps;
  children: React.ReactNode;
  containerStyle?: ViewProps['style'];
}

function Swiper({
  leftChildren,
  leftProps,
  rightChildren,
  rightProps,
  children,
}: SwiperProps) {
  const {width} = useWindowDimensions();

  const {progress, setProgress} = React.useContext(BottomTabBarProgressContext);

  const openFooter = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 250,
      useNativeDriver,
    }).start();
  };

  const closeFooter = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 250,
      useNativeDriver,
    }).start();
  };

  const renderLeftAction = (
    _: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>,
  ) => {
    const w = (width * 85) / 100; // 85% of the device width

    const trans = dragX.interpolate({
      inputRange: [0, w],
      outputRange: [0, 0],
    });

    return (
      <Animated.View
        {...leftProps}
        style={[
          leftProps?.style,
          {
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            maxWidth: w,
            marginRight: 5,
            transform: [{translateX: trans}],
          },
        ]}>
        {leftChildren}
      </Animated.View>
    );
  };

  const renderRightAction = (
    _: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>,
  ) => {
    const w = (width * 85) / 100; // 85% of the device width

    const trans = dragX.interpolate({
      inputRange: [0, w],
      outputRange: [0, 0],
      // extrapolateLeft: 'clamp',
      // extrapolateRight: 'clamp',
    });

    return (
      <Animated.View
        {...rightProps}
        style={[
          rightProps?.style,
          {
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            maxWidth: w,
            marginRight: 5,
            marginLeft: 5,
            transform: [{translateX: trans}],
          },
        ]}>
        {rightChildren}
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={leftChildren ? renderLeftAction : undefined}
      renderRightActions={rightChildren ? renderRightAction : undefined}
      onSwipeableLeftWillOpen={openFooter}
      onSwipeableWillClose={closeFooter}
      overshootLeft={false}
      overshootRight={false}
      childrenContainerStyle={{flex: 1}}
      containerStyle={{flex: 1}}
      useNativeAnimations>
      {children}
    </Swipeable>
  );
}

export default Swiper;
