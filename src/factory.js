"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const router_1 = __importDefault(require("@koa/router"));
const koa_1 = __importDefault(require("koa"));
const koa_thrift_1 = __importDefault(require("koa-thrift"));
const constant_1 = require("./constant");
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
// useContext
class HttpFactory {
    static async create(mod) {
        const app = new koa_1.default();
        app.use(bodyParser());
        // const controllers: any[] = [];
        // console.log(Reflect.getMetadata(CONTROLLER_METADATA, mod),"====")
        const controllers = Reflect.getMetadata(constant_1.CONTROLLER_METADATA, mod);
        for (const IController of controllers) {
            console.log(IController);
            let prefix = Reflect.getMetadata(constant_1.CONTROLLER_PREFIX, IController); // ?
            console.log('========= prefix', prefix);
            let router = new router_1.default();
            prefix && router.prefix(prefix);
            let stacks = Reflect.getMetadata(constant_1.PATH_ACTIONS, IController.prototype); // ?
            for (const { method, path, handler } of stacks) {
                // router['get']('/asdasd',()=> {} )
                router[method](path, async (ctx) => {
                    console.log(ctx);
                    const valueArr = Reflect.getMetadata(constant_1.PARAM_METADATA, IController.prototype, handler.name);
                    // 组装
                    for (const e of valueArr) {
                        const source = e.from ? get(ctx, e.from) : ctx;
                        if (e.key) {
                            console.log(e.key, '---');
                            e.relValue = get(source, e.key);
                            console.log(e.relValue, '---');
                        }
                        else {
                            e.relValue = source || {};
                        }
                    }
                    let allPams = valueArr.sort((a, b) => a.paramIndex - b.paramIndex);
                    // console.log(allPams);
                    ctx.body = await handler(...allPams.map((e) => e.relValue));
                });
            }
            // console.log(require('util').inspect(router, false, null));
            app.use(router.routes());
        }
        return app;
    }
}
exports.HttpFactory = HttpFactory;
class ThriftFactory {
    static async create(mod, options) {
        const app = new koa_thrift_1.default({ service: options.service });
        const controllers = Reflect.getMetadata(constant_1.CONTROLLER_METADATA, mod);
        for (const IController of controllers) {
            let stacks = Reflect.getMetadata(constant_1.RPC_ACTIONS, IController.prototype); // ?
            console.log(stacks, '-----');
            for (const { method, handler } of stacks) {
                app.use(mount(`/${method}`, async (ctx, next) => {
                    ctx.body = await handler();
                }));
            }
        }
        return app;
    }
}
exports.ThriftFactory = ThriftFactory;
class GrpcFactory {
    static async create(mod) { }
}
exports.GrpcFactory = GrpcFactory;
function get(obj, path) {
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
