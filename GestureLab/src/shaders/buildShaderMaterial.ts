import * as THREE from "three";

function mkShader(vertexShader: string, fragmentShader: string, extras: Record<string, { value: number }> = {}) {
  const base = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_velocity: { value: new THREE.Vector2(0, 0) },
  };
  return new THREE.ShaderMaterial({
    uniforms: { ...base, ...extras },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

const vs = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

export function buildShaderMaterial(shaderId: string, overrides?: Record<string, number>) {
  const defaults = shaderDefaults[shaderId] ?? {};
  const vals = { ...defaults, ...overrides };
  const u: Record<string, { value: number }> = {};
  for (const k of Object.keys(vals)) u[k] = { value: vals[k] };

  switch (shaderId) {
    case "chromatic-aberration":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_speed; uniform float u_amount; uniform float u_intensity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float r=length(uv); float wave=sin((r*18.0)-u_time*u_speed+u_velocity.x*3.0)*u_amount; vec3 col=vec3(0.16+wave,0.06,0.54); col.r+=u_intensity*pow(1.0-r,2.0); col.g+=0.03*sin(u_time+uv.x*6.0+u_velocity.y); gl_FragColor=vec4(col,1.0); }`,
        u);
    case "entropy-erosion":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_speed; uniform float u_speed2; uniform float u_mix; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float n=sin(uv.x*13.0+u_time*u_speed+u_velocity.x)+cos(uv.y*11.0-u_time*u_speed2+u_velocity.y); vec3 col=mix(vec3(0.05,0.03,0.12),vec3(0.6,0.4,0.95),u_mix+0.5*sin(n*3.0)); gl_FragColor=vec4(col,1.0); }`,
        u);
    case "gravitational-lensing":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_warp; uniform float u_speed; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float radius=length(uv); float warp=pow(1.0-radius,2.0)*u_warp+length(u_velocity)*0.02; vec3 col=vec3(0.04,0.04,0.18)+vec3(0.2,0.1,0.4)*warp; col+=vec3(0.05,0.2,0.6)*sin(u_time+radius*u_speed); gl_FragColor=vec4(col,1.0); }`,
        u);
    case "plasma-bridge":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_speed; uniform float u_density; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float band=sin(length(uv)*u_density-u_time*u_speed+u_velocity.x*8.0)*0.5+0.5; vec3 col=mix(vec3(0.05,0.08,0.26),vec3(0.84,0.21,1.0),band); gl_FragColor=vec4(col,1.0); }`,
        u);
    case "scanline-pulse":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_density; uniform float u_speed; uniform float u_brightness; varying vec2 vUv; void main(){ float scan=abs(sin(vUv.y*u_density+u_time*u_speed+u_velocity.y*20.0)); vec3 col=mix(vec3(0.02,0.02,0.06),vec3(0.1,0.7,1.0),scan*u_brightness); gl_FragColor=vec4(col,1.0); }`,
        u);
    case "neon-scattering":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_glow; uniform float u_scatter; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float glow=exp(-dot(uv,uv)*u_glow); vec3 col=vec3(0.12,0.8,0.94)*glow+vec3(0.92,0.2,0.94)*sin(u_time+uv.x*u_scatter+u_velocity.x)*0.16; gl_FragColor=vec4(col,1.0); }`,
        u);
    case "topographic-matrix":
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_density; uniform float u_speed; uniform float u_contrast; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float value=sin(uv.x*u_density+u_time*u_speed+u_velocity.x)*0.5+cos(uv.y*u_density-u_time*0.7+u_velocity.y)*0.5; vec3 col=mix(vec3(0.04,0.06,0.12),vec3(0.6,0.95,1.0),u_contrast+0.5*value); gl_FragColor=vec4(col,1.0); }`,
        u);
    default:
      return mkShader(vs,
        `uniform float u_time; uniform vec2 u_velocity; uniform float u_speed; varying vec2 vUv; void main(){ vec3 col=vec3(0.12,0.22,0.36)+u_speed*sin(vec3(0.22,0.5,0.92)+u_time+u_velocity.x); gl_FragColor=vec4(col,1.0); }`,
        u);
  }
}

export const shaderDefaults: Record<string, Record<string, number>> = {
  "chromatic-aberration":  { u_speed: 5.0, u_amount: 0.035, u_intensity: 0.08 },
  "entropy-erosion":       { u_speed: 2.0, u_speed2: 1.6, u_mix: 0.5 },
  "gravitational-lensing": { u_warp: 0.25, u_speed: 12.0 },
  "plasma-bridge":         { u_speed: 6.0, u_density: 14.0 },
  "scanline-pulse":        { u_density: 180.0, u_speed: 8.0, u_brightness: 1.0 },
  "neon-scattering":       { u_glow: 2.0, u_scatter: 6.0 },
  "topographic-matrix":    { u_density: 10.0, u_speed: 1.0, u_contrast: 0.5 },
};

export const shaderParamMeta: Record<string, { key: string; label: string; min: number; max: number; step: number }[]> = {
  "chromatic-aberration": [
    { key: "u_speed", label: "Wave Speed", min: 0.5, max: 15, step: 0.1 },
    { key: "u_amount", label: "Wave Amount", min: 0.001, max: 0.15, step: 0.001 },
    { key: "u_intensity", label: "Intensity", min: 0.01, max: 0.3, step: 0.01 },
  ],
  "entropy-erosion": [
    { key: "u_speed", label: "Noise Speed X", min: 0.2, max: 8, step: 0.1 },
    { key: "u_speed2", label: "Noise Speed Y", min: 0.2, max: 8, step: 0.1 },
    { key: "u_mix", label: "Mix", min: 0, max: 1, step: 0.01 },
  ],
  "gravitational-lensing": [
    { key: "u_warp", label: "Warp", min: 0.01, max: 0.8, step: 0.01 },
    { key: "u_speed", label: "Radius Speed", min: 1, max: 30, step: 0.5 },
  ],
  "plasma-bridge": [
    { key: "u_speed", label: "Band Speed", min: 0.5, max: 20, step: 0.1 },
    { key: "u_density", label: "Band Density", min: 2, max: 40, step: 0.5 },
  ],
  "scanline-pulse": [
    { key: "u_density", label: "Scan Density", min: 20, max: 400, step: 1 },
    { key: "u_speed", label: "Scan Speed", min: 0.5, max: 30, step: 0.1 },
    { key: "u_brightness", label: "Brightness", min: 0.1, max: 2, step: 0.1 },
  ],
  "neon-scattering": [
    { key: "u_glow", label: "Glow", min: 0.5, max: 8, step: 0.1 },
    { key: "u_scatter", label: "Scatter", min: 0.5, max: 20, step: 0.1 },
  ],
  "topographic-matrix": [
    { key: "u_density", label: "Density", min: 2, max: 30, step: 0.5 },
    { key: "u_speed", label: "Speed", min: 0.1, max: 5, step: 0.1 },
    { key: "u_contrast", label: "Contrast", min: 0, max: 1, step: 0.01 },
  ],
};
