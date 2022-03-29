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

export type Middleware = (context: any, next: () => void) => Promise<any>;

export interface ModuleOptions {
  controllers: any[];
  midddlewares: any[]; //  middlewares apply on whole module
}

export interface CreateOptions {
  service?: any;
  middlewares?: any[]; //  middlewares apply on whole app
}

const MOD_INSTANCE = 'mod_ctrl_instances';

export const Module = (options: ModuleOptions): ClassDecorator => (target: any) => {
  if (Array.isArray(options.controllers)) {
    const old_ctrls = Reflect.getMetadata(CONTROLLER_METADATA, target) || [];
    old_ctrls.unshift(...options.controllers);

    // aoto wired, instancelize
    // 在这里装配上
    // one module, init once
    let ins = old_ctrls.map((e: any) => autoWired(e));
    console.log('========= ins', ins);

    Reflect.defineMetadata(CONTROLLER_METADATA, old_ctrls, target);

    Reflect.defineMetadata(MOD_INSTANCE, ins, target);
  }
  if (Array.isArray(options.midddlewares)) {
    const old_mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, target) || [];
    old_mws.push(...options.midddlewares);
    Reflect.defineMetadata(MODULE_MIDDLEWARE_METADATA, old_mws, target);
  }
};

// yes Injectable
export const Service = (): ClassDecorator => (target: any) => {};

type Constructor<T = any> = new (...args: any[]) => T;

export const autoWired = <T>(target: Constructor<T>): T => {
  const provides = Reflect.getMetadata('design:paramtypes', target);
  console.log(provides);
  const args = provides.map((provider: Constructor) => new provider());
  return new target(...args);
};

export const Controller = (options?: { prefix?: string }): ClassDecorator => (target: any) => {
  if (options?.prefix && !options.prefix.startsWith('/')) {
    options.prefix = '/' + options.prefix;
  }

  // const provides = Reflect.getMetadata('design:paramtypes', target);
  // console.log("========= provides",provides);
  // console.log('properties',Reflect.getMetadata('design:properties', target))
  // console.log('paramtypes',Reflect.getMetadata('design:paramtypes', target.constructor))
  // console.log('paramtypes',Reflect.getMetadata('design:paramtypes', target.constructor))
  //
  // console.log( Reflect.getMetadata('design:paramtypes', target, "constructor"))
  // // console.log(target.toString())
  // let oldFn = target.constructor;
  // target.prototype["test"] = 1

  // get  // constructor(userService)
  // Object.defineProperty(target.prototype,'constructor',{
  //   value:function (){
  //     let args = arguments;
  //     console.log("========= args",args);
  //     return new target()
  //   }
  // })

  // target.prototype.constructor = function (){
  //   let args = arguments;
  //   console.log("========= args",args);
  //   return new target()
  // }

  // target = null
  // const type1 = Reflect.getMetadata('design:type', target);
  // const type2 = Reflect.getMetadata('design:paramtypes', target);
  // const type3 = Reflect.getMetadata('design:returntype', target);
  // console.log(type1,type2,type3)

  Reflect.defineMetadata(CONTROLLER_PREFIX, options?.prefix, target.prototype);
  // design:properties
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
  const ctrlInstaces = Reflect.getMetadata(MOD_INSTANCE, mod);
  // console.log("------", ctrlInstaces)
  // console.log("---prefix",Reflect.getMetadata( HANDLER_METADATA, ctrlInstaces[0]))
  // console.log("---prefix",Reflect.getMetadata( CONTROLLER_PREFIX, ctrlInstaces[0]))

  let x = ctrlInstaces.map((ctrl: any) => {
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

  // for (const ctrlClass of controllers) {
  //
  //   let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlClass) || ''; // class
  //
  //   let router = new KoaRouter({ prefix });
  //   const mws = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, ctrlClass) || [];
  //   router.use(mws);
  //
  //   let stacks = Reflect.getMetadata(HANDLER_METADATA, ctrlClass.prototype) || []; // method
  //
  //   for (const { method, path, handler } of stacks) {
  //     // mount handler in this way, router['get']('/asdasd',()=> {} )
  //     (router as any)[method](path, async (ctx: any, next: any) => {
  //       const paramBuilders: any = Reflect.getMetadata(PARAM_METADATA, ctrlClass.prototype, handler.name) || [];
  //       ctx.body = await handler(...paramBuilders.map(({ builder }: any) => builder(ctx)));
  //       await next();
  //     });
  //   }
  //   app.use(router.routes());
  // }
}
