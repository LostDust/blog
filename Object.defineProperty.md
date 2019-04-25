# Object.defineProperty

```JavaScript
let obj = {};
let temp = {};

Object.defineProperty(obj, "data", {
  value: "someData",
  configurable: true, // 是否可删除
  writable: true, // 是否可重新赋值
  enumerable: true, // 是否可枚举
})
Object.defineProperty(obj, "msg", {
  // 取值时调用的方法
  get() {
    return temp.msg
  },
  // 赋值时调用的方法
  set(val) {
    temp.msg = val;
  }
})
```