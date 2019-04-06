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

mat3 rotateQ (vec3 axis, float rad) {
    float hr = rad / 2.0;
    float s = sin( hr );
    vec4 q = vec4(axis * s, cos( hr ));
    vec3 q2 = q.xyz + q.xyz;
    vec3 qq2 = q.xyz * q2;
    vec2 qx = q.xx * q2.yz;
    float qy = q.y * q2.z;
    vec3 qw = q.w * q2.xyz;

    return mat3(
        1.0 - (qq2.y + qq2.z),  qx.x - qw.z,            qx.y + qw.y,
        qx.x + qw.z,            1.0 - (qq2.x + qq2.z),  qy - qw.x,
        qx.y - qw.y,            qy + qw.x,              1.0 - (qq2.x + qq2.y)
    );
}

void main ()	{
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 newCell = gl_FragCoord.xy;
  vec2 uv = newCell * cellSize;
  vec4 idx = texture2D(tIdx, uv);

  bool isInvalid = false;

  vec4 vel = texture2D(tVel, uv);
  vec4 pos = texture2D(tPos, uv);

  float vertexIDX = idx.x;
  float squareIDX = idx.y;
  float totalPoints = idx.z;

  float lineNums = 500.0;
  float stackIDX = floor(squareIDX / lineNums);
  float lineIDX = mod(squareIDX, lineNums);

  if (lineIDX > 300.0) {
    isInvalid = true;
  }
  if (stackIDX > 300.0) {
    isInvalid = true;
  }
  if (isInvalid) {
    discard;
    return;
  }

  float piz = 0.01 * 2.0 * 3.14159265;

  vel.x = 10.0 * sin(0.01 * vel.x + 0.01 * pos.x + time + lineIDX * piz);
  vel.y = 10.0 * cos(0.01 * vel.y + 0.01 * pos.y + time + lineIDX * piz);

  if (isInvalid) {
    vel.w = 0.0;
    discard;
  } else {
    vel.w = 1.0;
    gl_FragColor = vel;
  }

}