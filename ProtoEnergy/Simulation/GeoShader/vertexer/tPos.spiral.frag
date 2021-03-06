precision highp float;
precision highp sampler2D;

uniform float time;
uniform sampler2D tIdx;

mat3 rotateX(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
    );
}

mat3 rotateY(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
    );
}

mat3 rotateZ(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

void main ()	{
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 newCell = gl_FragCoord.xy;
  vec2 uv = newCell * cellSize;
  vec4 pos = texture2D(tPos, uv);
  vec4 idx = texture2D(tIdx, uv);

  bool isInvalid = false;

  float squareIDX = idx.y;
  float subVertexIDX = idx.x;
  float totalPoints = idx.z;

  float lineNums = 500.0;
  float stackIDX = floor(squareIDX / lineNums);
  float lineIDX = mod(squareIDX, lineNums);

  if (lineIDX > 300.0) {
    isInvalid = true;
  }
  if (stackIDX > 500.0) {
    isInvalid = true;
  }

  float sX = 0.3;
  float sY = 0.3;

  float gapX = 20.0 * 1.0 / sX;
  float gapY = 0.0;

  float w = sX * (2.0 + gapX);
  float h = sY * (2.0 + gapY);

  float offsetX = (w * lineIDX);
  float offsetY = (h * stackIDX);
  float offsetZ = (0.0);

  if (subVertexIDX == 0.0) {
    pos.x = 1.0 * sX;
    pos.y = 1.0 * sY;
    pos.z = 0.0;
  } else if (subVertexIDX == 1.0) {
    pos.x = -1.0 * sX;
    pos.y = 1.0 * sY;
    pos.z = 0.0;
  } else if (subVertexIDX == 2.0) {
    pos.x = -1.0 * sX;
    pos.y = -1.0 * sY;
    pos.z = 0.0;
  } else if (subVertexIDX == 3.0) {
    pos.x = 1.0 * sX;
    pos.y = 1.0 * sY;
    pos.z = 0.0;
  } else if (subVertexIDX == 4.0) {
    pos.x = -1.0 * sX;
    pos.y = -1.0 * sY;
    pos.z = 0.0;
  } else if (subVertexIDX == 5.0) {
    pos.x = 1.0 * sX;
    pos.y = -1.0 * sY;
    pos.z = 0.0;
  } else {
    isInvalid = true;
  }

  pos.y += offsetY;
  pos.x += offsetX;
  pos.z += offsetZ;

  float pX = pos.x;
  float pY = pos.y;

  float piz = 0.01 * 2.0 * 3.14159265;

  pos.xyz = rotateZ(time + pY * piz) * pos.xyz;
  pos.z += sin(time  + pX * piz * 0.333) * 50.0;

  if (isInvalid) {
    pos.w = 0.0;
    discard;
  } else {
    pos.w = 1.0;
    gl_FragColor = pos;
  }

}