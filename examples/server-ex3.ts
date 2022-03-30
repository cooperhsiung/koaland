/**
 * Created by Cooper on 2022/03/27.
 */
import 'reflect-metadata';
import {
  Body,
  Context,
  Controller,
  Get,
  GrpcFactory,
  Headers,
  HttpFactory,
  Inject,
  Injectable,
  Method,
  Module,
  Param,
  Post,
  Query,
  Req,
  Request,
  Response,
  ThriftFactory,
  Use,
  Container,
} from '../src';

var UnpkgService = require('./gen_thrift/UnpkgService');
var { GreeterService } = require('./gen_gprc/helloworld_grpc_pb');
var messages = require('./gen_gprc/helloworld_pb');

const bodyParser = require('koa-bodyparser');

const costMiddleware = async (ctx: any, next: any) => {
  // console.log('middle1')
  const start = Date.now();
  await next();
  console.log(`process ${ctx.path} request from ${ctx.ip} cost ${Date.now() - start}ms`);
};

const testMiddleware = async (ctx: any, next: any) => {
  // console.log('middle2')
  const start = Date.now();
  await next();
  console.log(`process ${ctx.path} request from ${ctx.ip} cost ${Date.now() - start}ms`);
};

const testMiddleware2 = async (ctx: any, next: any) => {
  // console.log('middle3')
  const start = Date.now();
  await next();
  console.log(`process222 ${ctx.path} request from ${ctx.ip} cost ${Date.now() - start}ms`);
};

// @Injectable()
// class Test3Service {
//
//   sayHello(){
//     console.log("test")
//   }
//
// }

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
  // constructor(private test2Service: Test2Service) {
  //
  // }
  sayYes() {
    return 'yes';
  }
}

@Use(testMiddleware2)
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

  // ctx.params.id
  @Get('/test/:id')
  getTest(
    @Query('as') as: string,
    @Query() qqqq: any,
    @Param('id') uid: string,
    @Context() ctx: any,
    @Request() req: any,
    @Req() req2: any,
    @Response() res: any
  ) {
    // console.log('arguments:', arguments);
    return 'hello world';
  }

  @Post('/test/:id')
  updateOne(
    @Query('as') as: string,
    @Query() qqqq: string,
    @Param('id') uid: string,
    @Context() ctx: any,
    @Request() req: any,
    @Response() res: any,
    @Body() body: any,
    @Headers() headers: any,
    @Headers('user-agent') userAgent: string
  ) {
    console.log('arguments:', arguments);
    return 'hello world';
  }

  // route for thrift or grpc
  @Method()
  Publish(@Request() req: any) {
    console.log('========= arguments', arguments);
    console.log('========= req', req);
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

@Controller({ prefix: 'test' })
class TestController {
  @Get(':id')
  sayHello(@Param('id') pid: string, @Req() req: any) {
    console.log('pid:', pid);
    return 'hello test';
  }
}

@Module({
  controllers: [UserController],
  midddlewares: [costMiddleware, testMiddleware],
})
class AppModule {}

async function bootstrap() {
  let x = Container.get(UserService);
  console.log('========= x', x);
  // console.log("-------",x, (x as any).testService.sayHello())
  // console.log(1)
  // let x = new UserController(1);
  // console.log(x, (x as any).test)

  const app = await HttpFactory.create(AppModule, { middlewares: [bodyParser()] });
  app.use(async (ctx: any, next: any) => {
    console.log(1);
    // console.log("========= ctx.params",ctx.params);
    await next();
    // console.log("========= ctx.params22",ctx.params);
  });
  await app.listen(3000);
  console.log('listening on 3000...');

  const app2 = await ThriftFactory.create(AppModule, { service: UnpkgService });
  app2.use(async (ctx: any, next: any) => {
    console.log(2);
    await next();
  });

  app2.on('error', (err: Error) => {
    console.error(err);
  });

  await app2.listen(3001);
  console.log('listening on 3001...');

  const app3 = await GrpcFactory.create(AppModule, { service: GreeterService });
  app3.use(async (ctx: any, next: any) => {
    console.log(3);
    await next();
  });

  await app3.listen('0.0.0.0:3002');
  console.log('listening on 3002...');
}
bootstrap();
