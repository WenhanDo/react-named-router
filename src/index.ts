import { useState, lazy, useEffect } from 'react'
import { omit } from 'lodash'
import { RouteConfig, RouteNode, RouteStore, AddRoutesCallback } from './types'

// NOTICE: for unit test ONLY
export const _routesStore: RouteStore = {
  rootNames: ['404'],
  namesMap: {
    '404': '404',
  },
  routesMap: {
    '/404': {
      name: '404',
      path: '/404',
      component: lazy(() => import('./components/NotFound').then(m => ({
        default: m.NotFound,
      }))),
    },
  }
}

export const pattern = new RegExp(':[^/]+', 'g')
export const formatPath = (path: string) => path.replace(pattern, ':')

const _storeRouteNode = (route: RouteStore['routesMap'][string]) => {
  const oldPath = _routesStore.namesMap[route.name]
  const formattedPath = formatPath(route.path)
  const { namesMap, routesMap } = _routesStore
  Object.assign(_routesStore, {
    namesMap: {
      ...namesMap,
      [route.name]: formattedPath 
    },
    routesMap: {
      ...oldPath ? omit(routesMap, oldPath) : routesMap,
      formattedPath: route,
    },
  })
}

export const addRoute = (
  route: RouteConfig,
  parentNode?: { name: string, path: string },
) => {
  const fullPath = `${parentNode?.path || ''}/${route.path}`
  const { subRoutes, ...otherConfig } = route
  const converted = {
    ...otherConfig,
    path: fullPath,
    exact: !route.subRoutes,
    parentRouteName: parentNode?.name,
    childRouteNames: subRoutes?.map(({ name }) => name),
  }
  _storeRouteNode(converted)

  subRoutes?.forEach(subRoute => addRoute(subRoute, converted))
}

export const addRoutes = (newRoutes: RouteConfig[] | AddRoutesCallback) => {
  if (Array.isArray(newRoutes)) {
    newRoutes.forEach(newRoute => {
      addRoute(newRoute)
    })
  } else {
    newRoutes(_routesStore)
  }
}

export const getRouteByNames = (names: string[]) => names.map(getRouteByName)

export const getRouteByName = (name: string): RouteNode => {
  const path = _routesStore.namesMap[name]
  const routeNode = _routesStore.routesMap[path]
  const { childRouteNames } = routeNode
  return {
    ...routeNode,
    subRoutes: childRouteNames && getRouteByNames(childRouteNames),
  }
}

export const getRootRoutes = (): RouteNode[] => {
  return getRouteByNames(_routesStore.rootNames)
}

const _visitNames2Delete = (
  names: string[],
  deletingRootNames: string[],
  deletingNames: string[],
  deletingPaths: string[],
) => names.map(name => _visitName2Delete(
  name, deletingRootNames, deletingNames, deletingPaths
))

const _visitName2Delete = (
  name: string,
  deletingRootNames: string[],
  deletingNames: string[],
  deletingPaths: string[],
) => {
  deletingNames.push(name)
  const path = _routesStore.namesMap[name]
  deletingPaths.push(path)
  const { childRouteNames, parentRouteName } = _routesStore.routesMap[path]
  if (!parentRouteName) {
    deletingRootNames.push(name)
  }
  if (childRouteNames) {
    _visitNames2Delete(childRouteNames, deletingRootNames, deletingNames, deletingPaths)
  }
}

export const deleteRouteByNames = (names: string[]) => {
  if (!names.length) {
    return
  }
  const deletingRootNames: string[] = []
  const deletingNames: string[] = []
  const deletingPaths: string[] = []
  _visitNames2Delete(names, deletingRootNames, deletingNames, deletingPaths)
  const { rootNames, namesMap, routesMap } = _routesStore
  // 保证所有节点树同时删除
  Object.assign(_routesStore, {
    rootNames: deletingRootNames.length ? rootNames.filter(name => !deletingRootNames.includes(name)) : rootNames,
    namesMap: omit(namesMap, deletingNames),
    routesMap: omit(routesMap, deletingPaths),
  })
}

export const useRoute = (
  name: string,
): RouteNode => {
  const [route, setRoute] = useState<RouteNode>(getRouteByName(name))
  const path = _routesStore.namesMap[name]
  const stored = _routesStore.routesMap[path]
  useEffect(() => {
    setRoute(getRouteByName(name))
  }, [stored])
  return route
}
