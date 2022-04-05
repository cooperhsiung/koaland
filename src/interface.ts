/**
 * Created by Cooper on 2022/03/29.
 */
import { Middleware } from 'koa';

export type Constructor<T = any> = new (...args: any[]) => T;

export interface ModuleOptions {
  controllers: any[]; // should input at least one
  midddlewares: any[]; //  middlewares apply on whole module
}

export interface CreateOptions {
  service?: any;
  middlewares?: any[]; //  middlewares apply on whole app
}

export interface Route {
  prefix: string;
  middlewares: Middleware[];
  stacks: {
    method: 'get' | 'post' | 'put' | 'delete'; // http.method
    path: string; // url match
    handler: Middleware; // router handler
    processor: any; // origin function
  }[];
}
