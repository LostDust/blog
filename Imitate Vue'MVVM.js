// myQuery
function $(select) {
  let query = [...document.querySelectorAll(select)];
  return query.length === 1 ? query[0] : query;
}

// 订阅者对象
let Reader = {
  init(node, callback) {
    return this;
  }
};

// 观察者对象
let Observer = {
  init() {
    this.subs = [];
  },
  update(data) {
    this.subs.forEach(sub => {
      // TODO updataView
    });
  }
};

// Vue 对象
let Vue = {
  init(json) {
    this.$el = $(json.el);
    // 为实例属性绑定数据监听器
    this.watchData(json.data);
    // 将挂载点转变成文档片段
    this.fragment = this.toFragment(this.$el);
    // 查询文档片段中的模板语句，并记录订阅者
    this.findSubs(fragment);
    // 转译文档模板
    translate();
    return this;
  },
  watchData(dataObj) {
    if (!dataObj || typeof dataObj !== "object") return;
    let self = this;
    // 遍历属性
    Object.keys(dataObj).forEach(key => {
      defineReactive(dataObj, key, dataObj[key]);
    });
    function defineReactive(dataObj, key, val) {
      self.watchData(val); // 递归子属性对象
      // 为每个属性实例化一个观察者对象
      let observer = Object.create(Observer).init();
      Object.defineProperty(dataObj, key, {
        enumerable: true,
        configurable: true,
        // 记录该属性的订阅者（DOM 节点）
        get: () => {
          // 判断是否需要为观察者对象添加订阅者
          if (Observer.target) observer.addSub(Observer.target);
          return val;
        },
        // 为该属性绑定监听器
        set: newVal => {
          if (val === newVal) return;
          val = newVal;
          // 在数据被重新赋值时触发监听器
          observer.update(newVal);
        }
      });
      // 绑定监听器后触发一次监听器
      observer.update(val);
      // 观察者对象标识当前观察者实例
      Observer.target = observer;
      // 强行执行 getter，往订阅者列表中添加当前观察者实例
      var v = dataObj[key];
      // 释放观察者对象标识
      Observer.target = null;
      // 为什么要将观察者实例加入订阅者列表？
    }
  },
  toFragment(el) {
    // 创建一个空白的文档片段
    let fragment = document.createDocumentFragment();
    // 获取挂载点下的首个子节点
    let firstChild = el.firstChild;
    // 将挂载点下的子节点转移到文档片段上
    while (firstChild) {
      fragment.appendChild(firstChild);
      firstChild = el.firstChild;
    }
    return fragment;
  },
  findSubs(fragment) {
    // 获取文档片段的子节点集合（NodeList 对象）
    let nodeList = [...fragment.childNodes];
    let self = this; // 标记 Vue 对象指针
    // 遍历子节点集合
    nodeList.forEach(node => {
      switch (node.nodeType) {
        // 若节点为元素节点
        case 1:
          // 查询指令模板语句
          let result = [...node.attributes].find(attr => {
            return self.reg.isDirective.test(attr.name);
          });
          // 转译指令模板语句
          if (result) self.translateAttr(node);
          // 若元素节点下还有子节点，继续递归
          if (node.childNodes.length) self.findSubs(node);
          break;
        // 若节点为文本节点
        case 3:
          // 查询文本模板语句
          if (self.reg.isTemplate.test(node.textContent)) {
            // 实例化一个订阅者
            let reader = Object.create(Reader).init(node, self.translateText);
            // 转译文本模板语句
            self.translateText(node);
          }
      }
    });
  },
  // 转译指令模板语句
  translateAttr(node) {
    let self = this;
  },
  // 转译文本模板语句
  translateText(node) {
    let self = this;
    let text = node.textContent;
    let templates = text.match(this.reg.isTemplate);
    templates.forEach(template => {
      slice = template.slice(2, -2).match(/\S+/)[0];
      // 此时会从实例的数据对象中取值，并添加订阅者！！！
      text = text.replace(template, self.$data[slice]);
    });
    node.textContent = text;
  },
  translate() {},
  // 正则库
  reg: {
    isTemplate: /\{\{\s*((?:.|\n)+?)\s*\}\}/g,
    isDirective: /^v-|^@|^:/,
    isOnDirective: /^v-on:|^@/,
    isBindDirective: /^v-bind:|^:/,
    isModelDirective: /^v-model/
  }
};

// Vue 实例
let app = Object.create(Vue).init({
  el: "#app",
  data: {}
});
