// 选择器方法
function $(select) {
  // 获取 DOM 对象列表
  let selection = [...document.querySelectorAll(select)];
  // 声明 Query 对象
  let Query = {
    init(selection) {
      // 保存 DOM 对象列表
      this.$ = selection[0];
      this.$$ = selection;
      return this;
    },
    // 样式操作
    css(argu) {
      switch (typeof argu) {
        case "string":
          return getComputedStyle(this.$)[argu];
        case "object":
          this.$$.forEach(el => {
            Object.keys(argu).forEach(key => {
              el.style[key] = argu[key];
            });
          });
          return this;
      }
    }
    // 类名操作
    // DOM 操作
  };
  // 转变成 Query 对象
  return Object.create(Query).init(selection);
}

console.log($);
