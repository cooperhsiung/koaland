/**
 * Created by Cooper on 2022/03/27.
 */
import 'reflect-metadata';
import {
  APP_MIDDLEWARE_METADATA,
  CONTROLLER_METADATA,
  CONTROLLER_PREFIX,
  Middleware,
  MIDDLEWARE_METADATA,
  PARAM_METADATA,
  PATH_ACTIONS,
  RPC_ACTIONS,
} from './constant';

export interface ModuleOptions {
  controllers: any[];
  midddlewares: any[];  //  middlewares apply on whole app
}

// params options, return class decorator
export const Module = (options: ModuleOptions): ClassDecorator => (target: any) => {
  if (Array.isArray(options.controllers)) {
    const old_cs = Reflect.getMetadata(CONTROLLER_METADATA, target) || [];
    old_cs.unshift(...options.controllers);
    Reflect.defineMetadata(CONTROLLER_METADATA, old_cs, target);
  }
  if (Array.isArray(options.midddlewares)) {
    const old_mws = Reflect.getMetadata(APP_MIDDLEWARE_METADATA, target) || [];
    // old_mws.unshift(...options.midddlewares);
    // console.log(old_mws)
    old_mws.push(...options.midddlewares)
    console.log(old_mws)
    Reflect.defineMetadata(APP_MIDDLEWARE_METADATA, old_mws, target);
  }
};

export const Controller = ({ prefix = '' }): ClassDecorator => (target: any) => {
  Reflect.defineMetadata(CONTROLLER_PREFIX, prefix, target);
};

const createMethodDecorator = (method: string) => (path: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(PATH_ACTIONS, target) || [];
  stacks.push({ method, path, handler });
  Reflect.defineMetadata(PATH_ACTIONS, stacks, target);
};

export const Get = createMethodDecorator('get');
export const Put = createMethodDecorator('put');
export const Post = createMethodDecorator('post');
export const Delete = createMethodDecorator('delete');

export const Method = (path?: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(RPC_ACTIONS, target) || [];
  stacks.push({ method: propertyKey, handler });
  Reflect.defineMetadata(RPC_ACTIONS, stacks, target);
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

export const Query: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx.query);
export const Body: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx.request.body);
export const Param: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx.params);
export const Context: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx);
export const Ctx = Context;
export const Request: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx.request);
export const Req = Request;
export const Response: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx.response);
export const Res = Response;
export const Headers: (key?: string) => ParameterDecorator = createParamDecorator((ctx: any) => ctx.request.headers);

export const Use = (middleware: Middleware): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  const middlewares = Reflect.getMetadata(MIDDLEWARE_METADATA, target, propertyKey) || [];
  middlewares.unshift(middleware);
  Reflect.defineMetadata(MIDDLEWARE_METADATA, middlewares, target, propertyKey);
};
