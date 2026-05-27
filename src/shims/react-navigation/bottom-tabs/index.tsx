export {
  createBottomTabNavigator,
  type NavigationProp as BottomTabNavigationProp,
  type NavigationProp,
  type RouteProp,
} from '../shared'

export type BottomTabBarProps = {
  state: {
    index: number
    routes: Array<{ name: string }>
  }
  navigation: {
    navigate: (name: string, params?: unknown) => void
    goBack: () => void
    getParent: () => unknown
  }
  descriptors?: Record<string, unknown>
}