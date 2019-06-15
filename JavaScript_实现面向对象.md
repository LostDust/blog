# JavaScript 实现面向对象

[TOC]

## ES5 语法实现

```javascript
// 声明 Parent 类的构造函数，实现面向对象的封装
function Parent(data) {
    this.data = data;
    // 若在构造函数中挂载方法函数，会导致每个实例对象上都会挂载该方法函数
    this.print = function() {
        console.log(this.data);
    };
}
// 若在构造函数的原型对象上挂载方法函数，每个实例对象会通过原型链共用该方法函数
Parent.prototype.todu = function() {
    console.log(this.data);
}
// 使用 new 关键字调用构造函数，返回一个对象实例
var obj1 = new Parent("data");
// 实例对象的 __proto__ 属性指向 Parent 类的原型对象

// 声明 Child 类的构造函数，在函数内部调用 Parent 类构造函数
function Child(data) {
    Parent.call(this, data);
}
// 实例一个 Parent 类对象作为 Child 类的原型对象实现继承
Child.prototype = new Parent();
// 在 Child 类构造函数的原型对象上重写父类的方法实现多态
Child.prototype.todu = function() {
    console.log(this.data += "!");
}
```

## ES6 语法实现

```javascript
// 使用 class 关键字声明 Parent 类，实现面向对象的封装
class Parent {
    // 在 constructor 方法中定义构造函数
    constructor(data) {
        this.data = data;
    }
    print() {
        console.log(this.data);
    }
}
// 使用 new 关键字调用构造函数，返回一个对象实例
const obj1 = new parent("data");

// 使用 extends 关键字继承 Parent 类
class Child extends Parent {
    constructor(data1, data2) {
        // super 方法调用父类的构造函数
        super(data1);
        this.data2 = data2;
    }
    // 重写父类已有的方法实现多态
    print() {
        console.log(this.data2);
    }
}
```

## 面向原型的语法

```javascript
// 直接声明一个对象作为类对象
const Parent = {
    // 挂载初始化方法
    init(data) {
        this.data = data;
        return this;
    },
    print() {
        console.log(this.data);
    }
};
// Object.create 方法创建一个对象，使用现有对象作为新对象的 __proto__
const obj1 = Object.create(Parent).init("data");
// 同样使用 Object.create 方法来创建子类，实现继承
const Child = Object.create(Parent);
// 重写子类初始化方法实现多态
Child.init = function(data1, data2) {
  Parent.init.call(this, data1);
  this.data2 = data2;
  return this;
};
// 重写子类方法函数实现多态
Child.print = function() {
  console.log(this.data);
};
const obj2 = Object.create(Child).init("data1", "data2");
```

