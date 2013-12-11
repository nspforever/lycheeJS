#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D uSampler;

void main(void) {
	vec4 vTexColor;
	vTexColor    = texture2D(uSampler, vTexCoord);
	gl_FragColor = vTexColor;
}
