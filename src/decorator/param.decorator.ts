/**
 * Created by Cooper on 2022/03/29.
 */
import { PARAM_METADATA } from '../constant';

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
