/**
  * MIT License
  *
  * Copyright (c) 2017 React Navigation Contributors

  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:

  * The above copyright notice and this permission notice shall be included in all
  * copies or substantial portions of the Software.

  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  * SOFTWARE.
*/

import {useTheme} from '@react-navigation/native';
import color from 'color';
import * as React from 'react';
import {Animated, StyleProp, StyleSheet, TextStyle} from 'react-native';

type Props = {
  /**
   * Whether the badge is visible
   */
  visible: boolean;
  /**
   * Content of the `Badge`.
   */
  children?: string | number;
  /**
   * Size of the `Badge`.
   */
  size?: number;
  /**
   * Style object for the tab bar container.
   */
  style?: Animated.WithAnimatedValue<StyleProp<TextStyle>>;
};

export default function Badge({
  children,
  style,
  visible = true,
  size = 18,
  ...rest
}: Props) {
  const [opacity] = React.useState(() => new Animated.Value(visible ? 1 : 0));
  const [rendered, setRendered] = React.useState(visible);

  const theme = useTheme();

  React.useEffect(() => {
    if (!rendered) {
      return;
    }

    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished && !visible) {
        setRendered(false);
      }
    });

    return () => opacity.stopAnimation();
  }, [opacity, rendered, visible]);

  if (!rendered) {
    if (visible) {
      setRendered(true);
    } else {
      return null;
    }
  }

  // @ts-expect-error: backgroundColor definitely exists
  const {backgroundColor = theme.colors.notification, ...restStyle} =
    StyleSheet.flatten(style) || {};
  const textColor = color(backgroundColor).isLight() ? 'black' : 'white';

  const borderRadius = size / 2;
  const fontSize = Math.floor((size * 3) / 4);

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        {
          transform: [
            {
              scale: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
          color: textColor,
          lineHeight: size - 1,
          height: size,
          minWidth: size,
          opacity,
          backgroundColor,
          fontSize,
          borderRadius,
        },
        styles.container,
        restStyle,
      ]}
      {...rest}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    textAlign: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
});