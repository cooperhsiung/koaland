/**
 * Created by Cooper on 2022/03/26.
 */
var grpc = require('@grpc/grpc-js');
var messages = require('./gen_gprc/helloworld_pb');
var services = require('./gen_gprc/helloworld_grpc_pb');

function main() {
  var target = 'localhost:3002';
  var client = new services.GreeterClient(target, grpc.credentials.createInsecure());

  var request = new messages.HelloRequest();
  var user = 'John';
  request.setName(user);
  client.sayHello(request, function (err: Error, response: any) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Greeting:', response.getMessage());
  });
}

main();
