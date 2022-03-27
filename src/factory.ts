import 'reflect-metadata';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import KoaThrift from 'koa-thrift';
import KoaGrpc from 'koa-grpc';
import {
  APP_MIDDLEWARE_METADATA,
  CONTROLLER_METADATA,
  CONTROLLER_PREFIX,
  PARAM_METADATA,
  PATH_ACTIONS,
  RPC_ACTIONS,
} from './constant';
const bodyParser = require('koa-bodyparser');

// useContext
export class HttpFactory {
  static async create(mod: any): Promise<any> {
    const app = new Koa();
    app.use(bodyParser());
    const mws = Reflect.getMetadata(APP_MIDDLEWARE_METADATA, mod);
    mws.forEach((e: any) => app.use(e));
    // const controllers: any[] = [];
    // console.log(Reflect.getMetadata(CONTROLLER_METADATA, mod),"====")
    const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);

    for (const ctrlClass of controllers) {
      // console.log(ctrlClass);
      let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlClass); // class
      let router = new KoaRouter();
      prefix && router.prefix(prefix);

      let stacks = Reflect.getMetadata(PATH_ACTIONS, ctrlClass.prototype); // method
      // console.log("------",stacks)

      for (const { method, path, handler } of stacks) {
        // mount handler in this way, router['get']('/asdasd',()=> {} )
        (router as any)[method](path, async (ctx: any, next: any) => {
          const valueArr: any = Reflect.getMetadata(PARAM_METADATA, ctrlClass.prototype, handler.name);
          // console.log('========= valueArr', valueArr);
          ctx.body = await handler(...valueArr.map(({ builder }: any) => builder(ctx)));
        });
      }
      // console.log(require('util').inspect(router, false, null));
      app.use(router.routes());
    }

    return app;
  }
}

export class ThriftFactory {
  static async create(mod: any, options: any): Promise<any> {
    const app = new KoaThrift({ service: options.service });
    const mws = Reflect.getMetadata(APP_MIDDLEWARE_METADATA, mod);
    mws.forEach((e: any) => app.use(e));

    const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);
    for (const ctrlClass of controllers) {
      let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlClass); // class
      let router = new KoaRouter();
      prefix && router.prefix(prefix);
      let stacks = Reflect.getMetadata(RPC_ACTIONS, ctrlClass.prototype);
      // console.log(stacks, '-----');
      if (!stacks || !stacks.length) {
        throw new Error('please wrap handler with @Method() ');
      }
      for (const { method, handler } of stacks) {
        console.log(method, '======');
        router.get(`/${method}`, async (ctx: any, next: any) => {
          const valueArr: any = Reflect.getMetadata(PARAM_METADATA, ctrlClass.prototype, handler.name);
          ctx.body = await handler(...valueArr.map(({ builder }: any) => builder(ctx)));
        });
      }

      app.use(router.routes());
    }

    return app;
  }
}

export class GrpcFactory {
  static async create(mod: any, options: any): Promise<any> {
    const app = new KoaGrpc({ service: options.service });

    const mws = Reflect.getMetadata(APP_MIDDLEWARE_METADATA, mod);
    mws.forEach((e: any) => app.use(e));

    const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);
    for (const ctrlClass of controllers) {
      let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, ctrlClass); // class
      let router = new KoaRouter();
      prefix && router.prefix(prefix);
      let stacks = Reflect.getMetadata(RPC_ACTIONS, ctrlClass.prototype);
      // console.log(stacks, '-----');
      if (!stacks || !stacks.length) {
        throw new Error('please wrap handler with @Method() ');
      }
      for (const { method, handler } of stacks) {
        console.log(method, '======');
        router.get(`/${method}`, async (ctx: any, next: any) => {
          const valueArr: any = Reflect.getMetadata(PARAM_METADATA, ctrlClass.prototype, handler.name);
          ctx.body = await handler(...valueArr.map(({ builder }: any) => builder(ctx)));
        });
      }

      app.use(router.routes());
    }

    return app;
  }
}
