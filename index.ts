/**
 * Created by Cooper on 2022/03/29.
 */
import 'reflect-metadata';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import KoaGrpc from 'koa-grpc';
import KoaThrift from 'koa-thrift';

const CONTROLLER_METADATA = '__controller__';
const MODULE_MIDDLEWARE_METADATA = '__module_middleware__';
const CTRL_MIDDLEWARE_METADATA = '__controller_middleware__';
const PARAM_METADATA = '__param__';
const CONTROLLER_PREFIX = '__controller_prefix__';
const HANDLER_METADATA = '__handler__';
const globalClassMap: any = {};
const PROPERTY_PROVIDER = '__property_provider__';
const CLASS_TOKEN = '__class_token__';

export type Middleware = (context: any, next: () => void) => Promise<any>;

export interface ModuleOptions {
  controllers: any[]; // should input at least one
  midddlewares: any[]; //  middlewares apply on whole module
}

export interface CreateOptions {
  service?: any;
  middlewares?: any[]; //  middlewares apply on whole app
}

const MOD_INSTANCE = 'mod_ctrl_instances';

export const Module = (options: ModuleOptions): ClassDecorator => (target: any) => {
  if (Array.isArray(options.controllers)) {
    // aoto wired, instancelize, one module, init once
    let ins = options.controllers.map((e: any) => autowired(e));
    Reflect.defineMetadata(MOD_INSTANCE, ins, target);
  }
  if (Array.isArray(options.midddlewares)) {
    const old_mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, target) || [];
    old_mws.push(...options.midddlewares);
    Reflect.defineMetadata(MODULE_MIDDLEWARE_METADATA, old_mws, target);
  }
};

export const Injectable = (token?: string): ClassDecorator => (target: any) => {
  globalClassMap[token || target.name] = target; // 存储构造类
  Reflect.defineMetadata(CLASS_TOKEN, token || target.name, target);
};

export const Inject = (token?: string): PropertyDecorator => (target: any, propertyKey: string | symbol) => {
  const targetType = Reflect.getMetadata('design:type', target, propertyKey);
  const propertyProviders = Reflect.getMetadata(PROPERTY_PROVIDER, target) || [];
  propertyProviders.push({
    propertyKey: propertyKey,
    token: token || propertyKey,
    Constructor: targetType,
  });
  Reflect.defineMetadata(PROPERTY_PROVIDER, propertyProviders, target);
};

type Constructor<T = any> = new (...args: any[]) => T;

export const autowired = <T>(target: Constructor<T>): T => {
  const paramProviders = Reflect.getMetadata('design:paramtypes', target);
  const propertyProviders = Reflect.getMetadata(PROPERTY_PROVIDER, target.prototype) || [];
  if (!paramProviders && !propertyProviders.length) {
    return new target() as any;
  }
  const args = (paramProviders || []).map((provider: Constructor) => {
    let token = Reflect.getMetadata(CLASS_TOKEN, provider);
    if (globalClassMap[token]) {
      return autowired(provider);
    }
    return provider;
  });

  const instance = new target(...args) as any;
  propertyProviders.forEach((provider: any) => {
    instance[provider.propertyKey] = autowired(provider.Constructor);
  });
  return instance;
};

export const Controller = (options?: { prefix?: string }): ClassDecorator => (target: any) => {
  if (options?.prefix && !options.prefix.startsWith('/')) {
    options.prefix = '/' + options.prefix;
  }
  Reflect.defineMetadata(CONTROLLER_PREFIX, options?.prefix, target.prototype);
  // globalClassMap[target.name] = target
};

export const Use = (middleware: Middleware): ClassDecorator => (target: any) => {
  const middlewares = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, target) || [];
  middlewares.push(middleware);
  Reflect.defineMetadata(CTRL_MIDDLEWARE_METADATA, middlewares, target);
};

const createMethodDecorator = (method: string) => (path?: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(HANDLER_METADATA, target) || [];
  if (path && !path.startsWith('/')) {
    path = '/' + path;
  }
  stacks.push({ method, path: path || '/', handler });
  Reflect.defineMetadata(HANDLER_METADATA, stacks, target);
};

export const Get = createMethodDecorator('get');
export const Put = createMethodDecorator('put');
export const Post = createMethodDecorator('post');
export const Delete = createMethodDecorator('delete');

export const Method = (): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  const handler = descriptor.value;
  const stacks = Reflect.getMetadata(HANDLER_METADATA, target) || [];
  stacks.push({ method: 'get', path: `/${String(propertyKey)}`, handler });
  Reflect.defineMetadata(HANDLER_METADATA, stacks, target);
};

const createParamDecorator = (buildFn: Function) => (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const params = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  // parameter decorator assemble order is descent
  params.unshift({ builder: (ctx: any) => (key ? buildFn(ctx)[key] : buildFn(ctx)) });
  Reflect.defineMetadata(PARAM_METADATA, params, target, propertyKey);
};

export const Query = createParamDecorator((ctx: any) => ctx.query);
export const Body = createParamDecorator((ctx: any) => ctx.request.body);
export const Param = createParamDecorator((ctx: any) => ctx.params);
export const Context = createParamDecorator((ctx: any) => ctx);
export const Ctx = Context;
export const Request = createParamDecorator((ctx: any) => ctx.request);
export const Req = Request;
export const Response = createParamDecorator((ctx: any) => ctx.response);
export const Res = Response;
export const Headers = createParamDecorator((ctx: any) => ctx.request.headers);

export class HttpFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new Koa();

    // use global mid, ok
    if (Array.isArray(options.middlewares)) {
      options.middlewares.forEach((e: any) => app.use(e));
    }
    const mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, mod);
    mws.forEach((e: any) => app.use(e));

    const routers = mount(app, mod, options);
    routers.forEach((e: any) => app.use(e));
    // app.use(routers)
    return app;
  }
}
export class ThriftFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaThrift({ service: options.service });

    // use global mid, ok
    if (Array.isArray(options.middlewares)) {
      options.middlewares.forEach((e: any) => app.use(e));
    }
    const mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, mod);
    mws.forEach((e: any) => app.use(e));

    const routers = mount(app, mod, options);
    routers.forEach((e: any) => app.use(e));
    // app.use(routers)
    return app;
  }
}

export class GrpcFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaGrpc({ service: options.service });

    // use global mid, ok
    if (Array.isArray(options.middlewares)) {
      options.middlewares.forEach((e: any) => app.use(e));
    }
    const mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, mod);
    mws.forEach((e: any) => app.use(e));

    const routers = mount(app, mod, options);
    routers.forEach((e: any) => app.use(e));
    // app.use(routers)

    return app;
  }
}

// 一个 app, 一组路由

function mount(app: any, mod: any, options: CreateOptions): any {
  // const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);
  const ctrlInstances = Reflect.getMetadata(MOD_INSTANCE, mod);

  let x = ctrlInstances.map((ctrl: any) => {
    let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrl) || ''; // class

    let router = new KoaRouter({ prefix });
    const mws = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, ctrl) || [];
    router.use(mws);

    let stacks = Reflect.getMetadata(HANDLER_METADATA, ctrl) || []; // method

    for (const { method, path, handler } of stacks) {
      // mount handler in this way, router['get']('/asdasd',()=> {} )
      (router as any)[method](path, async (ctx: any, next: any) => {
        const paramBuilders: any = Reflect.getMetadata(PARAM_METADATA, ctrl, handler.name) || [];
        ctx.body = await handler.call(ctrl, ...paramBuilders.map(({ builder }: any) => builder(ctx)));
        await next();
      });
    }
    return router.routes();
  });

  // console.log("========= x",x);
  return x;
}
