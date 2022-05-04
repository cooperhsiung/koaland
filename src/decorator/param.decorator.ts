/**
 * Created by Cooper on 2022/03/29.
 */
import { PARAM_METADATA } from '../constant';
import { Context as ContextT } from 'koa';

export const createParamDecorator = (buildFn: Function) => (key = ''): ParameterDecorator => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const params = Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
  // parameter decorator assemble order is descent
  params.unshift({ builder: (ctx: any) => (key ? buildFn(ctx)[key] : buildFn(ctx)) });
  Reflect.defineMetadata(PARAM_METADATA, params, target, propertyKey);
};

export const Query = createParamDecorator((ctx: ContextT) => ctx.query);
export const Body = createParamDecorator((ctx: ContextT) => ctx.request.body);
export const Param = createParamDecorator((ctx: ContextT) => ctx.params);
export const Context = createParamDecorator((ctx: ContextT) => ctx);
export const Request = createParamDecorator((ctx: ContextT) => ctx.request);
export const Req = createParamDecorator((ctx: ContextT) => ctx.req);
export const Response = createParamDecorator((ctx: ContextT) => ctx.response);
export const Res = createParamDecorator((ctx: ContextT) => ctx.res);
export const Headers = createParamDecorator((ctx: ContextT) => ctx.request.headers);
