namespace go unpkg
namespace py unpkg

struct PublishRequest {
    1: required string name = "koa-thrift"
    2: required i32 version
}

struct PublishResponse {
    1: required i16 code
    2: optional string message
}

service UnpkgService {
    PublishResponse Publish(1: PublishRequest req)
}
