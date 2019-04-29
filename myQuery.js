// Query 对象
let Query = {
  init(target) {
    // 保存 DOM 对象列表
    this.$ = target[0];
    this.$$ = target;
    return this;
  },
  // 样式操作
  css(argu) {
    switch (typeof argu) {
      case "string":
        return getComputedStyle(this.$)[argu];
        break;
      case "object":
        this.$$.forEach(el => {
          Object.keys(argu).forEach(key => {
            el.style[key] = argu[key];
          });
        });
        return this;
    }
  },
  // 类名操作
  // DOM 操作
};

// 选择器
function $(select) {
  // 获取 DOM 对象列表
  let target = [...document.querySelectorAll(select)];
  // 转变成 Query 对象
  return Object.create(Query).init(target);
}
