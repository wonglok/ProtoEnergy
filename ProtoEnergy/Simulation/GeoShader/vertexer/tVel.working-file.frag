
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


void toPrimitive (inout vec2 rect, inout vec4 pos, float squareVertexID, inout bool shouldSkipRender) {
  if (squareVertexID == 0.0) {
    pos.x = 1.0 * rect.x; //Width;
    pos.y = 1.0 * rect.y; //Height;
    pos.z = 0.0;
  } else if (squareVertexID == 1.0) {
    pos.x = -1.0 * rect.x; //Width;
    pos.y = 1.0 * rect.y; //Height;
    pos.z = 0.0;
  } else if (squareVertexID == 2.0) {
    pos.x = -1.0 * rect.x; //Width;
    pos.y = -1.0 * rect.y; //Height;
    pos.z = 0.0;
  } else if (squareVertexID == 3.0) {
    pos.x = 1.0 * rect.x; //Width;
    pos.y = 1.0 * rect.y; //Height;
    pos.z = 0.0;
  } else if (squareVertexID == 4.0) {
    pos.x = -1.0 * rect.x; //Width;
    pos.y = -1.0 * rect.y; //Height;
    pos.z = 0.0;
  } else if (squareVertexID == 5.0) {
    pos.x = 1.0 * rect.x; //Width;
    pos.y = -1.0 * rect.y; //Height;
    pos.z = 0.0;
  } else {
    shouldSkipRender = true;
  }
}


float constrain(float val, float min, float max) {
    if (val < min) {
        return min;
    } else if (val > max) {
        return max;
    } else {
        return val;
    }
}

vec3 getDiff (in vec3 lastPos, in vec3 mousePos) {
  vec3 diff = lastPos.xyz / 33.3 - mousePos;
  float distance = constrain(length(diff), 5.0, 100.0);
  float strength = 0.35 / (distance * distance);

  diff = normalize(diff);
  // delta
  diff = diff * strength * -2.0;
  // diff = diff * strength * (-20.83) * (1.0 / delta) * 0.0183;

  return diff;
}

uniform vec3 mousePos;

void main ()	{
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 newCell = gl_FragCoord.xy;
  vec2 uv = newCell * cellSize;
  vec4 idx = texture2D(tIdx, uv);

  bool shouldSkipRendering = false;
  vec4 vel = texture2D(tVel, uv);
  vec4 state = texture2D(tState, uv);
  vec4 pos = texture2D(tPos, uv);

  float vertexID = idx.w;
  float squareVertexID = idx.x;
  float squareIDX = idx.y;
  float totalSquares = idx.z;

  // float dimension = pow(idx.z, 0.5);
  // float stackIDX = floor(squareIDX / dimension);
  // float lineIDX = mod(squareIDX, dimension);

  // vec2 plane = vec2(
  //   0.3, // width
  //   0.3 // height
  // );
  // vec2 gap = vec2(
  //   0.0, // width
  //   0.0 // height
  // );

  vel.xyz += getDiff(pos.xyz, vec3(-mousePos.x, mousePos.y, mousePos.z));

  // vel.xyz += force.xyz;
  // vel.z = 0.0;

  if (state.x == 0.0) {
    vel.xyz = vec3(0.0);
  }

  if (shouldSkipRendering) {
    vel.w = 0.0;
    discard;
  } else {
    vel.w = 1.0;
    gl_FragColor = vel;
  }

}