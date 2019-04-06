import * as THREE from 'three'
// import 'imports-loader?THREE=three!three/examples/js/GPUComputationRenderer.js'
import GPUComputationRenderer from '../GPGPU.js'

/* eslint-enable */
export const makeAPI = ({ renderer, scene }) => {
  var api = {}
  var WIDTH = 1024;
  var gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer)

  // pos IDX
  var posIdx = gpuCompute.createTexture();
  var slot = posIdx.image.data;
  var p = 0;
  for ( var j = 0; j < WIDTH; j ++ ) {
    for ( var i = 0; i < WIDTH; i ++ ) {
      let id = p / 4;
      slot[p + 0] = id % 6; // slot idx
      slot[p + 1] = Math.floor(id / 6); // vertex idx (plane square has two triangle = 6 vertex)
      slot[p + 2] = Math.floor(WIDTH * WIDTH / 4.0 / 6.0); // total square
      slot[p + 3] = id;
      p += 4;
    }
  }

  var velDynamic = gpuCompute.createTexture();
  var posDynamic = gpuCompute.createTexture();

  var velVar = gpuCompute.addVariable('tVel', require('raw-loader!./tVel.glowing.frag').default, velDynamic );
  velVar.material.uniforms.tIdx = { value: posIdx };
  velVar.material.uniforms.time = { value: 0 };
  gpuCompute.setVariableDependencies( velVar, [ velVar ] );

  var posVar = gpuCompute.addVariable('tPos', require('raw-loader!./tPos.glowing.frag').default, posDynamic );
  posVar.material.uniforms.tIdx = { value: posIdx };
  posVar.material.uniforms.time = { value: 0 };
  gpuCompute.setVariableDependencies( posVar, [ posVar, velVar ] );

  var error = gpuCompute.init();
  if (error !== null) {
    console.error(error)
  }

  var geo = new THREE.BufferGeometry();

  let getUVInfo = () => {
    let newArr = []
    var na = 0;
    for ( var j = 0; j < WIDTH; j ++ ) {
      for ( var i = 0; i < WIDTH; i ++ ) {
        newArr[na + 0] = i / WIDTH;
        newArr[na + 1] = j / WIDTH;
        newArr[na + 2] = 0;
        na += 3;
      }
    }
    return newArr
  }

  geo.addAttribute('position',  new THREE.Float32BufferAttribute(getUVInfo(), 3));
  geo.addAttribute('posIdx',  new THREE.Float32BufferAttribute(posIdx.image.data, 4));

  var uniforms = {
    time: { value: 0 },
    tPos: { value: null }
  }
  var material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms,
    defines: {
      resolution: `vec2(${renderer.domElement.width.toFixed(1)}, ${renderer.domElement.height.toFixed(1)})`
    },
    vertexShader: require('raw-loader!./display.vert').default,
    fragmentShader: require('raw-loader!./display.frag').default,
    side: THREE.DoubleSide
  })

  var mesh = new THREE.Mesh(geo, material)
  scene.add(mesh)

  api.render = () => {
    posVar.material.uniforms.time.value = window.performance.now() * 0.001
    velVar.material.uniforms.time.value = window.performance.now() * 0.001
    uniforms.tPos.value = gpuCompute.getCurrentRenderTarget(posVar).texture
    uniforms.time.value = window.performance.now() * 0.001
    gpuCompute.compute()
  }
  return api
}
