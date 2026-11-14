#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 coords;

uniform sampler2D uSamplerTex;
uniform sampler2D uSamplerMap;
uniform sampler2D uSamplerAlt;

void main() {
    vec4 color = texture2D(uSamplerTex, vTextureCoord);
    vec4 altimetryColor = texture2D(uSamplerAlt, coords.xz);

    color = 0.7 * color + 0.3 * altimetryColor;

    gl_FragColor = color;
}