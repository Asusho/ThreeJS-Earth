const fragmentShader = `
uniform sampler2D texture1;
uniform vec2 mousePos;
varying vec2 vUv;

uniform vec2 resolution;

void main() {

    vec3 color = vec3(1.0, 0.0, 0.0);

    vec2 st = gl_FragCoord.xy;
  
    vec2 mouse = vec2(mousePos)/vec2(resolution);
  
  
    float dist = distance(st, mousePos);

    if(dist < 10.0){
        vec4 texel0, texel1, resultColor;
        texel0 = texture2D(texture1, vUv);
        texel1 = vec4(color,1.0);
        resultColor = mix(texel0, texel1, 0.5);
     gl_FragColor = resultColor;
    }
    else{
        gl_FragColor = texture2D(texture1, vUv);
    }


}
`
export default fragmentShader;