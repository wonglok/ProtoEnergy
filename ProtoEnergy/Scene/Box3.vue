<template>
  <Object3D>
    <!-- <Box :color="'#0ff0f0'"></Box> -->

    <BoxBufferGeometry @geometry="(v) => { geo.box = v }"></BoxBufferGeometry>
    <SolidMaterial @material="(v) => { mat.solid = v }"></SolidMaterial>

    <Object3D v-if="geo.box && mat.solid">
      <Object3D :position="{ x: 0, y: 0, z: 0 }" :scale="{ x: 50, y: 50, z: 50 }">
        <Mesh :geo="geo.box" :mat="mat.solid"></Mesh>
      </Object3D>
      <Object3D :position="{ x: 0, y: 50, z: 0 }" :scale="{ x: 50, y: 50, z: 50 }">
        <Mesh :geo="geo.box" :mat="mat.solid"></Mesh>
      </Object3D>
      <Object3D :position="{ x: 0, y: 100, z: 0 }" :scale="{ x: 50, y: 50, z: 50 }">
        <Mesh :geo="geo.box" :mat="mat.solid"></Mesh>
      </Object3D>
    </Object3D>
  </Object3D>
</template>

<script>
import Box from '../Items/Box.vue'
import BoxBufferGeometry from '../Geometry/BoxBufferGeometry.vue'
import Mesh from '../Items/Mesh.vue'
import SolidMaterial from '../Material/SolidMaterial.vue'
import DevMaterial from '../Material/DevMaterial.vue'
import FreeJS from '../FreeJS'

export default {
  components: {
    ...FreeJS,
    DevMaterial,
    SolidMaterial,
    Mesh,
    BoxBufferGeometry,
    Box
  },
  data () {
    return {
      geo: {
        box: false,
      },
      mat: {
        solid: false
      }
    }
  },
  created () {
    this.$on('add', (v) => {
      this.$parent.$emit('add', v)
    })
    this.$on('remove', (v) => {
      this.$parent.$emit('remove', v)
    })
  },
  mounted () {
  },
  methods: {

  }
}
</script>

<style>

</style>
