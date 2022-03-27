/**
 * Created by Cooper on 2022/03/27.
 */
import 'reflect-metadata';
import {
  Body,
  Context,
  Controller,
  Get,
  Headers,
  HttpFactory,
  Module,
  Param,
  Post,
  Query,
  Request,
  Response,
  Rpc,
  ThriftFactory,
} from '../index';

var UnpkgService = require('./gen-nodejs/UnpkgService');

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
    @Response() res: any
  ) {
    // console.log('========= arguments', arguments);
    console.log('========= as', as);
    console.log('========= uid', uid);
    console.log('========= qqqq', qqqq);
    // console.log('========= ctx', ctx);
    console.log('========= req', req);
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
  @Rpc()
  Publish(@Query('as') as: string) {
    console.log('========= arguments', arguments);
    console.log('========= 1', 1);
    console.log('========= as', as);
    return { code: 0, message: 'publish success' };
  }
}

@Module({
  controllers: [UserController],
  midddlewares: [],
})
class AppModule {}

async function bootstrap() {
  const app = await HttpFactory.create(AppModule);
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
}
bootstrap();
