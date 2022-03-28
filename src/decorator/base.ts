/**
 * Created by Cooper on 2022/03/28.
 */

import { CONTROLLER_METADATA, CONTROLLER_PREFIX, CTRL_MIDDLEWARE_METADATA, MODULE_MIDDLEWARE_METADATA } from "../constant";
import { Middleware, ModuleOptions } from "../interface";

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
