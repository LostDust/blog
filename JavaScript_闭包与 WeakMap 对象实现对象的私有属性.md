```JavaScript
let Parent = (() => {
  let data = new WeakMap();
  let Parent = {
    set: function(msg) {
      data.set(this, msg);
    },
    get: function() {
      console.log(data.get(this));
    }
  };
  return Parent;
})();


let Child = (() => {
  let Child = Object.create(Parent);
  return Child;
})()

Parent.set(10);
Parent.get();

Child.set(20);
Child.get();
```
