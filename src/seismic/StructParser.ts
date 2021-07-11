import { Vec3 } from "../lib/tsm/Vec3.js";
import { Mat4, Vec4 } from "../lib/TSM.js";
import { Quat } from "../lib/tsm/Quat.js";
import { Mesh } from "./Scene.js";

import {ex1data} from "./static/static/assets/ex1/struct.js"
import {ex1node} from "./static/static/assets/ex1/nodedata.js"
import {ex1beam} from "./static/static/assets/ex1/elemdata.js"

import {ex2data} from "./static/static/assets/ex2/struct.js"
import {ex2node} from "./static/static/assets/ex2/nodedata.js"
import {ex2beam} from "./static/static/assets/ex2/elemdata.js"

import {ex3data} from "./static/static/assets/ex3/struct.js"
import {ex3node} from "./static/static/assets/ex3/nodedata.js"
import {ex3beam} from "./static/static/assets/ex3/elemdata.js"

import {ex4data} from "./static/static/assets/ex4/struct.js"
import {ex4node} from "./static/static/assets/ex4/nodedata.js"
import {ex4beam} from "./static/static/assets/ex4/elemdata.js"

import {ex5data} from "./static/static/assets/ex5/struct.js"
import {ex5node} from "./static/static/assets/ex5/nodedata.js"
import {ex5beam} from "./static/static/assets/ex5/elemdata.js"

import {ex6data} from "./static/static/assets/ex6/struct.js"
import {ex6node} from "./static/static/assets/ex6/nodedata.js"
import {ex6beam} from "./static/static/assets/ex6/elemdata.js"
import {ex6elem} from "./static/static/assets/ex6/elemdata.js"

import {ex7data} from "./static/static/assets/ex7/struct.js"
import {ex7node} from "./static/static/assets/ex7/nodedata.js"
import {ex7elem} from "./static/static/assets/ex7/elemdata.js"

import {ex8data} from "./static/static/assets/ex8/struct.js"
import {ex8node} from "./static/static/assets/ex8/nodedata.js"
import {ex8elem} from "./static/static/assets/ex8/elemdata.js"

import {ex9data} from "./static/static/assets/ex9/struct.js"
import {ex9node} from "./static/static/assets/ex9/nodedata.js"
import {ex9elem} from "./static/static/assets/ex9/elemdata.js"


export class Node {
  public name: string;
  public pos: Vec3;

  constructor(n:string, pos: Vec3) {
    this.name=n;
    this.pos=pos;
  }
}

export class Element {
  public name: string;
  public type: string;
  public nodes: string[];
  public i: string;
  public j: string;

  constructor(n:string, t: string, nod: number[]) {
    this.name=n;
    this.type=t;
    this.i = nod[0].toString();
    this.j = nod[1].toString();
    this.nodes = [];
    for(let i=0; i<nod.length; i++) {
      this.nodes.push(nod[i].toString());
    }
  }
}

class SLoader {
  public nodes: Node[];
  public elements: Element[];
  public meshes: Mesh[];
  public struct;
  private frameStart: number;
  private modelno: number;

  constructor(model: number) {
    this.meshes = [];
    this.elements = [];
    this.modelno = model;

    //data switch
    switch(this.modelno) {
      case 1: {
        this.struct = JSON.parse(ex1data).StructuralAnalysisModel;
        break;
      }
      case 2: {
        this.struct = JSON.parse(ex2data).StructuralAnalysisModel;
        break;
      }
      case 3: {
        this.struct = JSON.parse(ex3data).StructuralAnalysisModel;
        break;
      }
      case 4: {
        this.struct = JSON.parse(ex4data).StructuralAnalysisModel;
        break;
      }
      case 5: {
        this.struct = JSON.parse(ex5data).StructuralAnalysisModel;
        break;
      }
      case 6: {
        this.struct = JSON.parse(ex6data).StructuralAnalysisModel;
        break;
      }
      case 7: {
        this.struct = JSON.parse(ex7data).StructuralAnalysisModel;
        break;
      }
      case 8: {
        this.struct = JSON.parse(ex8data).StructuralAnalysisModel;
        break;
      }
      case 9: {
        this.struct = JSON.parse(ex9data).StructuralAnalysisModel;
        break;
      }
      default: {
        console.log("model not found");
      }
    }

    this.nodes = new Array<Node>();
    for(let i=0; i<this.struct.geometry.nodes.length; i++) {
      let n = this.struct.geometry.nodes[i];
      if(n.crd.length==2) {
        this.nodes.push(new Node(n.name.toString(), new Vec3([n.crd[0], n.crd[1], 0.0])));
      } else {
        this.nodes.push(new Node(n.name.toString(), new Vec3([n.crd[0], n.crd[1], n.crd[2]])));
      }
    }

    this.elements = new Array<Element>();
    for(let i=0; i<this.struct.geometry.elements.length; i++) {
      let e = this.struct.geometry.elements[i];
      this.elements.push(new Element(e.name.toString(), e.type, e.nodes));
    }

    this.meshes[0] = new Mesh(this.nodes, this.elements);
  }

  public initFrames(): number[] {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 1: {
        data = ex1node.split(/\r?\n/);
        break;
      }
      case 2: {
        data = ex2node.split(/\r?\n/);
        break;
      }
      case 3: {
        data = ex3node.split(/\r?\n/);
        break;
      }
      case 4: {
        data = ex4node.split(/\r?\n/);
        break;
      }
      case 5: {
        data = ex5node.split(/\r?\n/);
        break;
      }
      case 6: {
        data = ex6node.split(/\r?\n/);
        break;
      }
      case 7: {
        data = ex7node.split(/\r?\n/);
        break;
      }
      case 8: {
        data = ex8node.split(/\r?\n/);
        break;
      }
      case 9: {
        data = ex9node.split(/\r?\n/);
        break;
      }
      default: {
        console.log("model not found");
      }
    }
    
    let frames = new Array<string>();

    //get index of first line of data
    let start=0;
    for(let i=0; i<data.length; i++){
      let f = data[i].split(' ');
      if(f.length>1) {
        frames.push(f[0]);
      } else if (frames.length==0) {
        start = i+1;
      }
    }
    this.frameStart = start;

    return frames.map(Number);
  }

  /*
   * Get node displacements
   */
  public getNodeData(): Array<number[]> {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 1: {
        data = ex1node.split(/\r?\n/);
        break;
      }
      case 2: {
        data = ex2node.split(/\r?\n/);
        break;
      }
      case 3: {
        data = ex3node.split(/\r?\n/);
        break;
      }
      case 4: {
        data = ex4node.split(/\r?\n/);
        break;
      }
      case 5: {
        data = ex5node.split(/\r?\n/);
        break;
      }
      case 6: {
        data = ex6node.split(/\r?\n/);
        break;
      }
      case 7: {
        data = ex7node.split(/\r?\n/);
        break;
      }
      case 8: {
        data = ex8node.split(/\r?\n/);
        break;
      }
      case 9: {
        data = ex9node.split(/\r?\n/);
        break;
      }
      default: {
        console.log("model not found");
      }
    }

    let ret = new Array<number[]>();
    for(let i=this.frameStart; i<data.length; i++) {
      let frame = data[i];
      let x = frame.split(' ').map(Number)
      x.shift();
      ret.push(x);
    }
    return ret;
  }

  /*
   * Get forces on walls 
   */
  public getWallData(): Array<number[]> {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 0: {
        return [];
      }
      case 1: {
        return [];
      }
      case 2: {
        return [];
      }
      case 3: {
        return [];
      }
      case 4: {
        return [];
      }
      case 5: {
        return [];
      }
      case 6: {
        data = ex6elem.split(/\r?\n/);
        break;
      }
      case 7: {
        data = ex7elem.split(/\r?\n/);
        break;
      }
      case 8: {
        data = ex8elem.split(/\r?\n/);
        break;
      }
      case 9: {
        data = ex9elem.split(/\r?\n/);
        break;
      }
      default: {
        console.log("model not found");
      }
    }
 
    let ret = new Array<number[]>();
    for(let i=this.frameStart; i<data.length; i++) {
      let frame = data[i];
      let x = frame.split(' ').map(Number)
      x.shift();
      ret.push(x);
    }
    return ret;
    
  }
  
  /*
   * Get forces on beams 
   */
  public getBeamData(): Array<number[]> {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 1: {
        data = ex1beam.split(/\r?\n/);
        break;
      }
      case 2: {
        data = ex2beam.split(/\r?\n/);
        break;
      }
      case 3: {
        data = ex3beam.split(/\r?\n/);
        break;
      }
      case 4: {
        data = ex4beam.split(/\r?\n/);
        break;
      }
      case 5: {
        data = ex5beam.split(/\r?\n/);
        break;
      }
      case 6: {
        data = ex6beam.split(/\r?\n/);
        break;
      }
      case 7: {
        return [];
      }
      case 8: {
        return [];
      }
      case 9: {
        return [];
      }
      default: {
        console.log("model not found");
      }
    }

    let ret = new Array<number[]>();
    for(let i=this.frameStart; i<data.length; i++) {
      let frame = data[i];
      let x = frame.split(' ').map(Number)
      x.shift();
      ret.push(x);
    }
    return ret;
  }



  /*
   * Get node displacements for frame i
   */
  public getFrameNodeData(i: number): number[] {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 1: {
        data = ex1node.split(/\r?\n/);
        break;
      }
      case 2: {
        data = ex2node.split(/\r?\n/);
        break;
      }
      case 3: {
        data = ex3node.split(/\r?\n/);
        break;
      }
      case 4: {
        data = ex4node.split(/\r?\n/);
        break;
      }
      case 5: {
        data = ex5node.split(/\r?\n/);
        break;
      }
      case 6: {
        data = ex6node.split(/\r?\n/);
        break;
      }
      case 7: {
        data = ex7node.split(/\r?\n/);
        break;
      }
      case 8: {
        data = ex8node.split(/\r?\n/);
        break;
      }
      case 9: {
        data = ex9node.split(/\r?\n/);
        break;
      }
      default: {
        console.log("model not found");
      }
    }

    let frame = data[i+this.frameStart];
    let x = frame.split(' ').map(Number);
    x.shift();
    return x;
  }

  /*
   * Get forces on walls for frame i
   */
  public getFrameWallData(i: number): number[] {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 0: {
        return [];
      }
      case 1: {
        return [];
      }
      case 2: {
        return [];
      }
      case 3: {
        return [];
      }
      case 4: {
        return [];
      }
      case 5: {
        return [];
      }
      case 6: {
        data = ex6elem.split(/\r?\n/);
        break;
      }
      case 7: {
        data = ex7elem.split(/\r?\n/);
        break;
      }
      case 8: {
        data = ex8elem.split(/\r?\n/);
        break;
      }
      case 9: {
        data = ex9elem.split(/\r?\n/);
        break;
      }
      default: {
        console.log("model not found");
      }
    }
 
    let frame = data[i+this.frameStart];
    let x = frame.split(' ').map(Number);
    x.shift();
    return x;
    
  }

  /*
   * Get forces on beams for frame i
   */
  public getFrameBeamData(i: number): number[] {
    let data = [];
    //data switch
    switch(this.modelno) {
      case 1: {
        data = ex1beam.split(/\r?\n/);
        break;
      }
      case 2: {
        data = ex2beam.split(/\r?\n/);
        break;
      }
      case 3: {
        data = ex3beam.split(/\r?\n/);
        break;
      }
      case 4: {
        data = ex4beam.split(/\r?\n/);
        break;
      }
      case 5: {
        data = ex5beam.split(/\r?\n/);
        break;
      }
      case 6: {
        data = ex6beam.split(/\r?\n/);
        break;
      }
      case 7: {
        return [];
      }
      case 8: {
        return [];
      }
      case 9: {
        return [];
      }
      default: {
        console.log("model not found");
      }
    }

    let frame = data[i+this.frameStart];
    let x = frame.split(' ').map(Number);
    x.shift(); //first element is timestamp
    return x;
  }
}

export {
  SLoader as SLoader,
};