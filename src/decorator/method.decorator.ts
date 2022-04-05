/**
 * Created by Cooper on 2022/03/29.
 */
import { HANDLER_METADATA } from '../constant';

export const createMethodDecorator = (method: string) => (path?: string): MethodDecorator => (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  const processor = descriptor.value;
  const stacks = Reflect.getMetadata(HANDLER_METADATA, target) || [];
  if (path && !path.startsWith('/')) {
    path = '/' + path;
  }
  stacks.push({ method, path: path || '/', processor });
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
  const processor = descriptor.value;
  const stacks = Reflect.getMetadata(HANDLER_METADATA, target) || [];
  stacks.push({ method: 'get', path: `/${String(propertyKey)}`, processor });
  Reflect.defineMetadata(HANDLER_METADATA, stacks, target);
};
