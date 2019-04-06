precision highp float;
precision highp sampler2D;

uniform float time;
uniform sampler2D tIdx;

void main () {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 newCell = gl_FragCoord.xy;
  vec2 uv = newCell * cellSize;
  vec4 vel = texture2D(tVel, uv);
  vec4 idx = texture2D(tIdx, uv);

  float vertexIDX = idx.x;
  float squareIDX = idx.y;
  float totalPoints = idx.z;

  float lineNums = 500.0;
  float stackIDX = floor(squareIDX / lineNums);
  float lineIDX = mod(squareIDX, lineNums);

  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
