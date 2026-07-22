import * as THREE from "three";

export function buildShaderMaterial(shaderId: string) {
  const baseUniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_velocity: { value: new THREE.Vector2(0, 0) },
  };

  switch (shaderId) {
    case "chromatic-aberration":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float r=length(uv); float wave=sin((r*18.0)-u_time*5.0+u_velocity.x*3.0)*0.035; vec3 col=vec3(0.16+wave,0.06,0.54); col.r+=0.08*pow(1.0-r,2.0); col.g+=0.03*sin(u_time+uv.x*6.0+u_velocity.y); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    case "entropy-erosion":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float n=sin(uv.x*13.0+u_time*2.0+u_velocity.x)+cos(uv.y*11.0-u_time*1.6+u_velocity.y); vec3 col=mix(vec3(0.05,0.03,0.12),vec3(0.6,0.4,0.95),0.5+0.5*sin(n*3.0)); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    case "gravitational-lensing":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float radius=length(uv); float warp=pow(1.0-radius,2.0)*0.25+length(u_velocity)*0.02; vec3 col=vec3(0.04,0.04,0.18)+vec3(0.2,0.1,0.4)*warp; col+=vec3(0.05,0.2,0.6)*sin(u_time+radius*12.0); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    case "plasma-bridge":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float band=sin(length(uv)*14.0-u_time*6.0+u_velocity.x*8.0)*0.5+0.5; vec3 col=mix(vec3(0.05,0.08,0.26),vec3(0.84,0.21,1.0),band); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    case "scanline-pulse":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ float scan=abs(sin(vUv.y*180.0+u_time*8.0+u_velocity.y*20.0)); vec3 col=mix(vec3(0.02,0.02,0.06),vec3(0.1,0.7,1.0),scan); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    case "neon-scattering":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float glow=exp(-dot(uv,uv)*2.0); vec3 col=vec3(0.12,0.8,0.94)*glow+vec3(0.92,0.2,0.94)*sin(u_time+uv.x*6.0+u_velocity.x)*0.16; gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    case "topographic-matrix":
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec2 uv=vUv*2.0-1.0; float value=sin(uv.x*10.0+u_time+u_velocity.x)*0.5+cos(uv.y*10.0-u_time*0.7+u_velocity.y)*0.5; vec3 col=mix(vec3(0.04,0.06,0.12),vec3(0.6,0.95,1.0),value*0.5+0.5); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    default:
      return new THREE.ShaderMaterial({
        uniforms: baseUniforms,
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float u_time; uniform vec2 u_velocity; varying vec2 vUv; void main(){ vec3 col=vec3(0.12,0.22,0.36)+0.16*sin(vec3(0.22,0.5,0.92)+u_time+u_velocity.x); gl_FragColor=vec4(col,1.0); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
  }
}
