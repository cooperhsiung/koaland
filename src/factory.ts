import 'reflect-metadata';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import KoaThrift from 'koa-thrift';
import { CONTROLLER_METADATA, CONTROLLER_PREFIX, PARAM_METADATA, PATH_ACTIONS, RPC_ACTIONS } from './constant';
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');

// useContext
export class HttpFactory {
  static async create(mod: any): Promise<any> {
    const app = new Koa();
    app.use(bodyParser());

    // const controllers: any[] = [];
    // console.log(Reflect.getMetadata(CONTROLLER_METADATA, mod),"====")
    const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);

    for (const IController of controllers) {
      console.log(IController);
      let prefix = Reflect.getMetadata(CONTROLLER_PREFIX, IController); // ?
      console.log('========= prefix', prefix);
      let router = new KoaRouter();
      prefix && router.prefix(prefix);
      let stacks = Reflect.getMetadata(PATH_ACTIONS, IController.prototype); // ?

      for (const { method, path, handler } of stacks) {
        // router['get']('/asdasd',()=> {} )
        (router as any)[method](path, async (ctx: any) => {
          console.log(ctx);

          const valueArr: any = Reflect.getMetadata(PARAM_METADATA, IController.prototype, handler.name);
          // 组装
          for (const e of valueArr) {
            const source = e.from ? get(ctx, e.from) : ctx;
            if (e.key) {
              console.log(e.key, '---');
              e.relValue = get(source, e.key);

              console.log(e.relValue, '---');
            } else {
              e.relValue = source || {};
            }
          }
          let allPams = valueArr.sort(
            (a: { paramIndex: number }, b: { paramIndex: number }) => a.paramIndex - b.paramIndex,
          );
          // console.log(allPams);
          ctx.body = await handler(...allPams.map((e: any) => e.relValue));
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
    const controllers = Reflect.getMetadata(CONTROLLER_METADATA, mod);
    for (const IController of controllers) {
      let stacks = Reflect.getMetadata(RPC_ACTIONS, IController.prototype); // ?
      console.log(stacks, '-----');
      for (const { method, handler } of stacks) {
        app.use(
          mount(`/${method}`, async (ctx: any, next: any) => {
            ctx.body = await handler();
          }),
        );
      }
    }

    return app;
  }
}

export class GrpcFactory {
  static async create(mod: any): Promise<any> {}
}

function get(obj: any, path: string) {
  if (!path) {
    return obj;
  }
  const arr = path.split('.');
  let result = obj;
  while (arr.length) {
    var x = arr.shift();
    if (x === undefined || result === undefined) {
      return;
    }
    result = result[x];
  }
  return result;
}
