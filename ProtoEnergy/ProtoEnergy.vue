<template>
  <div class="u-full u-layer-base">
    <div class="u-layer">
      <SimulationEngine class="u-full"></SimulationEngine>
    </div>
  </div>
</template>

<script>
import SimulationEngine from './Pipeline/SimulationEngine'
export default {
  components: {
    SimulationEngine
  },
}
</script>
<style>
@import url(./util.css);
html,body{
  margin: 0px;
  width: 100%;
  height: 100%;
}
</style>

<style scoped>

</style>
