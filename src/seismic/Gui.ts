import { Camera } from "../lib/webglutils/Camera.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { SkinningAnimation } from "./App.js";
import { Mat4, Vec3, Vec4, Vec2, Mat2, Quat, Mat3 } from "../lib/TSM.js";
import { Beam, KeyframeHandler } from "./Scene.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import { TangentSpaceNormalMap } from "../lib/threejs/src/constants.js";
import { SLoader } from "./StructParser.js";

/**
 * Might be useful for designing any animation GUI
 */
interface IGUI {
  viewMatrix(): Mat4;
  projMatrix(): Mat4;
  dragStart(me: MouseEvent): void;
  drag(me: MouseEvent): void;
  dragEnd(me: MouseEvent): void;
  onKeydown(ke: KeyboardEvent): void;
}

export enum Mode {
  playback,  
  edit,
  pause  
}

/**
 * Handles Mouse and Button events along with
 * the the camera.
 */

export class GUI implements IGUI {
  private static readonly rotationSpeed: number = 0.05;
  private static readonly zoomSpeed: number = 0.1;
  private static readonly rollSpeed: number = 0.1;
  private static readonly panSpeed: number = 0.1;

  private camera: Camera;
  private dragging: boolean;
  private fps: boolean;
  private prevX: number;
  private prevY: number;

  private height: number;
  private viewPortHeight: number;
  private width: number;

  private animation: SkinningAnimation;


  public time: number;
  
  public mode: Mode;
  

  public hoverX: number = 0;
  public hoverY: number = 0;

  public kf: KeyframeHandler;

  private kfps: number = 50;

  public shading: number;
  
  


  /**
   *
   * @param canvas required to get the width and height of the canvas
   * @param animation required as a back pointer for some of the controls
   * @param sponge required for some of the controls
   */
  constructor(canvas: HTMLCanvasElement, animation: SkinningAnimation) {
    this.height = canvas.height;
    this.viewPortHeight = this.height - 200;
    this.width = canvas.width;
    this.prevX = 0;
    this.prevY = 0;
    
    this.animation = animation;
    
    this.reset();
    
    this.registerEventListeners(canvas);
    this.kf = new KeyframeHandler();
    this.shading = 1;

  }

  public load_keyframes(sc: SLoader) {
    let timestamps = sc.initFrames();
    this.kf.loadData(timestamps, sc.getNodeData(), sc.getWallData(), sc.getBeamData());
    this.kf.copyToCurrent(0);
    this.animation.getScene().meshes[0].setPose(this.kf.current);
  }

  public getNumKeyFrames(): number {
    // Used in the status bar in the GUI
    return this.kf.numKeyframes();
  }

  // Need to fix this to give time by keyframe stamp
  public getTime(): number { //return this.time; 
    return this.animation.getScene().meshes[0].getCurrentTime();}
  
  public getMaxTime(): number { 
    // The animation should stop after the last keyframe
    //return (this.kf.numKeyframes() - 1) / this.kfps;
    return this.kf.getMaxTime();
  }

  /**
   * Resets the state of the GUI
   */
  public reset(): void {
    this.fps = false;
    this.dragging = false;
    this.time = 0;
    this.mode = Mode.edit;
    this.camera = new Camera(
      new Vec3([0, 6, -20]),
      new Vec3([0, 6, 0]),
      new Vec3([0, 1, 0]),
      45,
      this.width / this.viewPortHeight,
      0.1,
      1000.0
    );
  }

  public clearKeyframes() {
    if(this.kf){this.kf.reset();}
  }

  /**
   * Sets the GUI's camera to the given camera
   * @param cam a new camera
   */
  public setCamera(
    pos: Vec3,
    target: Vec3,
    upDir: Vec3,
    fov: number,
    aspect: number,
    zNear: number,
    zFar: number
  ) {
    this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
  }

  /**
   * Returns the view matrix of the camera
   */
  public viewMatrix(): Mat4 {
    return this.camera.viewMatrix();
  }

  /**
   * Returns the projection matrix of the camera
   */
  public projMatrix(): Mat4 {
    return this.camera.projMatrix();
  }

  /**
   * Callback function for the start of a drag event.
   * @param mouse
   */
  public dragStart(mouse: MouseEvent): void {
    if (mouse.offsetY > 600) {
      // outside the main panel
      return;
    }
    this.animation.getScene().meshes[0].printHighlight();
    switch (mouse.buttons) {
      case 1: { //select 
        this.animation.getScene().meshes[0].setSelected();
        break;
      }
      case 2: {
        this.animation.getScene().meshes[0].clearSelected();
        break;
      }
    }
    // get number of currently highlighted bone, if any
    this.dragging = true;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
  }

  public getWallMaxValues(): Float32Array {
    return this.kf.getWallMaxima();
  }

  public getBeamMaxForce(): number {
    return this.kf.getForceMax();
  }

  public incrementTime(dT: number): void {
    if (this.mode === Mode.playback) {
      this.time += dT;
      this.updateAnimation();
      if (this.time >= (this.kf.numKeyframes() - 1) / this.kfps) {
        this.time = 0;
        this.mode = Mode.edit;
        //at end of time, reset pose to match current (working) keyframe
        //this.animation.getScene().meshes[0].setPose(this.kf.current);
      }
    }
  }

  /**
   * Update the current pose of the model to
   */
  public updateAnimation() {
    if (this.getNumKeyFrames() <= 0) {
      return;
    }
    this.animation.getScene().meshes[0].setPose(this.kf.updatePose(this.time, this.kfps));
  }

  public snapToFrame(n: number) {
    if(n<0||n>=this.getNumKeyFrames()){return;}
    this.time = n/this.kfps;
    this.updateAnimation();
  }

  /**
   * The callback function for a drag event.
   * This event happens after dragStart and
   * before dragEnd.
   * @param mouse
   */
  public drag(mouse: MouseEvent): void {
    let x = mouse.offsetX +10;
    let y = mouse.offsetY +10;

    // calculate some info for ray tracing
    let f = this.camera.fov() * Math.PI / 180; //fov says it's in radians but it's lying
    //height of near plane in world coordinates
    let planeheight = 2 * this.camera.zNear() * Math.tan(f/2);
    let planewidth = planeheight * 800.0 / 600.0;
    //relative height
    let relativeheight = planeheight * (((this.viewPortHeight - y)/this.viewPortHeight) - 0.5);
    let relativeright =  planewidth * ((x/this.width) - 0.5);
    let nearplanecenter = Vec3.sum(this.camera.pos(), this.camera.forward().negate().scale(this.camera.zNear())); 
    let nearplanept = Vec3.sum(nearplanecenter, this.camera.up().scale(relativeheight)).add(this.camera.right().scale(relativeright));
    let ray_dir = Vec3.direction(nearplanept,this.camera.pos());

    if (this.dragging) {
      const dx = mouse.screenX - this.prevX;
      const dy = mouse.screenY - this.prevY;
      this.prevX = mouse.screenX;
      this.prevY = mouse.screenY;

      /* Left button, or primary button */
      const mouseDir: Vec3 = this.camera.right();
      mouseDir.scale(-dx);
      mouseDir.add(this.camera.up().scale(dy));
      mouseDir.normalize();

      if (dx === 0 && dy === 0) {
        return;
      }

      switch (mouse.buttons) {
        case 1: {
          let rotAxis: Vec3 = Vec3.cross(this.camera.forward(), mouseDir);
          rotAxis = rotAxis.normalize();
          if (this.fps) {
            this.camera.rotate(rotAxis, GUI.rotationSpeed);
          } else {
            this.camera.orbitTarget(rotAxis, GUI.rotationSpeed);
          } 
          break;
        }
        case 2: {
          /* Right button, or secondary button */
          this.camera.offsetDist(Math.sign(mouseDir.y) * GUI.zoomSpeed);
          break;
        }
        default: {
          break;
        }
      }
    } 
    
    else {
      if(this.animation.getScene().meshes[0] != null){
      this.animation.getScene().meshes[0].raySelect(this.camera.pos(),ray_dir, this.animation.getMworld());
      }

    }
  }

  public getModeString(): string {
    switch (this.mode) {
      case Mode.edit: { return "" + this.getNumKeyFrames() + " keyframes, " + this.getMaxTime().toFixed(2) + " seconds"; }
      case Mode.playback: { return "playback: " + this.getTime().toFixed(2) + " / " + this.getMaxTime().toFixed(2); }
      case Mode.pause: { return "PAUSED: " + this.getTime().toFixed(2) + " / " + this.getMaxTime().toFixed(2); }
    }
  }

  public nodeData(n: number): string[]{
    let ret = [];
    let node = this.animation.getScene().meshes[0].nodes[n];
    ret.push("Node "+node.name);

    let pos = node.pos;
    ret.push("Initial position: ("+pos.x.toFixed(3)+", "+pos.y.toFixed(3)+", "+pos.z.toFixed(3)+")");

    let disps = this.animation.getScene().meshes[0].getNodeTranslations();
    let disp = new Vec3([disps[n*3],disps[n*3 + 1],disps[n*3 + 2]]);
    ret.push("Current displacement: ("+disp.x.toFixed(3)+", "+disp.y.toFixed(3)+", "+disp.z.toFixed(3)+")");

    let c_pos = Vec3.sum(pos,disp);
    ret.push("Current position: ("+c_pos.x.toFixed(3)+", "+c_pos.y.toFixed(3)+", "+c_pos.z.toFixed(3)+")");

    ret.push("");
    ret.push("");
    ret.push("");
    ret.push("");

    return ret;

  }

  public beamData(n: number): string[]{
    let ret = [];
    
    let beam = this.animation.getScene().meshes[0].beams[n];
    let forces = this.animation.getScene().meshes[0].getBeamInfo(n);
    ret.push("Beam "+beam.name);
    ret.push("Connected nodes: "+beam.u+", "+beam.v);
    ret.push("Node "+beam.u);
    ret.push("Net force: "+forces[3]);
    ret.push("Directional forces: ("+forces[0]+", "+forces[1]+", "+forces[2]+")");
    ret.push("Node "+beam.v);
    ret.push("Net force: "+forces[7]);
    ret.push("Directional forces: ("+forces[4]+", "+forces[5]+", "+forces[6]+")");

    return ret;

  }

  public wallData(n: number): string[]{
    let ret = [];
    let wall = this.animation.getScene().meshes[0].walls[n];
    let forces = this.animation.getScene().meshes[0].getWallInfo(n);
    ret.push("Wall "+wall.name);
    ret.push("Nodes: "+wall.nodes);
    ret.push("Net force: "+forces[3]);
    ret.push("Directional forces: ("+forces[0]+", "+forces[1]+", "+forces[2]+")");

    ret.push("");
    ret.push("");
    ret.push("");
    ret.push("");

    return ret;

  }

  /*
   * Get information for currently selected item
   * to display on overlay
   */
  public getSelectionString(): string[] {
    let type = this.animation.getScene().meshes[0].getSelectedType();
    if(type==-1) {return ["click to select an element,","right click to clear.","","","","","",""];}
    else if(type==0) {return this.nodeData(this.animation.getScene().meshes[0].getSelectedNum(0));}
    else if(type==1) {return this.beamData(this.animation.getScene().meshes[0].getSelectedNum(1));}
    else if(type==2) {return this.wallData(this.animation.getScene().meshes[0].getSelectedNum(2));}
  }

  /**
   * Callback function for the end of a drag event
   * @param mouse
   */
  public dragEnd(mouse: MouseEvent): void {
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;
  }

  /**
   * Callback function for a key press event
   * @param key
   */
  public onKeydown(key: KeyboardEvent): void {
    switch (key.code) {
      case "Digit1": {
        this.animation.setScene(1);
        break;
      }
      case "Digit2": {
        this.animation.setScene(2);
        break;
      }
      case "Digit3": {
        this.animation.setScene(3);
        break;
      }      
      case "Digit4": {
        this.animation.setScene(4);
        break;
      }
      case "Digit5": {
        this.animation.setScene(5);
        break;
      }
      case "Digit6": {
        this.animation.setScene(6);
        break;
      }
      case "Digit7": {
        this.animation.setScene(7);
        break;
      }
      case "Digit8": {
        this.animation.setScene(8);
        break;
      }
      case "Digit9": {
        this.animation.setScene(9);
        break;
      }
      case "KeyW": {
        this.camera.offset(
            this.camera.forward().negate(),
            GUI.zoomSpeed,
            true
          );
        break;
      }
      case "KeyA": {
        this.camera.offset(this.camera.right().negate(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyS": {
        this.camera.offset(this.camera.forward(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyD": {
        this.camera.offset(this.camera.right(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyR": {
        this.animation.reset();
        //this.kf.reset();
        break;
      }
      case "KeyC": {
        this.animation.getScene().meshes[0].clearSelected();
        break;
      }
      case "KeyT": {
        if(this.shading==0){
          this.shading=1;
        } else {
          this.shading = 0;
        }
        break;
      }
      case "ArrowLeft": {
        this.camera.roll(GUI.rollSpeed, false);
        break;
      }
      case "ArrowRight": {
        this.camera.roll(GUI.rollSpeed, true);
        break;
      }
      case "ArrowUp": {
        this.camera.offset(this.camera.up(), GUI.zoomSpeed, true);
        break;
      }
      case "ArrowDown": {
        this.camera.offset(this.camera.up().negate(), GUI.zoomSpeed, true);
        break;
      }   
      case "KeyP": {
        if (this.mode === Mode.edit && this.getNumKeyFrames() > 1)
        {
          this.mode = Mode.playback;
          this.time = 0;
        } else if (this.mode === Mode.playback) {
          this.mode = Mode.edit;
        } else if(this.mode === Mode.pause) {
          this.mode = Mode.playback;
        }
        break;
      }
      case "Space": {
        if(this.mode === Mode.playback) {
          this.mode = Mode.pause;
        } else if (this.mode === Mode.pause) {
          this.mode = Mode.playback;
        }
        break;
      }
      case "Equal": {
        if(this.mode === Mode.pause) {
          if( (this.time*this.kfps) %1 <=0.0000000000001 || (this.time*this.kfps) %1 >=0.999999999) {
            this.snapToFrame(Math.round(this.time*this.kfps)+1);
          } else {
            this.snapToFrame(Math.ceil(this.time*this.kfps));
          }
        }
        break;
      }
      case "Minus": {
        if(this.mode === Mode.pause) {
          if( (this.time*this.kfps) %1 <=0.0000000000001  || (this.time*this.kfps) %1 >=0.999999999) {
            this.snapToFrame(Math.round(this.time*this.kfps)-1);
          } else {
            this.snapToFrame(Math.floor(this.time*this.kfps));
          }
        }
        break;
      }
      default: {
        console.log("Key : '", key.code, "' was pressed.");
        break;
      }
    }
  }

  /**
   * Registers all event listeners for the GUI
   * @param canvas The canvas being used
   */
  private registerEventListeners(canvas: HTMLCanvasElement): void {
    /* Event listener for key controls */
    window.addEventListener("keydown", (key: KeyboardEvent) =>
      this.onKeydown(key)
    );

    /* Event listener for mouse controls */
    canvas.addEventListener("mousedown", (mouse: MouseEvent) =>
      this.dragStart(mouse)
    );

    canvas.addEventListener("mousemove", (mouse: MouseEvent) =>
      this.drag(mouse)
    );

    canvas.addEventListener("mouseup", (mouse: MouseEvent) =>
      this.dragEnd(mouse)
    );

    /* Event listener to stop the right click menu */
    canvas.addEventListener("contextmenu", (event: any) =>
      event.preventDefault()
    );
  }
}
