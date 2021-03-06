<template>
  <div class="full u-layer-base">
    <Scene @ready="(v) => { scene = v; init() }" >
      <!-- <Box3></Box3> -->
      <Object3D v-if="gameReady === 'voicer'" :position="{ x:0, y: 0, z: 0 }">
        <SimSim :exec="execStack" :renderer="renderer" :scene="scene" :audio="audio" v-if="renderer && scene && audio" />
      </Object3D>
      <Object3D v-if="gameReady === 'vertexer'" :position="{ x:0, y: 0, z: 0 }">
        <GeoVert :exec="execStack" :renderer="renderer" :scene="scene" v-if="renderer && scene" />
      </Object3D>

    </Scene>

    <div class="u-layer" ref="mounter" :style="{ visibility: gameReady ? `visible` : 'hidden' }">
    </div>

    <div class="u-layer" v-if="!gameReady">
      <div class="u-center u-full">
        <div class="">
          <button @click="startGame('vertexer')">Start Vertexer</button>
          <button @click="startGame('voicer', true)">Start Voicer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// imports
import 'imports-loader?THREE=three!three/examples/js/postprocessing/EffectComposer.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/RenderPass.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/MaskPass.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/ShaderPass.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/CopyShader.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/FXAAShader.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/ConvolutionShader.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/LuminosityHighPassShader.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/UnrealBloomPass.js'

import 'imports-loader?THREE=three!three/examples/js/controls/OrbitControls.js'

import FreeJS from '../FreeJS'
import * as THREE from 'three'
import * as AuAu from '../Simulation/GeoShader/audio/mic.js'

// import * as OIMO from 'oimo'

let getRD = () => {
  return `_${(Math.random() * 1000000).toFixed(0)}`
}

export default {
  props: {
    toucher: {}
  },
  components: {
    ...FreeJS,

    Box3: require('../Scene/Box3.vue').default,
    SimSim: require('../Scene/SimSim.vue').default,
    GeoVert: require('../Scene/GeoVert.vue').default
  },
  data () {
    return {
      mouse: { x: 0, y: 0, z: 0 },
      rect: false,
      execStack: [],
      gameReady: false,
      audio: false,
      control: false,
      size: false,
      dpi: 2,
      rAFID: 0,
      scene: false,
      renderer: false,
      camera: false,
      readyInit: false,
      world: false,
      Settings: {
        camPosition: {'x':0,'y':0,'z':-500.28470041153204},
        bloomPass: {
          threshold: 0.0846740050804403,
          strength: 0.9551227773073666,
          radius: 1.0343776460626588
        }
      }
    }
  },
  beforeDestroy () {
    this.stop()
  },
  created () {

  },
  mounted () {
    this.startGame('vertexer')
  },
  watch: {
  },
  methods: {
    startGame (gameReady, audio) {
      audio && this.setupAudio()
      this.$nextTick(() => {
        this.gameReady = gameReady
      })
    },
    init () {
      this.setupRenderer()
      this.setupSizer()
      this.setupCamera()
      this.setupComposer()
      this.setupControl()
      this.syncSize()
      this.start()
    },
    setupAudio () {
      this.audio = AuAu.setup()
    },
    setupControl () {
      var control = new THREE.OrbitControls(this.camera, this.$refs['mounter'])
      this.control = control
      control.enableDamping = true
      control.enableKeys = false
    },
    setupRenderer () {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false
      })
      this.renderer.domElement.style.marginBottom = '-6px'
      this.$refs['mounter'].appendChild(this.renderer.domElement)
    },
    setupCamera () {
      let { size, Settings } = this
      let fov = 75
      let aspect = size.width / size.height
      let near = 0.1
      let far = 100000000

      let camera = this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      camera.position.x = this.Settings.camPosition.x
      camera.position.y = this.Settings.camPosition.y
      camera.position.z = this.Settings.camPosition.z
      camera.lookAt(0,0,0)
    },
    setupComposer () {
      let composer = this.composer = new THREE.EffectComposer(this.renderer)
      let { scene, camera, size, dpi, Settings } = this
      let renderBG = new THREE.RenderPass(scene, camera)

      let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(size.width * dpi, size.height * dpi), 1.5, 0.4, 0.85)
      bloomPass.renderToScreen = true

      bloomPass.threshold = Settings.bloomPass.threshold
      bloomPass.strength = Settings.bloomPass.strength
      bloomPass.radius = Settings.bloomPass.radius

      composer.addPass(renderBG)
      composer.addPass(bloomPass)
    },
    setupSizer () {
      this.getSizeInfo()
      window.addEventListener('resize', this.getSizeInfo, false)
    },
    getSizeInfo () {
      var rect = this.$refs['mounter'].getBoundingClientRect()
      this.rect = rect
      this.size = {
        width: rect.width,
        height: rect.height,
        aspect: rect.width / rect.height
      }
      this.dpi = 2.0 //window.devicePixelRatio || 1.0
    },
    syncSize () {
      let sync = () => {
        let { composer, renderer, camera, size, dpi, control } = this
        control.update()
        composer.setSize(size.width * dpi, size.height * dpi)
        renderer.setPixelRatio(dpi)
        renderer.setSize(size.width, size.height)
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
      }
      sync()
      window.addEventListener('resize', sync, false)

      this.$refs['mounter'].addEventListener('mousemove', (evt) => {
        this.mouse.x = evt.pageX
        this.mouse.y = evt.pageY
      }, false)
    },
    stop () {
      window.cancelAnimationFrame(this.rAFID)
    },
    start () {
      let rAF = () => {
        this.rAFID = window.requestAnimationFrame(rAF)
        this.render()
      }
      this.rAFID = window.requestAnimationFrame(rAF)
    },
    render () {
      let { scene, camera, renderer, composer, mouse, rect } = this

      this.execStack.forEach(e => e({ mouse, rect }))

      if (scene && camera && renderer && composer) {
        composer.render()
      } else if (scene && camera && renderer) {
        renderer.render(scene, camera)
      }
    }
  }
}
</script>

<style scoped>
.full {
  width: 100%;
  height: 100%;
}
</style>
