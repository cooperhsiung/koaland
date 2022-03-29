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
  Module,
  Param,
  Post,
  Query,
  Req,
  Request,
  Response,
  Method,
  ThriftFactory,
  Use,
} from '../';

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

@Use(testMiddleware2)
@Controller({})
class UserController {
  @Get('/test')
  hello(@Query('as') as: string) {
    console.log('========= arguments', arguments);
    console.log('========= 1', 1);
    console.log('========= as', as);
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
    @Req() req2: any,
    @Response() res: any
  ) {
    console.log('========= arguments', arguments);
    // console.log('========= as', as);
    // console.log('========= uid', uid);
    // console.log('========= qqqq', qqqq);
    // console.log('========= ctx', ctx);
    console.log('========= req', req2);
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
    // console.log('========= arguments', arguments);
    console.log('========= as33', as);
    console.log('========= uid333', uid);
    console.log('========= qqqq333', qqqq);
    // console.log('========= ctx', ctx);
    console.log('========= req33', req);
    console.log('========= body33', body);
    console.log('========= headers', headers);
    console.log('========= userAgent', userAgent);
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

@Module({
  controllers: [UserController],
  midddlewares: [costMiddleware, testMiddleware],
})
class AppModule {}

async function bootstrap() {
  const app = await HttpFactory.create(AppModule, { middlewares: [bodyParser()] });
  app.use((ctx: any, next: any) => {
    console.log('========= 1', 1);
  });
  await app.listen(3000);
  console.log('listening on 3000...');

  const app2 = await ThriftFactory.create(AppModule, { service: UnpkgService });
  app2.use((ctx: any, next: any) => {
    console.log('========= 2', 2);
  });

  await app2.listen(3001);
  console.log('listening on 3001...');

  const app3 = await GrpcFactory.create(AppModule, { service: GreeterService });
  app3.use((ctx: any, next: any) => {
    console.log('========= 2', 2);
  });

  await app3.listen('0.0.0.0:3002');
  console.log('listening on 3002...');
}
bootstrap();
