/**
 * Created by Cooper on 2022/03/28.
 */
import KoaRouter from "@koa/router";
import Koa from "koa";
import KoaGrpc from "koa-grpc";
import KoaThrift from "koa-thrift";
import { CONTROLLER_METADATA, CONTROLLER_PREFIX, CTRL_MIDDLEWARE_METADATA, MODULE_MIDDLEWARE_METADATA, PARAM_METADATA, PATH_ACTION } from "./constant";
import { CreateOptions } from "./interface";

export class HttpFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new Koa();
    mount(app, mod, options);
    return app;
  }
}
export class ThriftFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaThrift({ service: options.service });
    mount(app, mod, options);
    return app;
  }
}

export class GrpcFactory {
  static async create(mod: any, options: CreateOptions = {}): Promise<any> {
    const app = new KoaGrpc({ service: options.service });
    mount(app, mod, options);
    return app;
  }
}

function mount(app: any, mod: any, options: CreateOptions) {
  if (Array.isArray(options.middlewares)) {
    options.middlewares.forEach((e: any) => app.use(e));
  }

  const mws = Reflect.getMetadata(MODULE_MIDDLEWARE_METADATA, mod);
  mws.forEach((e: any) => app.use(e));
  const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);

  for (const ctrlClass of controllers) {
    let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlClass); // class
    let router = new KoaRouter();
    const mws = Reflect.getMetadata(CTRL_MIDDLEWARE_METADATA, ctrlClass);
    router.use(mws);

    prefix && router.prefix(prefix);
    let stacks = Reflect.getMetadata(PATH_ACTION, ctrlClass.prototype); // method

    for (const { method, path, handler } of stacks) {
      // mount handler in this way, router['get']('/asdasd',()=> {} )
      (router as any)[method](path, async (ctx: any, next: any) => {
        const valueArr: any = Reflect.getMetadata(PARAM_METADATA, ctrlClass.prototype, handler.name);
        ctx.body = await handler(...valueArr.map(({ builder }: any) => builder(ctx)));
      });
    }
    app.use(router.routes());
  }
}

