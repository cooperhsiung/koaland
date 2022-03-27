"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Cooper on 2022/03/27.
 */
require("reflect-metadata");
const constant_1 = require("./constant");
// params options, return class decorator
exports.Module = (options) => (target) => {
    if (Array.isArray(options.controllers)) {
        const old_cs = Reflect.getMetadata(constant_1.CONTROLLER_METADATA, target) || [];
        old_cs.unshift(...options.controllers);
        Reflect.defineMetadata(constant_1.CONTROLLER_METADATA, old_cs, target);
    }
    if (Array.isArray(options.midddlewares)) {
        const old_mws = Reflect.getMetadata(constant_1.MIDDLEWARE_METADATA, target) || [];
        old_mws.unshift(...options.midddlewares);
        Reflect.defineMetadata(constant_1.MIDDLEWARE_METADATA, old_mws, target);
    }
};
exports.Controller = ({ prefix = '' }) => (target) => {
    Reflect.defineMetadata(constant_1.CONTROLLER_PREFIX, prefix, target);
};
exports.Get = (path) => (target, propertyKey, descriptor) => {
    let handler = descriptor.value;
    let stacks = Reflect.getMetadata(constant_1.PATH_ACTIONS, target) || [];
    stacks.push({ method: 'get', path, handler });
    Reflect.defineMetadata(constant_1.PATH_ACTIONS, stacks, target);
};
exports.Post = (path) => (target, propertyKey, descriptor) => {
    let handler = descriptor.value;
    let stacks = Reflect.getMetadata(constant_1.PATH_ACTIONS, target) || [];
    stacks.push({ method: 'post', path, handler });
    Reflect.defineMetadata(constant_1.PATH_ACTIONS, stacks, target);
};
exports.Put = (path) => (target, propertyKey, descriptor) => {
    let handler = descriptor.value;
    let stacks = Reflect.getMetadata(constant_1.PATH_ACTIONS, target) || [];
    stacks.push({ method: 'put', path, handler });
    Reflect.defineMetadata(constant_1.PATH_ACTIONS, stacks, target);
};
exports.Delete = (path) => (target, propertyKey, descriptor) => {
    let handler = descriptor.value;
    let stacks = Reflect.getMetadata(constant_1.PATH_ACTIONS, target) || [];
    stacks.push({ method: 'delete', path, handler });
    Reflect.defineMetadata(constant_1.PATH_ACTIONS, stacks, target);
};
exports.Rpc = (path) => (target, propertyKey, descriptor) => {
    let handler = descriptor.value;
    let stacks = Reflect.getMetadata(constant_1.RPC_ACTIONS, target) || [];
    stacks.push({ method: propertyKey, handler });
    Reflect.defineMetadata(constant_1.RPC_ACTIONS, stacks, target);
};
exports.Body = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: 'request.body',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Query = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: 'query',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Param = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: 'params',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Context = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: '',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Ctx = exports.Context;
exports.Request = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: 'request',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Req = exports.Request;
exports.Response = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: 'response',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Res = exports.Response;
exports.Headers = (key = '') => (target, propertyKey, parameterIndex) => {
    const old = Reflect.getMetadata(constant_1.PARAM_METADATA, target, propertyKey) || [];
    old.unshift({
        key: key,
        paramIndex: parameterIndex,
        from: 'request.headers',
        relValue: undefined,
    });
    // 变成了数组
    Reflect.defineMetadata(constant_1.PARAM_METADATA, old, target, propertyKey);
};
exports.Use = (middleware) => (target, propertyKey, descriptor) => {
    const middlewares = Reflect.getMetadata(constant_1.MIDDLEWARE_METADATA, target, propertyKey) || [];
    middlewares.unshift(middleware);
    Reflect.defineMetadata(constant_1.MIDDLEWARE_METADATA, middlewares, target, propertyKey);
};
// Controller,---
// Param, ---
// Body, Query --
// Get, Post, Put, Delete, ---
// Context, Ctx --
// @Request(), @Req()	req ---
// @Response(), @Res()	res ---
// Cookie todo
// Headers, ----
// Render,  todo
// Use()
// Controller, RequestMapping, RequestBody, ResponseBody, RequestParam, RequestHeader, PathVariable,
// RestController, Component Repository, Service, Autowired, Scope
// SpringApplication.run(DemoApplication.class, args);
// koatty
// Controller, BaseController, Autowired, GetMapping, RequestBody, PathVariable,
//  PostMapping, RequestMapping, RequestMethod, Valid
// routing-controller
// Controller, Param, Body, Get, Post, Put, Delete, Controller, Req, Res, QueryParam, CookieParam, Header, Render, UseBefore, Middleware
// midway
// Controller, Get, Provide, Inject , Scope, Autoload, Config, Session, Body, Query, Param, Headers, File, Redirect, GrpcMethod?,
// nestjs
// Injectable, Request,Req, Response,Res, Injectable, nestjs.InjectRepository
// @Request(), @Req()	req
// @Response(), @Res()	res
// @Next()	next
// @Session()	req.session
// @Param(param?: string)	req.params / req.params[param]
// @Body(param?: string)	req.body / req.body[param]
// @Query(param?: string)	req.query / req.query[param]
// @Headers(param?: string)	req.headers / req.headers[param]
// @Ip()	req.ip
// @HostParam()	req.hosts
// const app = await NestFactory.create<NestExpressApplication>(AppModule);
// typedi, Service, Inject
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
