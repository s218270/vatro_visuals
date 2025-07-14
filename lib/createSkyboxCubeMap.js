import * as THREE from "three";
import { isIOS, isMobile } from "../utils/logoUtils";

/**
 * Tworzy proceduralny skybox jako cubemapę na podstawie shaderów.
 * Zwraca { cubeRenderTarget, texture } do użycia jako scene.background.
 */
export function createSkyboxCubeMap(renderer) {
  let cubeRes = 4096;
  let STEP = 256;
  if (isIOS() || isMobile()) {
    cubeRes = 1024;
    STEP = 64;
  } else if (typeof window !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      if (gl) {
        const maxCube = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        if (maxCube < 4096) cubeRes = maxCube;
      }
    } catch {}
  }
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(cubeRes, {
    type: THREE.HalfFloatType,
  });
  const cubeCameras = [];
  const directions = [
    { dir: [1, 0, 0], up: [0, -1, 0] },
    { dir: [-1, 0, 0], up: [0, -1, 0] },
    { dir: [0, 1, 0], up: [0, 0, 1] },
    { dir: [0, -1, 0], up: [0, 0, -1] },
    { dir: [0, 0, 1], up: [0, -1, 0] },
    { dir: [0, 0, -1], up: [0, -1, 0] },
  ];
  for (let i = 0; i < 6; i++) {
    const cam = new THREE.PerspectiveCamera(90, 1, 0.1, 10);
    cam.position.set(0, 0, 0);
    cam.up.set(...directions[i].up);
    cam.lookAt(...directions[i].dir);
    cubeCameras.push(cam);
  }
  const quadScene = new THREE.Scene();
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadMaterial = new THREE.ShaderMaterial({
    uniforms: {
      iResolution: { value: new THREE.Vector3(cubeRes, cubeRes, 1) },
      faceIndex: { value: 0 },
      uScroll: { value: 0 },
      STEP: { value: STEP },
      uSkyboxRotation: { value: Math.PI },
      uSkyboxRotationX: { value: -Math.PI },
      uSkyboxYOffset: { value: 0.38 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      #define EPS .001
      uniform vec3 iResolution;
      uniform float uScroll;
      uniform int faceIndex;
      uniform int STEP;
      uniform float uSkyboxRotation;
      uniform float uSkyboxRotationX;
      uniform float uSkyboxYOffset;
      varying vec2 vUv;
      float smin( float a, float b, float k ) {
          float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
          return mix( b, a, h ) - k*h*(1.0-h);
      }
      const mat2 m = mat2(.8,.6,-.6,.8);
      float noise( in vec2 x ) {
          return sin(1.5*x.x)*sin(1.5*x.y);
      }
      float fbm6( vec2 p ) {
          float f = 0.0;
          f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
          f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
          f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
          f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
          f += 0.015625*(0.5+0.5*noise( p ));
          return f/0.96875;
      }
      mat2 getRot(float a) {
          float sa = sin(a), ca = cos(a);
          return mat2(ca,-sa,sa,ca);
      }
      vec3 _position;
      float sphere(vec3 center, float radius) {
          return distance(_position,center) - radius;
      }
      float swingPlane(float height) {
          vec3 pos = _position + vec3(0.,0.,uScroll * 2.5);
          float def =  fbm6(pos.xz * .25) * 1.;
          float way = pow(abs(pos.x) * 34. ,2.5) *.0000125;
          def *= way;
          float ch = height + def;
          return max(pos.y - ch,0.);
      }
      float map(vec3 pos) {
          _position = pos;
          float dist;
          dist = swingPlane(0.);
          float sminFactor = 5.25;
          dist = smin(dist,sphere(vec3(0.,-15.,80.),45.),sminFactor);
          return dist;
      }
      vec3 getNormal(vec3 pos) {
          vec3 nor = vec3(0.);
          vec3 vv = vec3(0.,1.,-1.)*.01;
          nor.x = map(pos + vv.zxx) - map(pos + vv.yxx);
          nor.y = map(pos + vv.xzx) - map(pos + vv.xyx);
          nor.z = map(pos + vv.xxz) - map(pos + vv.xxy);
          nor /= 2.;
          return normalize(nor);
      }
      vec3 getRayDir(vec2 uv, int face) {
        uv = uv * 2.0 - 1.0;
        if(face==0) return normalize(vec3( 1.0, -uv.y, -uv.x));
        if(face==1) return normalize(vec3(-1.0, -uv.y,  uv.x));
        if(face==2) return normalize(vec3( uv.x,  1.0,  uv.y));
        if(face==3) return normalize(vec3( uv.x, -1.0, -uv.y));
        if(face==4) return normalize(vec3( uv.x, -uv.y,  1.0));
        return         normalize(vec3(-uv.x, -uv.y, -1.0));
      }
      vec3 rotateY(vec3 v, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return vec3(
          c * v.x + s * v.z,
          v.y,
          -s * v.x + c * v.z
        );
      }
      vec3 rotateX(vec3 v, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return vec3(
          v.x,
          c * v.y - s * v.z,
          s * v.y + c * v.z
        );
      }
      void main() {
          vec2 fragCoord = vUv * iResolution.xy;
          vec2 uv = (fragCoord.xy-.5*iResolution.xy)/iResolution.y;
          vec3 rayDir = getRayDir(vUv, faceIndex);
          rayDir = rotateY(rayDir, uSkyboxRotation);
          rayDir = rotateX(rayDir, uSkyboxRotationX);
          rayDir.y += uSkyboxYOffset;
          rayDir.y *= -1.0;
          rayDir = normalize(rayDir);
          vec3 rayOrigin = vec3(uv + vec2(0.,6.), -1. );
          vec3 rd = normalize(mix(normalize(vec3(uv,1.)), rayDir, 0.7));
          rd.zy = getRot(.05) * rd.zy;
          rd.xy = getRot(.075) * rd.xy;
          vec3 position = rayOrigin;
          float curDist;
          int nbStep = 0;
          for(; nbStep < STEP;++nbStep) {
              curDist = map(position);
              if(curDist < EPS)
                  break;
              position += rd * curDist * .5;
          }
          float f;
          float dist = distance(rayOrigin,position);
          f = dist /(98.);
          f = float(nbStep) / float(STEP);
          f *= .8;
          vec3 col = vec3(f);
          col = pow(col, vec3(2.2));
          col *= 0.5;
          gl_FragColor = vec4(col,1.0);
      }
    `,
    depthWrite: false,
    depthTest: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMaterial);
  quadScene.add(quad);
  for (let i = 0; i < 6; i++) {
    quadMaterial.uniforms.faceIndex.value = i;
    renderer.setRenderTarget(cubeRenderTarget, i);
    renderer.render(quadScene, quadCamera);
  }
  renderer.setRenderTarget(null);
  return { cubeRenderTarget, texture: cubeRenderTarget.texture };
}
