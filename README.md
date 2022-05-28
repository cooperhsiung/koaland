# koaland

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

<p align="center"><img src="logo.png" width="480"/></p>

:rocket: A progressive, minimalist framework for building microservices on top of Koa & TypeScript.

## Features

- :globe_with_meridians: Protocol agnostic, `write once, run anywhere`, includes http,thrift,grpc..

- :jigsaw: Idiomatic and composable decorators, comes with automatic dependency injections.

- :tropical_fish: Extremely fast, [high performance](https://github.com/cooperhsiung/rpc-server-benchmark) near koa with few dependencies.

## Index

- [Installation](#Installation)
- [Usage](#Usage)
  - [Simple app](#Simple-app)
  - [Receive request parameters](#Receive-request-parameters)
  - [Reusable app modules](#Reusable-app-modules)
  - [Dependency injections](#Dependency-injections)
- [Generate code](#Generate-code)
- [Examples](#Examples)

## Installation

```bash
npm i koaland -S
```

## Usage

### Simple app

1. Create a file UserController.ts

```typescript
import { Controller, Param, Body, Get, Post, Put, Delete } from 'koaland';

@Controller({ prefix: '/users' })
export class UserController {
  @Get()
  getAll() {
    return 'This action returns all users';
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return 'This action returns user #' + id;
  }

  @Post()
  post(@Body() user: User) {
    return 'Saving user...';
  }

  @Put('/:id')
  put(@Param('id') id: string, @Body() user: User) {
    return 'Updating a user...';
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return 'Removing user...';
  }
}
```

2. Create a file app.ts

```typescript
@Module({
  controllers: [UserController],
  midddlewares: [],
})
class AppModule {}

async function bootstrap() {
  const app = await HttpFactory.create(AppModule);
  await app.listen(3000);
  console.log('listening on 3000...');
}
bootstrap();
```

3. (optional) Integrate with your existing app

```typescript
import { mapRoute, assemble } from 'koaland';
const app = new Koa();
const routes = mapRoute(UserController);
// use route
app.use(routes);

// or reuse app module
const engine = assemble(AppModule);
app.use(engine);
```

### Receive request parameters

- `@Query`: get url query parameters
- `@Param`: get url path variables
- `@Body`: get request body
- `@Request`: get request object
- `@Response`: get response object
- `@Context`: get context object
- `@Headers`: get headers object
- `@Req`: get IncomingMessage
- `@Res`: get ServerResponse

```typescript
import { Controller, Param, Body, Get, Post, Put, Delete } from 'koaland';

@Controller()
export class UserController {
  @Get('/users')
  getAll() {
    return userRepository.findAll();
  }

  @Get('/users/:id')
  getOne(@Param('id') id: string) {
    return userRepository.findById(id);
  }

  @Post('/users')
  post(@Body() user: User) {
    return userRepository.insert(user);
  }

  @Put('/users/:id')
  put(@Param('id') id: string, @Body() user: User) {
    return userRepository.updateById(id, user);
  }

  @Delete('/users/:id')
  remove(@Param('id') id: string) {
    return userRepository.removeById(id);
  }
}
```

### Reusable app modules

Practice of the slogan `write once, run anywhere`

```typescript
@Use(testMiddleware2)
@Controller({})
class UserController {
  @Get('/test')
  hello(@Query('as') as: string) {
    console.log('arguments:', arguments);
    return 'hello world';
  }

  // ctx.params.id
  @Get('/test/:id')
  hello2(
    @Query('as') as: string,
    @Query() qqqq: any,
    @Param('id') uid: string,
    @Context() ctx: any,
    @Request() req: any,
    @Req() rawReq: IncomingMessage,
    @Response() res: any
  ) {
    console.log('arguments:', arguments);
    return 'hello world';
  }

  @Post('/test/:id')
  hello3(
    @Query('as') as: string,
    @Query() qqqq: any,
    @Param('id') uid: string,
    @Context() ctx: any,
    @Request() req: any,
    @Response() res: any,
    @Body() body: any,
    @Headers() headers: any,
    @Headers('user-agent') userAgent: any
  ) {
    return 'hello world';
  }

  // route for thrift or grpc
  @Method()
  Publish(@Request() req: any) {
    console.log('req:', req);
    return { code: 0, message: 'publish success' };
  }

  // route for thrift or grpc
  @Method()
  sayHello(@Context() ctx: any) {
    console.log('ctx.request: ', (ctx.request as any).getName());
    var reply = new messages.HelloReply();
    reply.setMessage('Hello ' + ctx.call.request.getName());
    return reply;
  }
}

@Module({
  controllers: [UserController],
  midddlewares: [costMiddleware, testMiddleware],
})
class AppModule {}

// middleware order: factory -> module -> controller -> route
async function bootstrap() {
  const app = await HttpFactory.create(AppModule, { middlewares: [bodyParser()] });
  app.use((ctx: any, next: any) => {
    console.log(1);
    next();
  });
  await app.listen(3000);
  console.log('listening on 3000...');

  const app2 = await ThriftFactory.create(AppModule, { service: UnpkgService });
  app2.use((ctx: any, next: any) => {
    console.log(2);
    next();
  });

  await app2.listen(3001);
  console.log('listening on 3001...');

  const app3 = await GrpcFactory.create(AppModule, { service: GreeterService });
  app3.use((ctx: any, next: any) => {
    console.log(3);
    next();
  });

  await app3.listen('0.0.0.0:3002');
  console.log('listening on 3002...');
}
bootstrap();
```

### Dependency injections

Comes with automatic dependency injections.

```typescript
@Injectable()
class Test2Service {
  sayHello() {
    return 1;
  }
}

@Injectable()
class TestService {
  constructor(public readonly test2Service: Test2Service) {}

  sayHello() {
    console.log('test');
    return 'test';
  }
}

Container.set('token.demo3', { hello: 'world' });

interface TestType {}

@Injectable()
class UserService {
  @Inject() public testService: TestService;
  @Inject('token.demo3') public test2: TestType;
  constructor(private test2Service: Test2Service) {}
  sayYes() {
    return 'yes';
  }
}

@Controller()
class UserController {
  @Inject() public userService: UserService;
  constructor() {}

  @Get('/users/:id')
  getOne(@Query('as') as: string) {
    console.log(this, '-----', this.userService.test2);
    console.log(this.userService.testService.test2Service.sayHello());
    console.log('arguments:', arguments);
    return 'hello world';
  }
}

async function bootstrap() {
  const app = await HttpFactory.create(AppModule, { middlewares: [bodyParser()] });
  await app.listen(3000);
  console.log('listening on 3000...');
}
bootstrap();

let srv = Container.get(UserService);
console.log('========= srv', srv);
```

## Generate code

content about thrift and grpc application.

### thrift

install thrift binary on macOS with [brew](https://formulae.brew.sh/formula/thrift)

to generate code

```sh
cd ./examples
thrift -version  # Thrift version 0.13.0
mkdir -p ./gen_thrift
thrift -r --out ./gen_thrift --gen js:node unpkg.thrift
```

[Thrift Missing Guide](https://diwakergupta.github.io/thrift-missing-guide)

[more node.js examples from official](https://github.com/apache/thrift/tree/master/lib/nodejs)

### grpc

This is the static code generation variant of the Node examples. Code in these examples is pre-generated using protoc and the Node gRPC protoc plugin, and the generated code can be found in various `*_pb.js` files. The command line sequence for generating those files is as follows (assuming that `protoc` and `grpc_node_plugin` are present, and starting in the directory which contains this README.md file):

```sh
npm install -g grpc-tools
cd ./examples
mkdir -p ./gen_gprc
grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./gen_gprc --grpc_out=grpc_js:./gen_gprc helloworld.proto
```

[more node.js examples from official](https://github.com/grpc/grpc/tree/master/examples/node)

## Examples

examples with client are listed at [examples](https://github.com/cooperhsiung/koaland/tree/master/examples)

looking for a complete project [koaland-boilerplate](https://github.com/cooperhsiung/koaland-boilerplate)

## Others

## License

MIT

[npm-image]: https://img.shields.io/npm/v/koaland.svg
[npm-url]: https://www.npmjs.com/package/koaland
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
