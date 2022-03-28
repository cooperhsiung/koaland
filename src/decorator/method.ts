/**
 * Created by Cooper on 2022/03/28.
 */
import { PATH_ACTION } from "../constant";

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
