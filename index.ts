/**
 * Created by Cooper on 2022/03/29.
 */
import 'reflect-metadata';

import Koa from 'koa';
import KoaThrift from 'koa-thrift';
import KoaGrpc from 'koa-grpc';
import KoaRouter from '@koa/router';

const CONTROLLER_METADATA = '__controller__';
const MODULE_MIDDLEWARE_METADATA = '__module_middleware__';
const CTRL_MIDDLEWARE_METADATA = '__controller_middleware__';
const PARAM_METADATA = '__param__';
const CONTROLLER_PREFIX = '__controller_prefix__';
const PATH_ACTION = '__path_action__';

export type Middleware = (context: any, next: () => void) => Promise<any>;

export interface ModuleOptions {
  controllers: any[];
  midddlewares: any[]; //  middlewares apply on whole module
}

export interface CreateOptions {
  service?: any;
  middlewares?: any[]; //  middlewares apply on whole app
}

export const Module = (options: ModuleOptions): ClassDecorator => (target: any) => {
  if (Array.isArray(options.controllers)) {
    const old_cs = Reflect.getMetadata(CONTROLLER_METADATA, target) || [];
    old_cs.unshift(...options.controllers);
    Reflect.defineMetadata(CONTROLLER_METADATA, old_cs, target);
  }
  if (Array.isArray(options.midddlewares)) {
    const old_mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, target) || [];
    old_mws.push(...options.midddlewares);
    Reflect.defineMetadata(MODULE_MIDDLEWARE_METADATA, old_mws, target);
  }
};

export const Controller = ({ prefix = '' }): ClassDecorator => (target: any) => {
  Reflect.defineMetadata(CONTROLLER_PREFIX, prefix, target);
};

export const Use = (middleware: Middleware): ClassDecorator => (target: any) => {
  const middlewares = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, target) || [];
  middlewares.push(middleware);
  Reflect.defineMetadata(CTRL_MIDDLEWARE_METADATA, middlewares, target);
};

const createMethodDecorator = (method: string) => (path: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(PATH_ACTION, target) || [];
  stacks.push({ method, path, handler });
  Reflect.defineMetadata(PATH_ACTION, stacks, target);
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
  const stacks = Reflect.getMetadata(PATH_ACTION, target) || [];
  stacks.push({ method: 'get', path: `/${String(propertyKey)}`, handler });
  Reflect.defineMetadata(PATH_ACTION, stacks, target);
};

const createParamDecorator = (buildFn: Function) => (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const params = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  // parameter decorator assemble order is descent
  params.unshift({
    // type,
    // index: parameterIndex,
    // key,
    builder: (ctx: any) => (key ? buildFn(ctx)[key] : buildFn(ctx)),
  });
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
    mount(app, mod, options);
    return app;
  }
}
export class ThriftFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaThrift({ service: options.service });
    mount(app, mod, options);
    return app;
  }
}

export class GrpcFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaGrpc({ service: options.service });
    mount(app, mod, options);
    return app;
  }
}

function mount(app: any, mod: any, options: CreateOptions) {
  if (Array.isArray(options.middlewares)) {
    options.middlewares.forEach((e: any) => app.use(e));
  }

  const mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, mod);
  mws.forEach((e: any) => app.use(e));
  const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);

  for (const ctrlClass of controllers) {
    let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlClass); // class
    let router = new KoaRouter();
    const mws = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, ctrlClass);
    router.use(mws);

    prefix && router.prefix(prefix);
    let stacks = Reflect.getMetadata(PATH_ACTION, ctrlClass.prototype); // method

    for (const { method, path, handler } of stacks) {
      // mount handler in this way, router['get']('/asdasd',()=> {} )
      (router as any)[method](path, async (ctx: any, next: any) => {
        const valueArr: any = Reflect.getMetadata(PARAM_METADATA, ctrlClass.prototype, handler.name);
        ctx.body = await handler(...valueArr.map(({ builder }: any) => builder(ctx)));
      });
    }
    app.use(router.routes());
  }
}
