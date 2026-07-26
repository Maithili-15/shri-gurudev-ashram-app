import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CUSTOM_TAB_BAR_BASE_HEIGHT } from '../components/CustomTabBar'

/**
 * Reusable hook to calculate bottom padding for screens rendered inside the custom bottom tab navigator.
 * Prevents elements (like CTA buttons) from being visually overlapped by the floating tab bar.
 *
 * @param extraGap Optional extra padding gap (defaults to 24px)
 */
export function useTabBarBottomPadding(extraGap = 24): number {
  const insets = useSafeAreaInsets()
  return CUSTOM_TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 8) + extraGap
}
