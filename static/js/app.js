Vue.component('root', {
  template: '<div>A custom component!</div>'
})

var app = new Vue({
  el: '#app',
  data: {
    imgs: window.imgs
  }
});
