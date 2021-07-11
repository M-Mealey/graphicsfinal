export const floorVSText = `
    precision mediump float;

    uniform vec4 uLightPos;
    uniform mat4 uWorld;
    uniform mat4 uView;
    uniform mat4 uProj;
    
    attribute vec4 aVertPos;

    varying vec4 vClipPos;

    void main () {

        gl_Position = uProj * uView * uWorld * aVertPos;
        vClipPos = gl_Position;
    }
`;

export const floorFSText = `
    precision mediump float;

    uniform mat4 uViewInv;
    uniform mat4 uProjInv;
    uniform vec4 uLightPos;

    varying vec4 vClipPos;

    void main() {
        vec4 wsPos = uViewInv * uProjInv * vec4(vClipPos.xyz/vClipPos.w, 1.0);
        wsPos /= wsPos.w;
        /* Determine which color square the position is in */
        float checkerWidth = 5.0;
        float i = floor(wsPos.x / checkerWidth);
        float j = floor(wsPos.z / checkerWidth);
        vec3 color = mod(i + j, 2.0) * vec3(1.0, 1.0, 1.0);

        /* Compute light fall off */
        vec4 lightDirection = uLightPos - wsPos;
        float dot_nl = dot(normalize(lightDirection), vec4(0.0, 1.0, 0.0, 0.0));
	    dot_nl = clamp(dot_nl, 0.0, 1.0);
	
        gl_FragColor = vec4(clamp(dot_nl * color, 0.0, 1.0), 1.0);
    }
`;

export const sceneVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute float vertIndex;
    attribute float wallIndex;
    attribute vec3 norm;
    
    varying vec4 lightDir;
    varying vec3 normal;
    varying vec3 col;
    varying float stress_mag;
    varying float shade;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    uniform vec3 jTrans[1024];
    uniform float hnum;
    uniform float snum;
    uniform vec4 stress[1024];
    uniform vec4 moment[1024];
    uniform vec2 maxima;
    uniform float shading;

    void main () {
        shade = shading;
        int v = int(vertIndex);
        vec4 worldPosition = mWorld * vec4(jTrans[v]+vertPosition, 1.0);
        gl_Position = mProj * mView * worldPosition;
        
        //  Compute light direction and transform to camera coordinates
        lightDir = lightPosition - worldPosition;
        
        vec4 normal4 = normalize(mWorld * vec4(norm, 0.0));
        normal = vec3(normal4.x, normal4.y, normal4.z);

        col = vec3(0.0,0.0,0.0);
        if(wallIndex == hnum || wallIndex==snum) {
            col = col+vec3(0.5,0.5,0.5);
        }

        int w = int(wallIndex);
        stress_mag = stress[w].w / maxima[0];
    }

`;

export const sceneFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec3 normal;
    varying vec3 col;
    varying float stress_mag;
    varying float shade;

    void main () {
        vec3 color = vec3(stress_mag,0.6-stress_mag,0.6-stress_mag);
        float light_dot = abs(dot(normalize(lightDir), vec4(normal,0.0)));
        //float light_dot = 1.0;

        if(light_dot<0.2) {
            //light_dot = light_dot * light_dot;
            light_dot = 0.2;
        }
        light_dot = clamp(light_dot, 0.0, 1.0);

        if(shade==0.0) {
            light_dot = 1.0;
        }

        color = clamp(color, 0.0, 1.0);

        gl_FragColor = vec4(light_dot*color + col, 1.0);
    }
`;

export const skeletonVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute float vertNumber;
    attribute float beamIndex;
    attribute float vertIndex;

    varying vec4 hlight;
    varying float fmag;
    
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    uniform float hnum;
    uniform float snum;
    uniform vec3 jTrans[256];
    uniform float maxf;
    uniform float forces[256];

    void main () {
        hlight = vec4(0.0, 0.0, 0.0, 0.0);
        if(beamIndex==hnum || beamIndex==snum) {
            hlight = vec4(1.0, 1.0, 1.0, 1.0);
        }

        fmag = forces[int(vertNumber)]/maxf;

        int v = int(vertIndex);
        gl_Position = mProj * mView * mWorld * vec4(jTrans[v]+vertPosition, 1.0);
    }
`;

export const skeletonFSText = `
    precision mediump float;

    varying vec4 hlight;
    varying float fmag;

    void main () {
        gl_FragColor = vec4(fmag, 1.0-fmag, 1.0-fmag, 1.0) + hlight;
    }
`;

export const sBackVSText = `
    precision mediump float;

    attribute vec2 vertPosition;

    varying vec2 uv;

    void main() {
        gl_Position = vec4(vertPosition, 0.0, 1.0);
        uv = vertPosition;
        uv.x = (1.0 + uv.x) / 2.0;
        uv.y = (1.0 + uv.y) / 2.0;
    }
`;

export const sBackFSText = `
    precision mediump float;

    varying vec2 uv;

    void main () {
        gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
        if (abs(uv.y-.33) < .005 || abs(uv.y-.67) < .005) {
            gl_FragColor = vec4(1, 1, 1, 1);
        }
    }

`;


export const pointVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute float nodeIndex;
    
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    uniform vec3 jTrans[256];
    uniform float hnum;
    uniform float snum;
    
    varying vec4 color;


    void main () {
        int index = int(nodeIndex);
        vec4 worldPosition = mWorld * vec4(jTrans[index] + vertPosition, 1.0);
        gl_Position = mProj * mView * worldPosition;
        gl_PointSize = 5.0;

        color = vec4(0.0,0.0,0.0,0.0);
        int h = int(hnum);
        int s = int(snum);
        if(h == index || s==index) {
          color = vec4(0.0,1.0,0.0,0.5);
        }
    }
`;

export const pointFSText = `
    precision mediump float;

    varying vec4 color;

    void main () {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5) + color;
    }
`;