/**
 * Created by Cooper on 2022/03/29.
 */
import {
  CONTROLLER_PREFIX,
  CTRL_MIDDLEWARE_METADATA,
  HANDLER_METADATA,
  PARAM_METADATA,
  PROPERTY_PROVIDER,
} from './constant';
import { Constructor, Route } from './interface';

const globalClassStore: { key: string; value: any }[] = [];

export function isClass(v: any) {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

export class Container {
  static set(key: string, value: any) {
    if (globalClassStore.find((e) => e.key === key && e.value === value)) {
      return;
    }
    globalClassStore.push({ key, value });
  }
  // return autowired instance
  static get(key: string | Constructor): any {
    const ret = globalClassStore.find((e) => e.key === key || e.value === key);
    if (ret) {
      return resolve(ret.value);
    }
  }
  static has(key: string | Constructor): boolean {
    return Boolean(globalClassStore.find((e) => e.key === key || e.value === key));
  }
}

export const resolve = <T>(target: Constructor<T>): T => {
  // plain object, return straightly
  if (!isClass(target)) {
    return target as any;
  }
  const paramProviders = Reflect.getMetadata('design:paramtypes', target);
  const propertyProviders = Reflect.getMetadata(PROPERTY_PROVIDER, target.prototype) || [];
  if (!paramProviders && !propertyProviders.length) {
    return new target() as any;
  }
  const args = (paramProviders || []).map((provider: Constructor) => {
    // const token = Reflect.getMetadata(CLASS_TOKEN_METADATA, provider);
    // support Class
    if (Container.has(provider)) {
      return Container.get(provider);
    }
    return provider;
  });

  const instance = new target(...args) as any;
  propertyProviders.forEach((provider: any) => {
    if (Container.has(provider)) {
      instance[provider.propertyKey] = Container.get(provider);
    } else if (Container.has(provider.token)) {
      instance[provider.propertyKey] = Container.get(provider.token);
    }
  });
  return instance;
};

export function mapRoute(ctrlInstance: any): Route {
  const prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlInstance) || ''; // class
  const stacks = Reflect.getMetadata(HANDLER_METADATA, ctrlInstance) || []; // method
  for (const stack of stacks) {
    const processor = stack.processor;
    stack.handler = async (ctx: any, next: Function) => {
      const paramBuilders: any = Reflect.getMetadata(PARAM_METADATA, ctrlInstance, processor.name) || [];
      ctx.body = await processor.call(ctrlInstance, ...paramBuilders.map(({ builder }: any) => builder(ctx)));
      await next();
    };
  }

  const middlewares = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, ctrlInstance) || [];
  return { prefix, middlewares, stacks };
}
