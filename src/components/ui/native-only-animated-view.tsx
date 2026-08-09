import * as React from 'react';
import { Platform, Pressable, View, type ViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NativeOnlyAnimatedViewProps = AnimatedProps<ViewProps> & {
  /**
   * Which element to animate. Overlays that must swallow a backdrop tap render
   * as `Pressable`; everything else is a plain `View`.
   */
  as?: 'View' | 'Pressable';
};

/**
 * Animates on native, renders a plain `View` on web.
 *
 * React Native Reusables' overlay atoms (dialog, popover, dropdown, tooltip)
 * drive enter/exit with Reanimated on native but hand the same job to CSS
 * `animate-in` classes on web. Mounting an `Animated.View` inside a web portal
 * runs both, so the two fight over opacity and the overlay flickers.
 *
 * `entering` / `exiting` are simply ignored on web — the CSS classes already on
 * the content element do the work there.
 */
/**
 * `Pressable` widens `children` and `style` to accept render callbacks, which
 * makes its animated props structurally incompatible with a plain view's. The
 * overlays here never pass a callback, so the two are interchangeable in
 * practice — narrowing the component once is cleaner than casting every prop.
 */
type OverlayView = React.ComponentType<AnimatedProps<ViewProps>>;

function NativeOnlyAnimatedView({ as = 'View', ...props }: NativeOnlyAnimatedViewProps) {
  if (Platform.OS === 'web') {
    return <View {...(props as ViewProps)} />;
  }
  const Component = (as === 'Pressable' ? AnimatedPressable : Animated.View) as OverlayView;
  return <Component {...props} />;
}

export { NativeOnlyAnimatedView };
export type { NativeOnlyAnimatedViewProps };
