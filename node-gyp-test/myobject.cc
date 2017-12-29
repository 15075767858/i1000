#include "myobject.h"

namespace demo
{
using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;
Persistent<Function> MyObject::constructor;
MyObject::MyObject(double value) : value_(value)
{
}
MyObject::~MyObject()
{ 
}
}