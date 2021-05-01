


const BLEND_FILTER = 
`
vec4 apply_filter(vec4 baseColor) {

	vec4 filter = texture2D(filterSampler, 
        vec2(gl_FragCoord.x / frameSize.x,
            gl_FragCoord.y / frameSize.y));
	
	return baseColor * filter;
}`;



export const VertexSource = {

Default : 
    
`
attribute vec2 vertexPos;
attribute vec2 vertexUV;

uniform mat3 transform;
uniform vec2 pos;
uniform vec2 size;

varying vec2 uv;

void main() {

    gl_Position = vec4(transform * vec3(vertexPos * size + pos, 1), 1);
    uv = vertexUV;
}`,

NoTexture : 
    
`
attribute vec2 vertexPos;
attribute vec2 vertexUV;

uniform mat3 transform;
uniform vec2 pos;
uniform vec2 size;

void main() {

    gl_Position = vec4(transform * vec3(vertexPos * size + pos, 1), 1);
}`,
}


export const FragmentSource = {

Default : 

`
precision mediump float;
     
uniform sampler2D texSampler;
uniform sampler2D filterSampler;

uniform vec4 color;

uniform vec2 texPos;
uniform vec2 texSize;

uniform vec2 frameSize;

varying vec2 uv;
`
+ BLEND_FILTER +
`
void main() {

    vec2 tex = uv * texSize + texPos;    
    vec4 res = texture2D(texSampler, tex) * color;

    // if(res.a <= DELTA) {
    //     discard;
    // }

    gl_FragColor = apply_filter(res);
}`,



NoTexture : 

`
precision mediump float;

uniform vec4 color;

uniform sampler2D texSampler;
uniform sampler2D filterSampler;

uniform vec2 frameSize;
`
+ BLEND_FILTER +
`
void main() {

    gl_FragColor = apply_filter(color);
}`,
}
