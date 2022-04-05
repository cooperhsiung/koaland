/**
 * Created by Cooper on 2022/03/29.
 */
import KoaRouter from '@koa/router';
import Koa, { Middleware } from 'koa';
import compose from 'koa-compose';
import KoaGrpc from 'koa-grpc';
import KoaThrift from 'koa-thrift';
import { MODULE_MIDDLEWARE_METADATA, MOD_INSTANCE } from './constant';
import { mapRoute } from './helper';
import { CreateOptions, Route } from './interface';

export class HttpFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<Koa> {
    const app = new Koa();
    app.use(assemble(mod, options));
    return app;
  }
}

export class ThriftFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaThrift({ service: options.service });
    app.use(assemble(mod, options));
    return app;
  }
}

export class GrpcFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaGrpc({ service: options.service });
    app.use(assemble(mod, options));
    return app;
  }
}

// middleware order: factory -> module -> controller -> route
export function assemble(mod: any, options: CreateOptions = {}): Middleware {
  const modMiddlewares = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, mod);
  const ctrlInstances = Reflect.getMetadata(MOD_INSTANCE, mod);
  const routers: Middleware[] = ctrlInstances.map((ctrlInstance: any) => mount(mapRoute(ctrlInstance)));
  return compose((options.middlewares || []).concat(modMiddlewares || []).concat(routers));
}

function mount(route: Route): KoaRouter.Middleware {
  const { prefix, middlewares, stacks } = route;
  const router = new KoaRouter({ prefix });
  router.use(...middlewares);
  for (const { method, path, handler } of stacks) {
    // mount handler in this way, router['get']('/asdasd',()=> {} )
    router[method](path, handler);
  }
  return router.routes();
}
