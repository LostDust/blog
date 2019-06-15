# JavaScript\_子类实例调用父类的方法实现多态

## 面向类（ES6）

```JavaScript
// 声明父类
class Parent {
  constructor(data) {
    this.data = data;
  }
  todo(self = this) {
    console.log(self.data);
  }
}
// 父类实例
let obj1 = new Parent("obj1");
// 声明子类
class Child extends Parent {
  constructor(data, msg) {
    // 调用父类的构造函数
    super(data);
    // 子类的功能扩充
    this.msg = msg;
  }
  todo(self = this) {
    // 获取父类的引用
    let ParentClass = Object.getPrototypeOf(Child);
    // JavaScript 不支持直接调用父类方法
    // 实例化父类并调用父类方法
    new ParentClass().todo(self);
    // 子类的功能扩充
    console.log(self.msg);
  }
}
// 子类实例
let obj2 = new Child("obj2", "233");
// 结果
obj1.todo();
obj2.todo();
```

## 面向原型

```JavaScript
// 声明父类
let Parent = {
  init(data) {
    this.data = data;
  },
  // init(data, self = this) {
  //   self.data = data;
  // },
  todo(self = this) {
    console.log(self.data);
  }
};
// 父类实例
let obj1 = Object.create(Parent);
obj1.init("obj1");
// 声明子类
let Child = Object.create(Parent);
Child.init = function(data, msg, self = this) {
  // 调用父类方法
  Object.getPrototypeOf(Child).init(data, self);
  // 子类的功能扩充
  self.msg = msg;
};
Child.todo = function(self = this) {
  // 调用父类方法
  // Object.getPrototypeOf(Child).todo(self);
  Parent.todo();
  // 子类的功能扩充
  console.log(self.msg);
};
// 子类实例
let obj2 = Object.create(Child);
obj2.init("obj2", "233");
// 结果
obj1.todo();
obj2.todo();
```
