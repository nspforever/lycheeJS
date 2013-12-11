
attribute vec4 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main(void) {
	vTexCoord = aPosition.zw;
	gl_Position.zw = vec2(1.0, 1.0);
	gl_Position.xy = aPosition.xy;
}
