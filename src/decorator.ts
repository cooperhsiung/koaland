/**
 * Created by Cooper on 2022/03/27.
 */
import 'reflect-metadata';
import { CONTROLLER_METADATA, CONTROLLER_PREFIX, Middleware, MIDDLEWARE_METADATA, PARAM_METADATA, PATH_ACTIONS, RPC_ACTIONS } from './constant';

export interface ModuleOptions {
  controllers: any[];
  midddlewares: any[];
}

// params options, return class decorator
export const Module = (options: ModuleOptions): ClassDecorator => (target: any) => {
  if (Array.isArray(options.controllers)) {
    const old_cs = Reflect.getMetadata(CONTROLLER_METADATA, target) || [];
    old_cs.unshift(...options.controllers);
    Reflect.defineMetadata(CONTROLLER_METADATA, old_cs, target);
  }
  if (Array.isArray(options.midddlewares)) {
    const old_mws = Reflect.getMetadata(MIDDLEWARE_METADATA, target) || [];
    old_mws.unshift(...options.midddlewares);
    Reflect.defineMetadata(MIDDLEWARE_METADATA, old_mws, target);
  }
};

export const Controller = ({ prefix = '' }): ClassDecorator => (target: any) => {
  Reflect.defineMetadata(CONTROLLER_PREFIX, prefix, target);
};

export const Get = (path: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(PATH_ACTIONS, target) || [];
  stacks.push({ method: 'get', path, handler });
  Reflect.defineMetadata(PATH_ACTIONS, stacks, target);
};

export const Post = (path: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(PATH_ACTIONS, target) || [];
  stacks.push({ method: 'post', path, handler });
  Reflect.defineMetadata(PATH_ACTIONS, stacks, target);
};

export const Put = (path: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(PATH_ACTIONS, target) || [];
  stacks.push({ method: 'put', path, handler });
  Reflect.defineMetadata(PATH_ACTIONS, stacks, target);
};

export const Delete = (path: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(PATH_ACTIONS, target) || [];
  stacks.push({ method: 'delete', path, handler });
  Reflect.defineMetadata(PATH_ACTIONS, stacks, target);
};

export const Rpc = (path?: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => {
  let handler = descriptor.value;
  let stacks = Reflect.getMetadata(RPC_ACTIONS, target) || [];
  stacks.push({ method: propertyKey, handler });
  Reflect.defineMetadata(RPC_ACTIONS, stacks, target);
};

export const Body = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: 'request.body',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};

export const Query = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: 'query',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};

export const Param = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: 'params',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};

export const Context = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: '',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};
export const Ctx = Context;

export const Request = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: 'request',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};
export const Req = Request;

export const Response = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: 'response',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};
export const Res = Response;

export const Headers = (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const old = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  old.unshift({
    key: key,
    paramIndex: parameterIndex,
    from: 'request.headers',
    relValue: undefined,
  });
  // 变成了数组
  Reflect.defineMetadata(PARAM_METADATA, old, target, propertyKey);
};

export const Use = (middleware: Middleware): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => {
  const middlewares = Reflect.getMetadata(MIDDLEWARE_METADATA, target, propertyKey) || [];
  middlewares.unshift(middleware);
  Reflect.defineMetadata(MIDDLEWARE_METADATA, middlewares, target, propertyKey);
};

// Controller,---
// Param, ---
// Body, Query --
// Get, Post, Put, Delete, ---
// Context, Ctx --
// @Request(), @Req()	req ---
// @Response(), @Res()	res ---
// Cookie todo
// Headers, ----
// Render,  todo
// Use()

// Controller, RequestMapping, RequestBody, ResponseBody, RequestParam, RequestHeader, PathVariable,
// RestController, Component Repository, Service, Autowired, Scope
// SpringApplication.run(DemoApplication.class, args);

// koatty
// Controller, BaseController, Autowired, GetMapping, RequestBody, PathVariable,
//  PostMapping, RequestMapping, RequestMethod, Valid

// routing-controller
// Controller, Param, Body, Get, Post, Put, Delete, Controller, Req, Res, QueryParam, CookieParam, Header, Render, UseBefore, Middleware

// midway
// Controller, Get, Provide, Inject , Scope, Autoload, Config, Session, Body, Query, Param, Headers, File, Redirect, GrpcMethod?,

// nestjs
// Injectable, Request,Req, Response,Res, Injectable, nestjs.InjectRepository
// @Request(), @Req()	req
// @Response(), @Res()	res
// @Next()	next
// @Session()	req.session
// @Param(param?: string)	req.params / req.params[param]
// @Body(param?: string)	req.body / req.body[param]
// @Query(param?: string)	req.query / req.query[param]
// @Headers(param?: string)	req.headers / req.headers[param]
// @Ip()	req.ip
// @HostParam()	req.hosts
// const app = await NestFactory.create<NestExpressApplication>(AppModule);

// typedi, Service, Inject

function get(obj: any, path: string) {
  if (!path) {
    return obj;
  }
  const arr = path.split('.');
  let result = obj;
  while (arr.length) {
    var x = arr.shift();
    if (x === undefined || result === undefined) {
      return;
    }
    result = result[x];
  }
  return result;
}
