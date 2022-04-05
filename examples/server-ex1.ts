/**
 * Created by Cooper on 2022/03/27.
 */
import 'reflect-metadata';
import { Body, Controller, Delete, Get, HttpFactory, Module, Param, Post, Put } from '../src';

const bodyParser = require('koa-bodyparser');

@Controller({ prefix: '/users' })
export class UserController {
  @Get()
  getAll() {
    return 'This action returns all users';
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return 'This action returns user #' + id;
  }

  @Post()
  post(@Body() user: any) {
    return 'Saving user...';
  }

  @Put('/:id')
  put(@Param('id') id: number, @Body() user: any) {
    return 'Updating a user...';
  }

  @Delete('/:id')
  remove(@Param('id') id: number) {
    return 'Removing user...';
  }
}

@Module({
  controllers: [UserController],
  midddlewares: [],
})
class AppModule {}

async function bootstrap() {
  const app = await HttpFactory.create(AppModule, { middlewares: [bodyParser()] });
  app.use((ctx: any, next: any) => {
    console.log('========= 1', 1);
    next();
  });
  await app.listen(3000);
  console.log('listening on 3000...');
}
bootstrap();
