import React, { createContext, useContext, useMemo, useState } from 'react'
import { View } from 'react-native'

type RouteEntry = {
  name: string
  params?: unknown
}

type NavigationLike = {
  navigate: (name: string, params?: unknown) => void
  goBack: () => void
  getParent: () => NavigationLike | undefined
  canGoBack: () => boolean
}

type NavigationContextValue = {
  route: RouteEntry
  navigation: NavigationLike
}

export type RouteProp<ParamList extends Record<string, any>, RouteName extends keyof ParamList = keyof ParamList> = {
  key: string
  name: RouteName
  params: ParamList[RouteName]
}

export type NavigationProp<ParamList extends Record<string, any>, RouteName extends keyof ParamList = keyof ParamList> = {
  navigate: <Target extends keyof ParamList>(name: Target, params?: ParamList[Target]) => void
  goBack: () => void
  getParent: () => NavigationProp<Record<string, any>> | undefined
  canGoBack: () => boolean
}

export const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationContainer({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function NavigationIndependentTree({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useNavigation<T = NavigationLike>() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used inside a navigation shim.')
  }

  return context.navigation as unknown as T
}

export function useRoute<T = { key: string; name: string; params?: unknown }>() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useRoute must be used inside a navigation shim.')
  }

  return {
    key: context.route.name,
    name: context.route.name,
    params: context.route.params,
  } as T
}

type ScreenDefinition = {
  name: string
  component: React.ComponentType<any>
  options?: Record<string, unknown>
}

function parseScreens(children: React.ReactNode, screenMarker: React.ComponentType<any>) {
  return React.Children.toArray(children)
    .filter((child): child is React.ReactElement<any> => React.isValidElement(child) && child.type === screenMarker)
    .map((child) => ({
      name: String(child.props.name),
      component: child.props.component as React.ComponentType<any>,
      options: child.props.options as Record<string, unknown> | undefined,
    }))
}

function createNavigationController(
  mode: 'stack' | 'tab',
  screens: ScreenDefinition[],
  parentNavigation: NavigationLike | undefined,
  setStack: React.Dispatch<React.SetStateAction<RouteEntry[]>>,
  setActiveRoute: React.Dispatch<React.SetStateAction<RouteEntry>>,
) {
  const routeNames = new Set(screens.map((screen) => screen.name))

  return {
    navigate: (name: string, params?: unknown) => {
      if (routeNames.has(name)) {
        if (mode === 'stack') {
          setStack((current) => [...current, { name, params }])
        } else {
          setActiveRoute({ name, params })
        }

        return
      }

      parentNavigation?.navigate(name, params)
    },
    goBack: () => {
      if (mode === 'stack') {
        setStack((current) => {
          if (current.length > 1) {
            return current.slice(0, -1)
          }

          parentNavigation?.goBack()
          return current
        })
        return
      }

      parentNavigation?.goBack()
    },
    getParent: () => parentNavigation,
    canGoBack: () => mode === 'stack' ? true : !!parentNavigation,
  }
}

function NavigationHost({
  mode,
  children,
  initialRouteName,
  tabBar,
  screenMarker,
}: {
  mode: 'stack' | 'tab'
  children: React.ReactNode
  initialRouteName?: string
  tabBar?: (props: any) => React.ReactElement | null
  screenMarker: React.ComponentType<any>
}) {
  const parent = useContext(NavigationContext)
  const screens = useMemo(() => parseScreens(children, screenMarker), [children, screenMarker])
  const defaultRoute = initialRouteName ?? screens[0]?.name
  const [stack, setStack] = useState<RouteEntry[]>(() => (defaultRoute ? [{ name: defaultRoute }] : []))
  const [activeRoute, setActiveRoute] = useState<RouteEntry>(() => ({ name: defaultRoute ?? '', params: undefined }))

  const currentRoute = mode === 'stack' ? stack[stack.length - 1] : activeRoute
  const activeScreen = screens.find((screen) => screen.name === currentRoute?.name) ?? screens[0]

  const navigation = useMemo(
    () => createNavigationController(mode, screens, parent?.navigation, setStack, setActiveRoute),
    [mode, screens, parent],
  )

  if (!activeScreen) {
    return null
  }

  const screenElement = React.createElement(activeScreen.component, {
    navigation,
    route: {
      key: currentRoute?.name ?? activeScreen.name,
      name: currentRoute?.name ?? activeScreen.name,
      params: currentRoute?.params,
    },
  })

  const navigationState = {
    index: Math.max(
      0,
      screens.findIndex((screen) => screen.name === (currentRoute?.name ?? activeScreen.name)),
    ),
    routes: screens.map((screen) => ({ name: screen.name })),
  }

  if (mode === 'tab') {
    return (
      <NavigationContext.Provider value={{ route: currentRoute ?? { name: activeScreen.name }, navigation }}>
        <View style={{ flex: 1 }}>
          {screenElement}
        </View>
        {tabBar ? tabBar({ state: navigationState, navigation }) : null}
      </NavigationContext.Provider>
    )
  }

  return (
    <NavigationContext.Provider value={{ route: currentRoute ?? { name: activeScreen.name }, navigation }}>
      {screenElement}
    </NavigationContext.Provider>
  )
}

export function createNativeStackNavigator<ParamList extends Record<string, any> = Record<string, any>>() {
  function Screen(_props: any) {
    return null
  }

  function Navigator(props: any) {
    return <NavigationHost mode="stack" screenMarker={Screen} {...props} />
  }

  return { Navigator, Screen }
}

export function createBottomTabNavigator<ParamList extends Record<string, any> = Record<string, any>>() {
  function Screen(_props: any) {
    return null
  }

  function Navigator(props: any) {
    return <NavigationHost mode="tab" screenMarker={Screen} {...props} />
  }

  return { Navigator, Screen }
}