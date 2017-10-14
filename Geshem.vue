<template>
  <div id="geshem">
    <h1>Hello World</h1>
    <vue-slider ref="slider" v-model="slider" :min=1 :max=7></vue-slider>
  </div>
</template>

<script>
  import vueSlider from 'vue-slider-component';
  export default {
    name: 'geshem',
    data: function () {
      return {
        slider: 7
      }
    },
    components: {
      'vue-slider': vueSlider
    },
  }
</script>

<style lang="scss">
  #geshem {
    position: absolute;
  }
</style>
