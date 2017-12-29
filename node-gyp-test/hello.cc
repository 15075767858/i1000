#include <node.h>
#include "myobject.h"

#include <windows.h>

namespace demo
{
using v8::Exception;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Null;
using v8::Object;
using v8::String;
using v8::Value;
void Method(const FunctionCallbackInfo<Value> &args)
{
    
    Isolate *isolate = args.GetIsolate();
    //args.GetReturnValue().Set(a.Msg);
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}
void Method1(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    Local<Object> obj = Object::New(isolate);
    Local<Function> cb = Local<Function>::Cast(args[0]);
    const unsigned argc = 1;
    Local<Value> argv[argc] = {String::NewFromUtf8(isolate, "hello world")};
    //Sleep(10000);
    cb->Call(Null(isolate), argc, argv);
    //args.GetReturnValue().Set(123.3);
    //args.GetReturnValue().Set(String::NewFromUtf8(isolate, "bbbb12312321"));
}
void CreateObject(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    Local<Object> obj = Object::New(isolate);
    obj->Set(String::NewFromUtf8(isolate, "msg"), args[0]->ToString());
    args.GetReturnValue().Set(obj);
}
void MyFunction(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, "hello world"));
}
void CreateFunction(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, MyFunction);
    Local<Function> fn = tpl->GetFunction();
    fn->SetName(String::NewFromUtf8(isolate, "theFunction"));
    args.GetReturnValue().Set(fn);
}

void Init(Local<Object> exports)
{
    NODE_SET_METHOD(exports, "hello", Method);
    NODE_SET_METHOD(exports, "hello1", Method1);
    NODE_SET_METHOD(exports, "createobj", CreateObject);
    NODE_SET_METHOD(exports, "CreateFunction", CreateFunction);
}
NODE_MODULE(NODE_GYP_MODULE_NAME, Init);
}