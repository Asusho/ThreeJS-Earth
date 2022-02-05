const fragmentShader = `
uniform sampler2D texture1;
uniform sampler2D borderMap;
uniform vec4 borderColor;
uniform vec2 mousePos;
varying vec2 vUv;

uniform vec2 resolution;


uniform sampler2D normalMap;


void main() {

    vec3 color = vec3(1.0, 0.0, 0.0);

    vec2 st = gl_FragCoord.xy;
  
    vec2 mouse = vec2(mousePos)/vec2(resolution);
    float dist = distance(st, mousePos);

    vec4 border = texture2D(borderMap,vUv);

   if(border.x > 0.5){
        vec4 texture = texture2D(texture1, vUv);
        vec4 resultColor = mix(texture, borderColor, 0.5);
        gl_FragColor = resultColor;
   }
   else{
        gl_FragColor = texture2D(texture1, vUv);

    }

}
`
export default fragmentShader;