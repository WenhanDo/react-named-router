import { RouteProps } from 'react-router-dom'
import { LazyExoticComponent, FunctionComponent } from 'react'

export type RouteBase = RouteProps & {
  name: string // route name
  title?: string // title for display
  path: string // relative path here
  component: LazyExoticComponent<FunctionComponent<any>> // for lazy load
}
export type RouteConfig = RouteBase & { subRoutes?: RouteConfig[] }

export type RouteNode = RouteBase & {
  subRoutes?: RouteNode[]
  parentRouteName?: string
  childRouteNames?: string[]
}

export type RouteStore = {
  rootNames: string[],
  namesMap: {
    [key: string]: string,
  },
  routesMap: {
    [key: string]: Omit<RouteNode, 'subRoutes'>
  }
}
export type AddRoutesCallback = (routes: RouteStore) => void
