/**
 * Created by Cooper on 2022/03/28.
 */
export type Middleware = (context: any, next: () => void) => Promise<any>;

export interface ModuleOptions {
  controllers: any[];
  midddlewares: any[]; //  middlewares apply on whole module
}

export interface CreateOptions {
  service?: any;
  middlewares?: any[]; //  middlewares apply on whole app
}
