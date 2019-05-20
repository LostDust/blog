// myQuery
function $(select) {
  let query = [...document.querySelectorAll(select)];
  return query.length === 1 ? query[0] : query;
}

// 订阅者对象
// 保存原节点和现节点以及转译回调
let Reader = {
  init(origin, callback) {
    this.origin = origin;
    this.callback = callback;
    return this;
  }
};

// 观察者对象
// 维护一个订阅者名单，在监听器出发时遍历订阅者
let Observer = {
  init(instance) {
    this.subs = [];
    this.instance = instance;
    return this;
  },
  addSub(sub) {
    this.subs.push(sub);
  },
  update() {
    // 将挂载点移出文档流
    this.instance.$el.style.display = "none";
    this.subs.forEach(sub => {
      // 如果节点时 input，先比较一下 input.value
      if (sub.input) {
        let key = sub.origin.getAttribute("v-model");
        if (sub.target.value == this.instance.$data[key]) return;
      }
      // 转译模板语句并记录转译后的节点
      sub.target = sub.callback(sub.origin, sub.target);
    });
    this.instance.$el.style.display = "block";
  }
};

// Vue 对象
let MyVue = {
  init(json) {
    this.$el = $(json.el);
    this.$data = json.data;
    // Object.setPrototypeOf
    // 为实例属性绑定数据监听器
    this.observeData(json.data);
    // 将挂载点转变成文档片段
    this.$origins = this.toFragment(this.$el);
    // 克隆原文档片段
    let transcript = this.$origins.cloneNode(true);
    // 查询文档片段中的模板语句，转译并记录订阅者
    let result = this.findSubs(transcript);
    // 将文档片段置回挂载点
    this.$el.appendChild(result);
    return this;
  },
  observeData(dataObj) {
    if (!dataObj || typeof dataObj !== "object") return;
    let self = this; // 标记 Vue 对象引用
    // 遍历属性
    Object.keys(dataObj).forEach(key => {
      defineReactive(dataObj, key, dataObj[key]);
    });
    function defineReactive(dataObj, key, val) {
      self.observeData(val); // 递归子属性对象
      // 为每个属性实例化一个观察者对象
      let observer = Object.create(Observer).init(self);
      Object.defineProperty(dataObj, key, {
        enumerable: true,
        configurable: true,
        get: () => {
          // 为观察者对象添加订阅者
          if (Observer.target) observer.addSub(Observer.target);
          return val;
        },
        set: newVal => {
          if (val === newVal) return;
          val = newVal;
          // 在数据被重新赋值时触发监听器
          observer.update();
        }
      });
      // 绑定监听器后触发一次监听器（要在添加完订阅者之后）
      // observer.update(val);
      // 观察者对象标识当前观察者实例
      // Observer.target = observer;
      // 强行执行 getter，往订阅者列表中添加当前观察者实例
      // var v = dataObj[key];
      // 释放观察者对象标识
      // Observer.target = null;
      // 为什么要将观察者实例加入订阅者列表？
    }
  },
  toFragment(el) {
    // 创建一个空白文档片段
    let fragment = document.createDocumentFragment();
    // 将挂载点下的子节点转移到文档片段上
    while (el.firstChild) fragment.appendChild(el.firstChild);
    return fragment;
  },
  findSubs(fragment) {
    let self = this; // 标记 Vue 对象引用
    function setReader(node, callback) {
      // 实例化一个订阅者
      let reader = Object.create(Reader);
      reader.init(node, callback.bind(self));
      // 标记订阅者
      Observer.target = reader;
      // 转译模板语句并记录转译后的节点
      reader.target = callback.call(self, node);
      // 标记 input 类型节点
      if (node.tagName == "INPUT") reader.input = true;
      console.log(node.tagName == "INPUT");
      // 释放订阅者标记
      Observer.target = null;
    }
    // 遍历文档片段的子节点
    [...fragment.childNodes].forEach(node => {
      // 若节点为元素节点
      if (node.nodeType == 1) {
        // 若元素节点下还有子节点，继续递归
        if (node.childNodes.length) self.findSubs(node);
        // 查询指令模板语句
        let resolve = [...node.attributes].find(attr => {
          return self.reg.isDirective.test(attr.name);
        });
        if (!resolve) return;
        // 配置订阅者并转译节点
        setReader(node, self.translateAttr);
      }
      // 若节点为文本节点
      else {
        // 查询文本模板语句
        if (!self.reg.isTemplate.test(node.textContent)) return;
        // 配置订阅者并转译节点
        setReader(node, self.translateText);
      }
    });
    return fragment;
  },
  // 转译文本模板语句
  translateText(...argus) {
    let origin = argus[0];
    let target = argus.length == 2 ? argus[1] : origin;
    let text = origin.textContent;
    let templates = text.match(this.reg.isTemplate);
    // 遍历每个模板语句
    templates.forEach(template => {
      slice = template.slice(2, -2).match(/\S+/)[0];
      // 此时会从实例的数据对象中取值，若是第一次转译会记录订阅者！
      text = text.replace(template, this.$data[slice]);
    });
    // 克隆新节点
    let newNode = origin.cloneNode(true);
    // 转译新节点
    newNode.textContent = text;
    // 替换节点！！！！！！！！！！！！！！！
    target.parentNode.replaceChild(newNode, target);
    return newNode;
  },
  // 转译指令模板语句
  translateAttr(...argus) {
    let origin = argus[0];
    let target = argus.length == 2 ? argus[1] : origin;
    // 克隆新节点
    let newNode = origin.cloneNode(true);
    let directives = [];
    [...newNode.attributes].forEach(attr => {
      if (this.reg.isDirective.test(attr.name)) {
        directives.push(attr);
      }
    });
    directives.forEach(attr => {
      // on 指令
      if (this.reg.isOnDirective.test(attr.name)) {
        this.translateOn(newNode, attr);
      }
      // bind 指令
      else if (this.reg.isBindDirective.test(attr.name)) {
        this.translateBind(newNode, attr);
      }
      // model 指令
      else if (this.reg.isModelDirective.test(attr.name)) {
        this.translateModel(newNode, attr);
      }
      // 删除该指令
      newNode.removeAttribute(attr.name);
    });
    // 替换节点！！！！！！！！！！！！！！！
    target.parentNode.replaceChild(newNode, target);
    return newNode;
  },
  // 转译 on 指令
  translateOn(node, attr) {
    let eventType = attr.Name.replace(this.reg.onBefore, "");
    let callback = this.mathods[attr.value];
    if (eventType && callback) {
      node.addEventListener(eventType, callback, false);
    }
  },
  // 转译 bind 指令
  translateBind(node, attr) {
    let attrName = attr.name.replace(this.reg.bindBefore, "");
    // 此时会从实例的数据对象中取值，若是第一次转译会记录订阅者！
    let value = this.$data[attr.value];
    node.setAttribute(attrName, value);
  },
  // 转译 model 指令
  translateModel(node, attr) {
    let self = this;
    // 此时会从实例的数据对象中取值，若是第一次转译会记录订阅者！
    let val = this.$data[attr.value];
    // 监听 input 事件
    node.addEventListener(
      "input",
      function() {
        self.$data[attr.value] = this.value;
      },
      false
    );
    node.value = typeof val == "undefined" ? "" : val;
  },
  // 正则库
  reg: {
    isTemplate: /\{\{\s*((?:.|\n)+?)\s*\}\}/g,
    isDirective: /^v-|^@|^:/,
    isOnDirective: /^v-on:|^@/,
    onBefore: /^@|^v-on:/,
    isBindDirective: /^v-bind:|^:/,
    bindBefore: /^:|^v-bind:/,
    isModelDirective: /^v-model/
  }
};

// Vue 实例
// let app = Object.create(Vue).init({
//   el: "#app",
//   data: {}
// });
