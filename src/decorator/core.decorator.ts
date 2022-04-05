/**
 * Created by Cooper on 2022/03/29.
 */
import { Middleware } from 'koa';
import {
  CONTROLLER_PREFIX,
  CTRL_MIDDLEWARE_METADATA,
  MODULE_MIDDLEWARE_METADATA,
  MOD_INSTANCE,
  PROPERTY_PROVIDER,
} from '../constant';
import { Container, resolve } from '../helper';
import { ModuleOptions } from '../interface';

export const Module = (options: ModuleOptions): ClassDecorator => (target: any) => {
  if (Array.isArray(options.controllers)) {
    // instantize, one module, init once
    const instances = options.controllers.map(resolve);
    Reflect.defineMetadata(MOD_INSTANCE, instances, target);
  }
  if (Array.isArray(options.midddlewares)) {
    const midddlewares = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, target) || [];
    midddlewares.push(...options.midddlewares);
    Reflect.defineMetadata(MODULE_MIDDLEWARE_METADATA, midddlewares, target);
  }
};

export const Injectable = (alias?: string): ClassDecorator => (target: any) => {
  const token = alias || target.name;
  // Reflect.defineMetadata(CLASS_TOKEN_METADATA, token, target);
  Container.set(token, target);
};

export const Inject = (token?: string): PropertyDecorator => (target: any, propertyKey: string | symbol) => {
  const targetType = Reflect.getMetadata('design:type', target, propertyKey);
  const propertyProviders = Reflect.getMetadata(PROPERTY_PROVIDER, target) || [];
  propertyProviders.push({
    propertyKey: propertyKey,
    token: token || targetType.name,
    // Constructor: targetType,
  });
  Reflect.defineMetadata(PROPERTY_PROVIDER, propertyProviders, target);
};

export const Controller = (options?: { prefix?: string }): ClassDecorator => (target: any) => {
  if (options?.prefix && !options.prefix.startsWith('/')) {
    options.prefix = '/' + options.prefix;
  }
  Reflect.defineMetadata(CONTROLLER_PREFIX, options?.prefix, target.prototype);
};

// for controller
export const Use = (middleware: Middleware | Middleware[]): ClassDecorator => (target: any) => {
  middleware = Array.isArray(middleware) ? middleware : [middleware];
  const middlewares = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, target) || [];
  middlewares.push(...middleware);
  Reflect.defineMetadata(CTRL_MIDDLEWARE_METADATA, middlewares, target);
};
