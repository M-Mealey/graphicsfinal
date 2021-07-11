import { Debugger } from "../lib/webglutils/Debugging.js";
import {
  CanvasAnimation,
  WebGLUtilities
} from "../lib/webglutils/CanvasAnimation.js";
import { Floor } from "../lib/webglutils/Floor.js";
import { GUI, Mode } from "./Gui.js";
import {
  sceneFSText,
  sceneVSText,
  floorFSText,
  floorVSText,
  skeletonFSText,
  skeletonVSText,
  sBackVSText,
  sBackFSText,
  pointVSText,
  pointFSText
} from "./Shaders.js";
import { Mat4, Vec4, Vec3 } from "../lib/TSM.js";
import { SLoader } from "./StructParser.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import { Camera } from "../lib/webglutils/Camera.js";

export class SkinningAnimation extends CanvasAnimation {
  private gui: GUI;
  private millis: number;

  private loadedModel: number;

  /* Floor Rendering Info */
  private floor: Floor;
  private floorRenderPass: RenderPass;

  /* Scene rendering info */
  private scene;
  private nodeRenderPass: RenderPass;

  /* Skeleton rendering info */
  private skeletonRenderPass: RenderPass;

  /* Skeleton rendering info */
  private wallRenderPass: RenderPass;

  /* Scrub bar background rendering info */
  private sBackRenderPass: RenderPass;
  

  /* Global Rendering Info */
  private lightPosition: Vec4;
  private backgroundColor: Vec4;

  private canvas2d: HTMLCanvasElement;
  private ctx2: CanvasRenderingContext2D | null;

  private overlayItems: Array<object>;
  private overlayText: Array<any>;


  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.canvas2d = document.getElementById("textCanvas") as HTMLCanvasElement;

    this.overlayItems = new Array<object>();
    this.overlayText = new Array<any>();
    this.initMenu();

    this.ctx2 = this.canvas2d.getContext("2d");
    if (this.ctx2) {
      this.ctx2.font = "25px serif";
      this.ctx2.fillStyle = "#ffffffff";
    }

    this.ctx = Debugger.makeDebugContext(this.ctx);
    let gl = this.ctx;

    this.floor = new Floor();

    this.floorRenderPass = new RenderPass(this.extVAO, gl, floorVSText, floorFSText);
    this.nodeRenderPass = new RenderPass(this.extVAO, gl, pointVSText, pointFSText);
    this.skeletonRenderPass = new RenderPass(this.extVAO, gl, skeletonVSText, skeletonFSText);
    this.wallRenderPass = new RenderPass(this.extVAO, gl, sceneVSText, sceneFSText);    

    this.gui = new GUI(this.canvas2d, this);
    this.lightPosition = new Vec4([-10, 10, -10, 1]);
    this.backgroundColor = new Vec4([0.0, 0.37254903, 0.37254903, 1.0]);

    this.initFloor();

    // Status bar
    this.sBackRenderPass = new RenderPass(this.extVAO, gl, sBackVSText, sBackFSText);
    
    this.initGui();

    this.millis = new Date().getTime();
  }

  public getScene(): SLoader {
    return this.scene;
  }

  /**
   * Setup the animation. This can be called again to reset the animation.
   */
  public reset(): void {
      this.gui.reset();
      this.gui.clearKeyframes();
      this.setScene(this.loadedModel);
  }

  /*
   * Set up the overlay that has settings and information
   */
  private initMenu() {
    let menu_items = ["#shading","#selected","#info1","#info2","#info3","#info4","#info5","#info6","#info7","#info8"];
    menu_items.forEach((item) => {
      var docitem = document.querySelector(item);
      var textnode = document.createTextNode("");
      docitem.appendChild(textnode);
      this.overlayItems.push(docitem);
      this.overlayText.push(textnode);
    });
  }
 
  /*
   * Get text to display on overlay
   */
  private getMenuText(): string[] {
    let ret = [];
    if(this.gui.shading==1) {
      ret.push("ON");
    } else {
      ret.push("OFF");
    }
    let selection_text = this.getGUI().getSelectionString();
    selection_text.forEach((item) => {
      ret.push(item);
    })
    return ret;
  }

 
  public initGui(): void {
    // Status bar background
    let verts = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]);
    this.sBackRenderPass.setIndexBufferData(new Uint32Array([1, 0, 2, 2, 0, 3]))
    this.sBackRenderPass.addAttribute("vertPosition", 2, this.ctx.FLOAT, false,
      2 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, verts);

    this.sBackRenderPass.setDrawData(this.ctx.TRIANGLES, 6, this.ctx.UNSIGNED_INT, 0);
    this.sBackRenderPass.setup();

    }

  public initScene(): void {
    if (this.scene.meshes.length === 0) { return; }
    this.initNodes();
    if(this.scene.meshes[0].getbeamIndices().length > 0){
      this.initSkeleton();
    } else {this.skeletonRenderPass = new RenderPass(this.extVAO, this.ctx, skeletonVSText, skeletonFSText);}
      
    if(this.scene.meshes[0].getWallIndices().length > 0) {
      this.initWalls();
    } else {this.wallRenderPass = new RenderPass(this.extVAO, this.ctx, sceneVSText, sceneFSText); }

    this.gui.reset();
    this.gui.clearKeyframes();
    this.gui.load_keyframes(this.scene);
  }

  /*
   * Get matrix that scales and transposes models as needed.
   */
  public getMworld(): Mat4 {
    switch(this.loadedModel){
      case 1:{return new Mat4([0.01,0,0,0,0,0.01,0,0,0,0,0.01,0,0,0,0,1]);}
      case 2:{return new Mat4([0.02,0,0,0,0,0.02,0,0,0,0,0.02,0,0,0,0,1]);}
      case 3:{return new Mat4([0.03,0,0,0,0,0,0.03,0,0,0.03,0,0,0,0,0,1]);}
      case 4:{return new Mat4([0.01,0,0,0,0,0.01,0,0,0,0,0.01,0,0,0,0,1]);}
      case 5:{return new Mat4([0.06,0,0,0,0,0.06,0,0,0,0,0.06,0,0,0,0,1]);}
      case 6:{return new Mat4([10,0,0,0,0,10,0,0,0,0,10,0,0,0,0,1]);}
      case 7:{return new Mat4([0.5,0,0,0,0,0.5,0,0,0,0,0.5,0,0,0,0,1]);}
      case 8:{return new Mat4([0.7,0,0,0,0,0.7,0,0,0,0,0.7,0,0,0,0,1]);}
      case 9:{return new Mat4([1.0,0,0,0, 0,1.0,0,0,0,0,1.0,0,0,0,0,1]);}
      default:{return new Mat4().setIdentity();}
    }
  }



  
  /**
   * Sets up the mesh and mesh drawing
   */
  public initNodes(): void {
    this.nodeRenderPass.setIndexBufferData(this.scene.meshes[0].getNodeIndices());

    this.nodeRenderPass.addAttribute("vertPosition", 3, this.ctx.FLOAT, false,
      3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getNodePositions());
    this.nodeRenderPass.addAttribute("nodeIndex", 1, this.ctx.FLOAT, false,
      1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getNodeIndexAttribute());


    this.nodeRenderPass.addUniform("mWorld",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.getMworld().all()) );        
    });
    this.nodeRenderPass.addUniform("mProj",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.nodeRenderPass.addUniform("mView",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
    this.nodeRenderPass.addUniform("jTrans",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
        gl.uniform3fv(loc, this.scene.meshes[0].getNodeTranslations());
    });
    this.nodeRenderPass.addUniform("hnum",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.getScene().meshes[0].getHighlightNum(0));
    });
    this.nodeRenderPass.addUniform("snum",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.getScene().meshes[0].getSelectedNum(0));
    });

    this.nodeRenderPass.setDrawData(this.ctx.POINTS, this.scene.meshes[0].nodes.length, this.ctx.UNSIGNED_INT, 0);
    this.nodeRenderPass.setup();
  } 

  /**
   * Sets up the skeleton drawing
   */
  public initSkeleton(): void {
    console.log("init skeleton");
    this.skeletonRenderPass.setIndexBufferData(this.scene.meshes[0].getbeamIndices());

    this.skeletonRenderPass.addAttribute("vertPosition", 3, this.ctx.FLOAT, false,
      3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getbeamPositions());
    this.skeletonRenderPass.addAttribute("vertNumber", 1, this.ctx.FLOAT, false,
      1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getbeamIndicesFloat());
    this.skeletonRenderPass.addAttribute("beamIndex", 1, this.ctx.FLOAT, false,
      1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getbeamIndexAttribute());
    this.skeletonRenderPass.addAttribute("vertIndex", 1, this.ctx.FLOAT, false,
      1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getbeamVertIndices());

    this.skeletonRenderPass.addUniform("mWorld",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.getMworld().all())); 
    });
    this.skeletonRenderPass.addUniform("mProj",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.skeletonRenderPass.addUniform("mView",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
   this.skeletonRenderPass.addUniform("hnum",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.getScene().meshes[0].getHighlightNum(1));
    });
    this.skeletonRenderPass.addUniform("snum",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.getScene().meshes[0].getSelectedNum(1));
    });
    this.skeletonRenderPass.addUniform("jTrans",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
        gl.uniform3fv(loc, this.getScene().meshes[0].getNodeTranslations());
    });
    this.skeletonRenderPass.addUniform("forces",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
        gl.uniform1fv(loc, this.getScene().meshes[0].getBeamForces());
    });
    this.skeletonRenderPass.addUniform("maxf",
    (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
      gl.uniform1f(loc, this.gui.getBeamMaxForce());
    });

    this.skeletonRenderPass.setDrawData(this.ctx.LINES,
      this.scene.meshes[0].getbeamIndices().length, this.ctx.UNSIGNED_INT, 0);
    this.skeletonRenderPass.setup();
  }

  /**
   * Sets up the mesh and mesh drawing
   */
   public initWalls(): void {
    this.wallRenderPass.setIndexBufferData(this.scene.meshes[0].getWallIndices());

    this.wallRenderPass.addAttribute("vertPosition", 3, this.ctx.FLOAT, false,
      3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getWallPositions());
    this.wallRenderPass.addAttribute("vertIndex", 1, this.ctx.FLOAT, false,
      1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getWallVertIndices());
    this.wallRenderPass.addAttribute("wallIndex", 1, this.ctx.FLOAT, false,
      1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getWallIndexAttribute());
    this.wallRenderPass.addAttribute("norm", 3, this.ctx.FLOAT, false,
      3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.scene.meshes[0].getWallNorms());


    this.wallRenderPass.addUniform("lightPosition",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform4fv(loc, this.lightPosition.xyzw);
    });
    this.wallRenderPass.addUniform("mWorld",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.getMworld().all())); 
    });
    this.wallRenderPass.addUniform("mProj",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.wallRenderPass.addUniform("mView",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
    this.wallRenderPass.addUniform("jTrans",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
        gl.uniform3fv(loc, this.scene.meshes[0].getNodeTranslations());
    });
    this.wallRenderPass.addUniform("hnum",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.getScene().meshes[0].getHighlightNum(2));
    });
    this.wallRenderPass.addUniform("snum",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.getScene().meshes[0].getSelectedNum(2));
    });
    this.wallRenderPass.addUniform("stress",
    (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
      gl.uniform4fv(loc, this.scene.meshes[0].getWallForces());
    });
    this.wallRenderPass.addUniform("moment",
    (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
      gl.uniform4fv(loc, this.scene.meshes[0].getWallMoment());
    });
    this.wallRenderPass.addUniform("maxima",
    (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {        
      gl.uniform2fv(loc, this.gui.getWallMaxValues());
    });
    this.wallRenderPass.addUniform("shading",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform1f(loc, this.gui.shading);
    });

    this.wallRenderPass.setDrawData(this.ctx.TRIANGLES, this.scene.meshes[0].getWallIndices().length, this.ctx.UNSIGNED_INT, 0);
    this.wallRenderPass.setup();
  } 
  
  /**
   * Sets up the floor drawing
   */
  public initFloor(): void {
    this.floorRenderPass.setIndexBufferData(this.floor.indicesFlat());
    this.floorRenderPass.addAttribute("aVertPos",
      4,
      this.ctx.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      this.floor.positionsFlat()
    );

    this.floorRenderPass.addUniform("uLightPos",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform4fv(loc, this.lightPosition.xyzw);
    });
    this.floorRenderPass.addUniform("uWorld",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));
    });
    this.floorRenderPass.addUniform("uProj",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.floorRenderPass.addUniform("uView",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
    this.floorRenderPass.addUniform("uProjInv",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().inverse().all()));
    });
    this.floorRenderPass.addUniform("uViewInv",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().inverse().all()));
    });
    
    this.floorRenderPass.setDrawData(this.ctx.TRIANGLES, this.floor.indicesFlat().length, this.ctx.UNSIGNED_INT, 0);
    this.floorRenderPass.setup();
  }


  /** @internal
   * Draws a single frame
   *
   */
  public draw(): void {
    // Advance to the next time step
    let curr = new Date().getTime();
    let deltaT = curr - this.millis;
    this.millis = curr;
    deltaT /= 1000;
    this.getGUI().incrementTime(deltaT);
    
    // draw the status message and update overlay
    if (this.ctx2) {
      this.ctx2.clearRect(0, 0, this.ctx2.canvas.width, this.ctx2.canvas.height);
      if (this.scene.meshes.length > 0) {
        this.ctx2.fillText(this.getGUI().getModeString(), 50, 710);
      }
      
      let overlay_text = this.getMenuText();
      overlay_text.forEach((item, index) => {
        this.overlayText[index].nodeValue = item;
      });
    }

    // Drawing
    const gl: WebGLRenderingContext = this.ctx;
    const bg: Vec4 = this.backgroundColor;
    gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.lineWidth(5);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
    this.drawScene(0, 200, 800, 600);    

    /* Draw status bar */
    if (this.scene.meshes.length > 0) {
      gl.viewport(0, 0, 800, 200);
      this.sBackRenderPass.draw();      
    }    
  }

  private drawScene(x: number, y: number, width: number, height: number): void {
    const gl: WebGLRenderingContext = this.ctx;
    gl.viewport(x, y, width, height);

    this.floorRenderPass.draw();

    /* Draw Scene */
    if (this.scene.meshes.length > 0) {
      if(this.nodeRenderPass) {
        this.nodeRenderPass.draw();
      }
      gl.disable(gl.DEPTH_TEST);
      this.skeletonRenderPass.draw();
      gl.enable(gl.DEPTH_TEST);
      
      this.wallRenderPass.draw();
    }
  }

  public getGUI(): GUI {
    return this.gui;
  }
  
  /**
   * s and sets the scene from a Collada file
   * @param modelno number representing file to be loaded, [1-9]
   */
  public setScene(modelno: number): void {
    this.loadedModel = modelno;
    this.scene = new SLoader(modelno);
    this.initScene();
  }
}

export function initializeCanvas(): void {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  /* Start drawing */
  const canvasAnimation: SkinningAnimation = new SkinningAnimation(canvas);
  canvasAnimation.start();
  canvasAnimation.setScene(1);
}
