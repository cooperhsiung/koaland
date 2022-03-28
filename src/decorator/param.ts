
/**
 * Created by Cooper on 2022/03/28.
 */
import { PARAM_METADATA } from "../constant";

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
