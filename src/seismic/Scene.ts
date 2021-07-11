import { Mat4, Quat, Vec3 } from "../lib/TSM.js";
import {Element, Node } from "./StructParser.js";


export class Beam {
  public name: string;
  public position: Vec3; 
  public endpoint: Vec3; 
  public initialPosition: Vec3; 
  public initialEndpoint: Vec3; 
  public u: string;
  public v: string;


  constructor(name: string, a: string, b: string, i: Vec3, j: Vec3) {
    this.name = name;
    this.position = i.copy();
    this.endpoint = j.copy();
    this.initialPosition = i.copy();
    this.initialEndpoint = j.copy();
    this.u = a;
    this.v = b;
  }

}

export class Wall {
  public name: string;
  public nodes: string[];
  public triangles: string[];
  public type: string;
  public mat: string;
  public tricount: number;

  constructor(i: string, list: string[]) {
    this.name = i;
    this.nodes = new Array<string>();
    this.tricount = 0;
    list.forEach(n => {this.nodes.push(n);});

    if(list.length<3) {return;}

    if(list.length==4) {
      this.triangles = new Array<string>();
      this.triangles.push(list[0]);
      this.triangles.push(list[2]);
      this.triangles.push(list[1]);
      this.triangles.push(list[0]);
      this.triangles.push(list[1]);
      this.triangles.push(list[2]);

      this.triangles.push(list[0]);
      this.triangles.push(list[3]);
      this.triangles.push(list[2]);
      this.triangles.push(list[0]);
      this.triangles.push(list[2]);
      this.triangles.push(list[3]);

      this.tricount+=4;
      return;
    }

    this.triangles = new Array<string>();
    this.triangles.push(list[0]);
    this.triangles.push(list[2]);
    this.triangles.push(list[1]);
    this.triangles.push(list[0]);
    this.triangles.push(list[3]);
    this.triangles.push(list[2]);

    this.triangles.push(list[0]);
    this.triangles.push(list[1]);
    this.triangles.push(list[5]);
    this.triangles.push(list[0]);
    this.triangles.push(list[5]);
    this.triangles.push(list[4]);

    this.triangles.push(list[6]); 
    this.triangles.push(list[4]); 
    this.triangles.push(list[5]); 
    this.triangles.push(list[7]); 
    this.triangles.push(list[4]); 
    this.triangles.push(list[6]); 

    this.triangles.push(list[2]);
    this.triangles.push(list[3]);
    this.triangles.push(list[7]);
    this.triangles.push(list[2]);
    this.triangles.push(list[7]);
    this.triangles.push(list[6]);

    this.triangles.push(list[1]);
    this.triangles.push(list[2]);
    this.triangles.push(list[6]);
    this.triangles.push(list[1]);
    this.triangles.push(list[6]);
    this.triangles.push(list[5]);

    this.triangles.push(list[3]);
    this.triangles.push(list[0]);
    this.triangles.push(list[4]);
    this.triangles.push(list[3]);
    this.triangles.push(list[4]);
    this.triangles.push(list[7]);

    
    this.tricount += 12;
    return;
  }

}

export class Mesh {
  
  public nodes: Node[];
  public beams: Beam[];
  public walls: Wall[];

  private nodeIndices: number[];
  private nodeIndexAttribute: Float32Array;
  private nodePositions: Float32Array;
  private nodeLookup: {};

  private beamVerts: number[];
  private beamIndices: number[];
  private beamIndexAttribute: Float32Array;

  private wallVerts: number[];
  private wallIndices: number[];
  private wallIndexAttribute: Float32Array;
  private wallNorms: Array<Vec3>;

  private highlighted: number;
  private highlightType: number;
  private selected: number;
  private selectionType: number;
  private current_frame: Keyframe;

  constructor(nodes: Node[], elements: Element[]) {
    //Initialize info for nodes
    this.nodes = nodes;
    this.nodeLookup = {};
    this.nodeIndices = new Array<number>();
    let nodeposarray = new Array<number>();
    for(let i=0; i<nodes.length; i++) {
      this.nodeIndices.push(i);
      this.nodeLookup[nodes[i].name] = i;
      nodeposarray.push(nodes[i].pos.x);
      nodeposarray.push(nodes[i].pos.y);
      nodeposarray.push(nodes[i].pos.z);
    }
    this.nodeIndexAttribute = new Float32Array(this.nodeIndices);
    this.nodePositions = new Float32Array(nodeposarray);

    this.beams = [];
    this.beamVerts = [];
    this.beamIndices = new Array<number>();

    this.walls = new Array<Wall>();
    this.wallVerts = [];
    this.wallNorms = new Array<Vec3>();
    this.wallIndices = new Array<number>();

    //initialize beams and walls
    let beamcount = 0;
    let beamIndexAttr = new Array<number>();
    let wallcount = 0;
    let wallIndexAttr = new Array<number>();
    elements.forEach(beam => {
      if(beam.nodes.length == 2) {
        this.beamVerts.push(this.nodeLookup[beam.i]);
        this.beamVerts.push(this.nodeLookup[beam.j]);
        this.beams.push(new Beam(beam.name, beam.i, beam.j, nodes[this.nodeLookup[beam.i]].pos.copy(), nodes[this.nodeLookup[beam.j]].pos.copy()));
        this.beamIndices.push(this.beamIndices.length);
        this.beamIndices.push(this.beamIndices.length);
        beamIndexAttr.push(beamcount);
        beamIndexAttr.push(beamcount);
        beamcount++;
      } else {
        let w = new Wall(beam.name, beam.nodes);
        this.walls.push(w);
        for(let i=0; i<w.triangles.length; i++) {
          this.wallVerts.push(this.nodeLookup[w.triangles[i]]);
          this.wallIndices.push(this.wallIndices.length);
          wallIndexAttr.push(wallcount);
          if(i%3 == 0) {
            let v0 = this.nodes[this.nodeLookup[w.triangles[i]]].pos;
            let v1 = this.nodes[this.nodeLookup[w.triangles[i+1]]].pos;
            let v2 = this.nodes[this.nodeLookup[w.triangles[i+2]]].pos;
            let norm = Vec3.cross(Vec3.difference(v1, v0), Vec3.difference(v2, v0)).normalize();
            this.wallNorms.push(norm,norm,norm);
          }
        }
        wallcount++;
      } 
    });
    this.beamIndexAttribute = new Float32Array(beamIndexAttr);
    this.wallIndexAttribute = new Float32Array(wallIndexAttr);
    
    this.highlighted = -1;
    this.highlightType = -1;
    this.selected = -1;
    this.selectionType = -1;
  }


  /*
   * Data for rendering
   */

  public getNodeIndices(): Uint32Array {
    return new Uint32Array(this.nodeIndices);
  }

  public getNodePositions(): Float32Array {
    return this.nodePositions;
  }

  public getNodeIndexAttribute(): Float32Array {
    return this.nodeIndexAttribute;
  }

  // Returns displacement of each node
  public getNodeTranslations(): Float32Array {
    let trans = new Float32Array(3 * this.nodes.length);
    if(this.current_frame && this.current_frame.nodeOffsets.length>0) {
      let offsets = this.current_frame.nodeOffsets;
      this.nodes.forEach((node, index) => {
        let res = node.pos.xyz;
        for (let i = 0; i < res.length; i++) {
          trans[3 * index + i] = offsets[3 * index + i];
        }
      }); 
    } else {
      this.nodes.forEach((node, index) => {
        let res = node.pos.xyz;
        for (let i = 0; i < res.length; i++) {
          trans[3 * index + i] = 0;
        }
      });
    }
    return trans;
  }

  public getbeamIndices(): Uint32Array {
    return new Uint32Array(this.beamIndices);
  }

  public getbeamIndicesFloat(): Float32Array {
    return new Float32Array(this.beamIndices);
  }

  public getbeamVertIndices(): Float32Array {
    return new Float32Array(this.beamVerts);
  }

  public getbeamPositions(): Float32Array {
    let trans = new Float32Array(3 * this.beamVerts.length);
    for(let i=0; i<this.beamVerts.length; i++) {
      let res_node = this.nodes[this.beamVerts[i]];
      let res = res_node.pos.xyz;
      trans[3*i] = res[0];
      trans[3*i + 1] = res[1];
      trans[3*i + 2] = res[2];
    }
    return trans;
  }

  public getbeamIndexAttribute(): Float32Array {
    return this.beamIndexAttribute;
  }

  public getBeamForces(): Float32Array {
    let force = new Float32Array(2 * this.beams.length);
    if(this.current_frame && this.current_frame.forces.length>0) {
      let stress = this.current_frame.forces;
      for(let i=0; i<this.beams.length; i++){
        let netf = new Vec3([ Math.abs(stress[6*i]) , Math.abs(stress[6*i + 1]) , Math.abs(stress[6*i + 2])]);
        force[2*i] = netf.length();
        let netf2 = new Vec3([ Math.abs(stress[6*i + 3]) , Math.abs(stress[6*i + 4]) , Math.abs(stress[6*i + 5])]);
        force[2*i + 1] = netf2.length();
      }
    }else {console.log("can't get forces");}
    return force;
  }
 
  public getWallIndices(): Uint32Array {
    return new Uint32Array(this.wallIndices);
  }

  public getWallVertIndices(): Float32Array {
    return new Float32Array(this.wallVerts);
  }

  public getWallIndexAttribute(): Float32Array {
    return this.wallIndexAttribute;
  }

  public getWallPositions(): Float32Array {
    let trans = new Float32Array(3 * this.wallVerts.length);
    for(let i=0; i<this.wallVerts.length; i++) {
      let res_node = this.nodes[this.wallVerts[i]];
      let res = res_node.pos.xyz;
      trans[3*i] = res[0];
      trans[3*i + 1] = res[1];
      trans[3*i + 2] = res[2];
    }
    return trans;
  }

  public getWallNorms(): Float32Array {
    let norms = new Float32Array(3 * this.wallVerts.length);
    this.wallNorms.forEach((norm, index) => {
      let res = norm.xyz;
      for (let i = 0; i < res.length; i++) {
        norms[3 * index + i] = res[i];
      }
    });
    return norms;
  }

  public getWallForces(): Float32Array {
    let force = new Float32Array(4 * this.walls.length);
    if(this.current_frame && this.current_frame.eStrains.length>0) {
      let stress = this.current_frame.eStrains;
      for(let i=0; i<this.walls.length; i++){
        force[4*i] = Math.abs(stress[6*i]);
        force[4*i + 1] = Math.abs(stress[6*i + 1]);
        force[4*i + 2] = Math.abs(stress[6*i + 2]);
        let netf = new Vec3([ Math.abs(stress[6*i]) , Math.abs(stress[6*i + 1]) , Math.abs(stress[6*i + 2])]);
        force[4*i + 3] = netf.length(); 
      }
    }else {console.log("can't get forces");}
    return force;
  }

  public getWallMoment(): Float32Array {
    let mmt = new Float32Array(4 * this.walls.length);
    if(this.current_frame && this.current_frame.eStrains.length>0) {
      let stress = this.current_frame.eStrains;
      for(let i=0; i<this.walls.length; i++){
        mmt[4*i] = Math.abs(stress[6*i + 3]);
        mmt[4*i + 1] = Math.abs(stress[6*i + 4]);
        mmt[4*i + 2] = Math.abs(stress[6*i + 5]);
        let netm = new Vec3([ Math.abs(stress[6*i + 3]) , Math.abs(stress[6*i + 4]) , Math.abs(stress[6*i + 5])]);
        mmt[4*i + 3] = netm.length();
      }
    } 
    return mmt;
  }


  /*
   * Highlighting/Selecting objects
   */

  public setHighlight(h: number, t: number) {
    this.highlighted = h;
    this.highlightType = t;
  }

  public getHighlightNum(t: number): number {
    if(t==this.highlightType) {
      return this.highlighted;
    } else {return -1;}
  }

  public setSelected() {
    if(this.selected==-1 && this.selectionType==-1){
      this.selected = this.highlighted;
      this.selectionType = this.highlightType;
    }
  }

  public clearSelected() {
    this.selected = -1;
    this.selectionType = -1;
  }

  public getSelectedType(): number {
    return this.selectionType;
  }

  public getSelectedNum(t: number): number {
    if(t==this.selectionType) {
      return this.selected;
    } else {return -1;}
  }
  
  /*
   * given global coordinates of ray (origin & direction),
   * highlight the object that the ray is pointing at, if any.
  */
  public raySelect(origin: Vec3, dir: Vec3, tr: Mat4): number {
    let coll_list = [];
    let ind = -1.0;
    let h_type = -1;
    let min_dist = Number.POSITIVE_INFINITY; //large number
    //for each node, beam, and wall
    this.nodes.forEach((node, index) => {
      let d = this.bbIntersect(index, origin, dir,0,tr);
      if(d>0 && d<min_dist){
        min_dist = d;
        ind = index;
        coll_list.push(index);
        h_type = 0;
      }
    });
    this.beams.forEach((beam, index) => {
      let d = this.bbIntersect(index, origin, dir,1,tr);
      if(d>0 && d<min_dist){
        min_dist = d;
        ind = index;
        coll_list.push(index);
        h_type = 1;
      }
    });
    this.walls.forEach((wall, index) => {
      let d = this.bbIntersect(index, origin, dir,2,tr);
      if(d>0 && d<min_dist){
        min_dist = d;
        ind = index;
        coll_list.push(index);
        h_type = 2;
      }
    });
    this.setHighlight(ind, h_type);
    return ind;
  }

  public getCurrentPos(n: Node): Vec3 {
    // position
    let position = n.pos.copy();

    //translation
    if(this.current_frame && this.current_frame.nodeOffsets.length>0) {
      let index = this.nodeLookup[n.name];
      let offsets = this.current_frame.nodeOffsets;
      position = Vec3.sum(position, new Vec3([offsets[3*index], offsets[3*index + 1], offsets[3*index+2]]));
    }
    return position;
  }

  // collision detection with bounding box
  // credit to https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
  public bbIntersect(ind: number, o: Vec3, d: Vec3, t: number, tr: Mat4): number {
    let p1 = new Vec3();
    let p2 = new Vec3();
    let tol = 0.0;
    if (t==0) {
      p1 = this.getCurrentPos(this.nodes[ind]);
      p2 = this.getCurrentPos(this.nodes[ind]);
      tol = 0.3;

    } else if(t==1) {
      p1 = this.getCurrentPos(this.nodes[this.nodeLookup[this.beams[ind].u]]);
      p2 = this.getCurrentPos(this.nodes[this.nodeLookup[this.beams[ind].v]]);
      tol = 0.1;
    } else if(t==2) {
      p1 = new Vec3([Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]);
      p2 = new Vec3([Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]);
      let nodes = this.walls[ind].nodes;
      nodes.forEach((n) => {
        let cp = this.getCurrentPos(this.nodes[this.nodeLookup[n]]);
        p1.x = Math.min(cp.x, p1.x);
        p1.y = Math.min(cp.y, p1.y);
        p1.z = Math.min(cp.z, p1.z);
        p2.x = Math.max(cp.x, p2.x);
        p2.y = Math.max(cp.y, p2.y);
        p2.z = Math.max(cp.z, p2.z);
      });                 
    }
    let tmin = Number.NEGATIVE_INFINITY;
    let tmax = Number.POSITIVE_INFINITY;
    p1 = tr.multiplyVec3(p1);
    p2 = tr.multiplyVec3(p2);
    
    if(d.x != 0) {
      tmin = (Math.min(p1.x, p2.x) - tol - o.x) / d.x; 
      tmax = (Math.max(p1.x, p2.x) + tol - o.x) / d.x;
    } else if (o.x > Math.max(p1.x, p2.x) || o.x < Math.min(p1.x, p2.x)) {
      // x isn't changing and is out of bounds, so there can't be an intersection
      return -1.0;
    }
    if (tmin > tmax) {
      let a = tmin;
      tmin = tmax;
      tmax = a;
    } 

    if(d.y != 0) {
      let tymin = (Math.min(p1.y, p2.y) - tol - o.y) / d.y; 
      let tymax = (Math.max(p1.y, p2.y) + tol - o.y) / d.y;

      if (tymin > tymax) {
        let a = tymin;
        tymin = tymax;
        tymax = a;
      }
      if ((tmin > tymax) || (tymin > tmax)) {
        return -1.0;
      }
      if(tymin > tmin) {tmin = tymin;}
      if(tymax < tmax) {tmax = tymax;}
      
    } else if (o.y > Math.max(p1.y, p2.y) || o.y < Math.min(p1.y, p2.y)) {
      // y isn't changing and is out of bounds, so there can't be a collision
      return -1.0;
    }

    if(d.z != 0) {
      let tzmin = (Math.min(p1.z, p2.z) - tol - o.z) / d.z; 
      let tzmax = (Math.max(p1.z, p2.z) + tol - o.z) / d.z;

      if (tzmin > tzmax) {
        let a = tzmin;
        tzmin = tzmax;
        tzmax = a;
      }

      if ((tmin > tzmax) || (tzmin > tmax)) {
        return -1.0;
      }

      if(tzmin > tmin) {tmin = tzmin;}
      if(tzmax < tmax) {tmax = tzmax;}
      
    } else if (o.z > Math.max(p1.z, p2.z) || o.z < Math.min(p1.z, p2.z)) {
      // z isn't changing and is out of bounds, so there can't be a collision
      return -1.0;
    }

    return tmin;

  }


  public setPose(k: Keyframe) {
    if (k==undefined) {
      return;
    }
    this.current_frame = k;
  }

  public printHighlight() {
    console.log("PRINT HIGHLIGHT");
    console.log("htype: "+this.highlightType);
    console.log("hnum: "+this.highlighted);
    if(this.highlightType >=0 && this.highlighted >=0) {
      switch (this.highlightType) {
        case 0:
          console.log("node "+this.highlighted);
          let n = this.nodes[this.highlighted];
          console.log(n.pos);
          console.log([this.nodePositions[3*this.highlighted],this.nodePositions[3*this.highlighted + 1],this.nodePositions[3*this.highlighted + 2]]);
          console.log(this.getCurrentPos(n));
          if(this.current_frame && this.current_frame.nodeOffsets.length>0) {
            let index = this.highlighted;
            let offsets = this.current_frame.nodeOffsets;
            let offset =  new Vec3([offsets[3*index], offsets[3*index + 1], offsets[3*index+2]]);
            console.log("offset");
            console.log(offset);
          }
          break;
        case 1:
          console.log("beam "+this.highlighted);
          break;
        case 2:
          console.log("wall "+this.highlighted);
          console.log("triangles: ");
          console.log(this.walls[this.highlighted].triangles);
          let ind = this.highlighted * 36;
          console.log([this.wallNorms[ind+12], this.wallNorms[ind+13], this.wallNorms[ind+14]]);
          console.log([this.wallNorms[ind+15], this.wallNorms[ind+16], this.wallNorms[ind+17]]);
          break;
        default:
          console.log("print highlight failed :(");
          break;
      }

    }
  }

  /* get info about current state of beam n
   * used to put text on overlay
  */
  public getBeamInfo(n: number): string[] {
    let ret = new Array<string>();
    let beam = this.beams[n];

    let stress = this.current_frame.forces;

    ret.push(Math.abs(stress[6*n]).toFixed(3));
    ret.push(Math.abs(stress[6*n + 1]).toFixed(3));
    ret.push(Math.abs(stress[6*n + 2]).toFixed(3));

    let netf = new Vec3([ Math.abs(stress[6*n]) , Math.abs(stress[6*n + 1]) , Math.abs(stress[6*n + 2])]);
    ret.push(netf.length().toFixed(3));

    ret.push(Math.abs(stress[6*n + 3]).toFixed(3));
    ret.push(Math.abs(stress[6*n + 4]).toFixed(3));
    ret.push(Math.abs(stress[6*n + 5]).toFixed(3));
    let netf2 = new Vec3([ Math.abs(stress[6*n + 3]) , Math.abs(stress[6*n + 4]) , Math.abs(stress[6*n + 5])]);
    ret.push(netf2.length().toFixed(3));
    
    return ret;
  }

  /* get info about current state of wall n
   * used to put text on overlay
  */
  public getWallInfo(n: number): string[] {
    let ret = new Array<string>();
    let stress = this.current_frame.eStrains;

    ret.push(Math.abs(stress[6*n]).toFixed(3));
    ret.push(Math.abs(stress[6*n + 1]).toFixed(3));
    ret.push(Math.abs(stress[6*n + 2]).toFixed(3));
    let netf = new Vec3([ Math.abs(stress[6*n]) , Math.abs(stress[6*n + 1]) , Math.abs(stress[6*n + 2])]);
    ret.push(netf.length().toFixed(3)); 

    return ret;
  }

  public getCurrentTime(): number {
    return this.current_frame.time;
  }

  
}

export class KeyframeHandler {
  public frames: Keyframe[];
  public current: Keyframe;
  public pose_indices: number[];
  public pose_rotations: Quat[];
  public pose_offsets: number[];
  public pose_timestamp: number;
  public pose_stress: number[];
  public pose_forces: number[];
  public max_stress: number;
  public max_moment: number;
  public max_force: number;
  public max_time: number;

  constructor() {
    this.current = new Keyframe();
    this.frames = [];
    this.pose_indices = [];
    this.pose_rotations = [];
    this.pose_offsets = [];
    this.pose_forces = [];
    this.pose_timestamp = -1;
    this.max_stress = Number.NEGATIVE_INFINITY;
    this.max_moment = Number.NEGATIVE_INFINITY;
    this.max_force = Number.NEGATIVE_INFINITY;
    this.max_time = Number.NEGATIVE_INFINITY;
  }

  public loadData(times: number[], nodes: Array<number[]>, wallf: Array<number[]>, beamf: Array<number[]>) {
    for(let i=0; i<times.length; i++){
      this.pushFrame(times[i], nodes[i], (wallf.length==0?[]:wallf[i]), (beamf.length==0?[]:beamf[i]));
    }
  }

  //adds current frame to list, creates new frame
  public addFrame() {
    this.frames.push(this.current);
    this.current = new Keyframe();
  }

  public copyToCurrent(i: number) {
    if(i<0 || i>=this.frames.length) {
      console.log("ERR: can't copy to current, invalid frame "+i+". max frames: "+this.frames.length);
    }
    let frame = this.frames[i];
    let clonedData = Object.assign([],frame.nodeOffsets);
    let clonedStrain = Object.assign([],frame.eStrains);
    let clonedForces = Object.assign([],frame.forces);
    this.current.set(frame.time, clonedData, clonedStrain, clonedForces);
  }

  public numKeyframes() {
    return this.frames.length;
  }

  public reset() {
    this.current = new Keyframe();
    this.frames = [];
    this.pose_indices = [];
    this.pose_rotations = [];
    this.pose_offsets = [];
    this.pose_stress = [];
    this.pose_forces = [];
    this.pose_timestamp = -1;
    this.max_time = Number.NEGATIVE_INFINITY;
    this.max_stress = Number.NEGATIVE_INFINITY;
    this.max_moment = Number.NEGATIVE_INFINITY;
    this.max_force = Number.NEGATIVE_INFINITY;
  }

  public pushFrame(t: number, n: number[], e: number[], f: number[]) {
    this.frames.push(new Keyframe(t,n,e,f));
    this.max_time = Math.max(this.max_time,t);
    this.updateMaxValues(e,f);
  }

  public set(t: number, data: number[], strains: number[], forces: number[]) {
    this.current.set(t, data, strains, forces);
    this.updateMaxValues(strains, forces);
  }

  public updatePose(t: number, kfps: number): Keyframe {

    if(t==undefined) {
      console.log("TIME UNDEFINED");
      return;
    }

    // clear last pose
    this.pose_indices = [];
    this.pose_rotations = [];
    this.pose_offsets = [];
    this.pose_stress = [];
    this.pose_forces = [];

    // check that time is valid,
    // valid time is one we have corresponding keyframes for
    if(t<0) {
      console.log("ERROR: invalid time");
      return;
    }
    
    if(t>((this.frames.length - 1)/kfps)) {
      console.log("ERROR: invalid time");
      return this.frames[this.frames.length-1];
    }
    console.log(t);
    console.log(t*kfps);
    console.log(this.max_time);
    console.log(this.frames.length);

    let before = this.frames[Math.floor(t*kfps)];
    let after = this.frames[Math.min(this.frames.length-1, Math.ceil(t*kfps))];
    let framelen = 1.0/kfps;
    let dt = t - Math.floor(t*kfps)*framelen;

    this.pose_timestamp = before.time + dt*(after.time-before.time);
    let pos = [];
    let str = [];
    let fcs = [];
    if(before.nodeOffsets.length!=after.nodeOffsets.length 
      || before.eStrains.length!=after.eStrains.length 
      ||before.forces.length!=after.forces.length) {
      console.log("incompatible keyframes, can't interpolate. "+Math.floor(t)+", "+Math.ceil(t));
      return;
    }
    for(let i=0; i<before.nodeOffsets.length; i++) {
      pos.push(before.nodeOffsets[i]+(dt*(after.nodeOffsets[i]-before.nodeOffsets[i])));
    }
    for(let i=0; i<after.eStrains.length; i++) {
      str.push(before.eStrains[i]+(dt*(after.eStrains[i]-before.eStrains[i])));
    }
    for(let i=0; i<after.forces.length; i++) {
      fcs.push(before.forces[i]+(dt*(after.forces[i]-before.forces[i])));
    }
    this.pose_offsets = pos;
    this.pose_stress = str;
    this.pose_forces = fcs;

    return new Keyframe(this.pose_timestamp, this.pose_offsets, this.pose_stress, this.pose_forces);
  }

  public updateMaxValues(str: number[], force: number[]){
    for(let i=0; i<str.length; i+=6){
      let str_vec = new Vec3([str[i], str[i+1], str[i+2]]);
      this.max_stress = Math.max(this.max_stress, str_vec.length() );
      let mo_vec = new Vec3([str[i+3], str[i+4], str[i+5]]);
      this.max_moment = Math.max(this.max_moment, mo_vec.length());
    }
    for(let i=0; i<force.length; i+=3){
      let f_vec = new Vec3([force[i], force[i+1], force[i+2]]);
      this.max_force = Math.max(this.max_force, f_vec.length());
    }
  }

  public getMaxTime(): number {
    return this.max_time;
  }

  public getWallMaxima():Float32Array {
    return new Float32Array([this.max_stress, this.max_moment]);
  }

  public getForceMax(): number {
    return this.max_force;
  }

  
}

export class Keyframe {
  public rotations: Quat[];
  public beamIndices: number[];
  public meshOffset: Vec3;
  public time: number;
  public nodeOffsets: number[];
  public eStrains: number[];
  public forces: number[];

  constructor(t?: number, n?: number[], e?: number[], f?: number[]) {
    this.rotations = [];
    this.beamIndices = [];
    this.meshOffset  = new Vec3([0,0,0]);
    this.time = -1;
    this.nodeOffsets = [];
    this.eStrains = [];
    this.forces = [];
    if(t) {this.time = t;}
    if(n) {this.nodeOffsets = n;}
    if(e) {this.eStrains = e;}
    if(f) {this.forces = f;}
  }

  public set(t: number, offsets: number[], strains: number[], forces: number[]) {
    this.time = t;
    this.nodeOffsets = offsets;
    this.eStrains = strains;
    this.forces = forces;
  }
}