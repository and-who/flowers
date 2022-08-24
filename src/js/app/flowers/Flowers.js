import * as THREE from 'three';
import random from 'random/dist/cjs/index';

import Material from '../components/material';
import Helpers from '../../utils/helpers';
import { BufferGeometryUtils } from '../../utils/bufferGeometryUtils';
import { GLTFLoader } from '../loaders/GLTFLoader';
import Config from '../../data/config';

// Loads in a single object from the config file
export default class Flowers {
  constructor(scene) {
    this.scene = scene;
    this.obj = null;
    this.ref = null;
    this.normalRandom = random.normal(0.5,0.1)
    this.uniformRandom = random.uniform()

    // console.log(this.normalRandom = this.normalRandom.float())
    // console.log(this.normalRandom = this.normalRandom.float())
  }

  load() {
    
    var group = new THREE.Group();
    group.scale.multiplyScalar(20);

    const seed = this.uniformRandom();
    const flowers = this.drawFlowers(seed,4,20)
    //const flower = this.drawFlower("123")
    group.add(flowers)


    this.scene.add( group );
    this.ref = group;
  }

  getMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0,
      roughness: 0.9,
      side: THREE.DoubleSide,
    })
  }

  getPaddelColor(seed=0){
    const colors =[
      new THREE.Color( 1, 0, 0 ),
      new THREE.Color( 1, 0.5, 0 ),
      new THREE.Color( 1, 0, 0.5 ),
      new THREE.Color( 0.5, 0.5, 0 ),
      new THREE.Color( 0.5, 0, 0.5 ),
      new THREE.Color( 0.2, 0.3, 0.3 )
    ]
    const index = Math.floor((seed*colors.length)%colors.length)
    return colors[index];
  }
  getStamColor(seed=0){
    const colors =[
      new THREE.Color( 0.2, 0.6, 0 ),
      new THREE.Color( 0.2, 0.8, 0.6 ),
      new THREE.Color( 0.1, 0.6, 0 ),
      new THREE.Color( 0.1, 0.8, 0.2 ),
      new THREE.Color( 0.1, 0.7, 0 ),
    ]
    const index = Math.floor((seed*colors.length)%colors.length)
    return colors[index];
  }
  getLeaveColor(seed=0){
    const colors =[
      new THREE.Color( 0.2, 1, 0 ),
      new THREE.Color( 0.2, 0.8, 0.1 ),
      new THREE.Color( 0.2, 1, 0 ),
      new THREE.Color( 0.1, 0.8, 0.2 ),
      new THREE.Color( 0.2, 0.7, 0 ),
    ]
    const index = Math.floor((seed*colors.length)%colors.length)
    return colors[index];
  }
  getHeadColor(seed=0){
    const colors =[
      new THREE.Color( 0.5, 0.5, 0 ),
      new THREE.Color( 0.9, 1, 0.1 ),
      new THREE.Color( 0.8, 0.7, 0 ),
    ]
    const index = Math.floor((seed*colors.length)%colors.length)
    return colors[index];
  }

  drawFlowers(seed, width, height){
    const density = 0.3
    const flowers = []
    const flowerDiversity = (width*height)*density
    console.log({flowerDiversity})
    for(let i=0; i < flowerDiversity;i++) {
      const flowerSeed = this.uniformRandom();
      flowers.push(this.drawFlower(flowerSeed));
    }

    flowers.sort((a,b)=> {
      const boundingBoxA = new THREE.Box3().setFromObject( a );
      const boundingBoxB = new THREE.Box3().setFromObject( b );
      return boundingBoxA.max.y - boundingBoxB.max.y 
    })

    var group = new THREE.Group();
    for(let x = -0.9; x<0.9; x=x+density){
      for(let z = -0.9; z<0.9; z=z+density){

        const scale = 1-((Math.max(Math.abs(x),Math.abs(z))))
        const flowerIndex=(Math.floor(scale*flowers.length))%flowers.length
        //console.log({x,z,scale,flowerDiversity, floweerArrayLength:flowers.length,flowerIndex})
        const flower = flowers[flowerIndex].clone()
        flower.rotateY(this.uniformRandom()*Math.PI)
        flower.translateX((x*width/20)+(this.uniformRandom()-0.5))
        flower.translateZ((z*width/20)+(this.uniformRandom()-0.5))

        flower.rotateX(z*Math.PI/3)
        flower.rotateZ(-x*Math.PI/3)

        flower.scale.multiplyScalar((scale*(this.uniformRandom()*0.6))+0.4);
        group.add(flower)
      }
    }
    return group
  }

  drawFlower(seed){
    const group = new THREE.Group();

    const stam = this.drawStam(seed)
    group.add(stam)

    const leave = this.drawLeave(seed)
    leave.scale.multiplyScalar(2);
    leave.scale.y = leave.scale.y*1.5;
    leave.scale.y = leave.scale.x*0.7;
    leave.scale.z = leave.scale.z*0.7;
    group.add(leave)

    return group
  }

  drawStam(seed){
    const group = new THREE.Group();
    const start = new THREE.Vector3( 0, 0, 0 );
    const middle = new THREE.Vector3( 0.4*((this.normalRandom()-1)*2), 3*this.normalRandom(), 0.4*((this.normalRandom()-1)*2) );
    const end = new THREE.Vector3( 0.4*((this.normalRandom()-1)*2), 1+(3*seed), 0.4*((this.normalRandom()-1)*2) );

    const curve = new THREE.QuadraticBezierCurve3(
      start,
      middle,
      end
    );
    
    const geometry = new THREE.TubeBufferGeometry( curve, 6, 0.01+(0.01*seed), 4, false );
    const material = this.getMaterial(this.getStamColor(seed));
    const stam = new THREE.Mesh( geometry, material );
    group.add(stam)

    const up = group.up;

    //Leaves
    const leaveGroup = new THREE.Group();
    const leaveT = 0.2 + (0.5*this.normalRandom())
    const leavePosition = curve.getPointAt(leaveT)
    leaveGroup.position.set( leavePosition.x, leavePosition.y, leavePosition.z);
    const leaveTangent = curve.getTangent(leaveT).normalize();
    const leaveAxis = new THREE.Vector3( );
    leaveAxis.crossVectors( up, leaveTangent ).normalize();
    const leaveRadians = Math.acos( up.dot( leaveTangent ) );
    leaveGroup.quaternion.setFromAxisAngle( leaveAxis, leaveRadians );
    const leaveStam = this.drawLeaveStam(seed)
    leaveGroup.add(leaveStam)
    if(seed < 0.5){
      const secondLeaveStam = leaveStam.clone()
      secondLeaveStam.rotateY(Math.PI+(this.normalRandom()))
      secondLeaveStam.scale.multiplyScalar(1+(this.normalRandom()*0.4));
      leaveGroup.add(secondLeaveStam)
    }

    group.add(leaveGroup)

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set( end.x, end.y, end.z);
    const tangent = curve.getTangent(1).normalize();
    
    const axis = new THREE.Vector3( );
    axis.crossVectors( up, tangent ).normalize();
    const radians = Math.acos( up.dot( tangent ) );
    headGroup.quaternion.setFromAxisAngle( axis, radians );
    const head = this.drawHead(seed)
    headGroup.add(head)
    group.add(headGroup)

    return group
  }

  drawLeaveStam(seed) {

    const group = new THREE.Group();
    const start = new THREE.Vector3( 0, 0, 0 );
    const middle = new THREE.Vector3( 0.05*(this.normalRandom()), 0.05*this.normalRandom(), 0.05*(this.normalRandom()) );
    const end = new THREE.Vector3( 0.1*(this.normalRandom()), 0.2*seed, 0.1*(this.normalRandom()) );

    const curve = new THREE.QuadraticBezierCurve3(
      start,
      middle,
      end
    );
    
    const geometry = new THREE.TubeBufferGeometry( curve, 3, 0.02*seed, 4, false );
    const material = this.getMaterial(this.getStamColor(seed));
    const stam = new THREE.Mesh( geometry, material );
    group.add(stam)

    const leaveGroup = new THREE.Group();
    // Leave
    leaveGroup.position.set( end.x, end.y, end.z);
    const tangent = curve.getTangent(1).normalize();
    const axis = new THREE.Vector3( );
    axis.crossVectors( leaveGroup.up, tangent ).normalize();
    const radians = Math.acos( leaveGroup.up.dot( tangent ) );
    leaveGroup.quaternion.setFromAxisAngle( axis, radians );
    const leave = this.drawLeave(seed)
    leave.rotateY(Math.PI*5/4)
    leave.scale.multiplyScalar(1+(seed*2));
    leaveGroup.add(leave)

    group.add(leaveGroup)


    return group
  }

  drawLeave(seed) {

    const resolution = 4;

    const seed1 = this.normalRandom()
    const seed2 = this.normalRandom()
    const seed3 = this.normalRandom()

    const baseCP0 = new THREE.Vector3( 0, 0, 0 )
    const baseCP1 = new THREE.Vector3( 0.4*seed1 , 0.5*seed2, 0.4*seed3 )
    const baseCP2 = new THREE.Vector3( 0, (seed+seed2)/2, 0 )
    const sideCP0 = baseCP0.clone();
    const sideCP1 = new THREE.Vector3( -0.5*seed2, 0.5*seed3, 0.5*seed1 );
    const sideCP2 = baseCP2.clone();
    const baseCurve = new THREE.QuadraticBezierCurve3(
      baseCP0,
      baseCP1,
      baseCP2
    );

    const sideCurve = new THREE.QuadraticBezierCurve3(
      sideCP0,
      sideCP1,
      sideCP2
    );

    let combinedVertices = []
    const baseVertices = baseCurve.getPoints(resolution)
    const sideVertices = sideCurve.getPoints(resolution)

    combinedVertices = [...baseVertices, ...sideVertices].map(e => [e.x,e.y,e.z]).flat()
    const indices =[]
    for(let i = 0; i<resolution; i++){
      indices.push(i)
      indices.push(i+resolution)
      indices.push(i+1+resolution)

      indices.push(i)
      indices.push(i+1+resolution)
      indices.push(i+1)
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( combinedVertices );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    
    const material = this.getMaterial(this.getLeaveColor(seed));
    const leave = new THREE.Mesh( geometry, material );
    const target = baseCP1.clone().add(sideCP1)
    leave.lookAt( target );
    //leave.rotateY((Math.PI/8))

    return leave
  }

  drawHead(seed){
    const group = new THREE.Group();
    const radius = 0.1*seed
    const geometry = new THREE.DodecahedronBufferGeometry(radius);
    const material = this.getMaterial(this.getLeaveColor(seed));
    const base = new THREE.Mesh( geometry, material );
    base.translateY(-radius)
    group.add(base)

    const tinyLeaveCount = 4 + 10*this.normalRandom()
    const tinyLeave = this.drawLeave(seed)
    const tinyLeaveGeometry = tinyLeave.geometry;
    tinyLeaveGeometry.rotateX(Math.PI*3/5)
    let mergedGeometry = tinyLeaveGeometry.clone();
    for(let i = 0; i < tinyLeaveCount; i++) {
      const subTinyLeaveGeometry = tinyLeaveGeometry.clone()
      subTinyLeaveGeometry.rotateY((Math.PI/(tinyLeaveCount))*i*2)
      mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([mergedGeometry,subTinyLeaveGeometry])
    }

    const tinyLeafMaterial = this.getMaterial(this.getLeaveColor(seed));
    const tinyLeafs= new THREE.Mesh( mergedGeometry, tinyLeafMaterial );
    tinyLeafs.scale.multiplyScalar(seed*0.8);
    group.add(tinyLeafs)

    const paddelGroup = new THREE.Group();
    paddelGroup.translateY(radius)
    const paddleCoreGeometry = new THREE.DodecahedronBufferGeometry(radius);
    const paddleCoreMaterial = this.getMaterial(this.getHeadColor(seed));
    const paddleCore = new THREE.Mesh( paddleCoreGeometry, paddleCoreMaterial );
    paddelGroup.add(paddleCore)
    paddelGroup.translateY(-radius)

    const paddels = this.drawPaddles(seed)
    paddelGroup.add(paddels)

    group.add(paddelGroup)


    return group
  }

  drawPaddles(seed) {
    const group = new THREE.Group();

    const resolution = 4;

    const seed1 = this.uniformRandom()
    const seed2 = this.uniformRandom()
    const seed3 = this.uniformRandom()

    const baseCP0 = new THREE.Vector3( 0, 0, 0 )
    const baseCP1 = new THREE.Vector3( (0.4*seed3)+0.2 , 0.5*seed1, (0.4*seed3)+0.2 )
    const baseCP2 = new THREE.Vector3( 0, seed2+0.2, 0 )

    const sideCP0 = baseCP0.clone();
    const sideCP1 = new THREE.Vector3( -((0.4*seed3)+0.2), 0.5*seed1, (0.4*seed3)+0.2 );
    const sideCP2 = baseCP2.clone();

    const baseCurve = new THREE.QuadraticBezierCurve3(
      baseCP0,
      baseCP1,
      baseCP2
    );

    const sideCurve = new THREE.QuadraticBezierCurve3(
      sideCP0,
      sideCP1,
      sideCP2
    );

    let combinedVertices = []
    const baseVertices = baseCurve.getPoints(resolution)
    const sideVertices = sideCurve.getPoints(resolution)

    combinedVertices = [...baseVertices, ...sideVertices].map(e => [e.x,e.y,e.z]).flat()
    const indices =[]
    for(let i = 0; i<resolution; i++){
      indices.push(i)
      indices.push(i+resolution)
      indices.push(i+1+resolution)

      indices.push(i)
      indices.push(i+1+resolution)
      indices.push(i+1)
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( combinedVertices );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setIndex(indices);
    geometry.computeVertexNormals()
    geometry.rotateX(Math.PI/3)

    const padddelSeed = this.uniformRandom()
    const paddelCount = 5 + (8*padddelSeed)

    let mergedGeometry = geometry;

    for(let i = 1; i < paddelCount; i++) {
      const subPaddelGeometry = geometry.clone()
      subPaddelGeometry.rotateY((Math.PI/(paddelCount))*i*2)
      mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([mergedGeometry,subPaddelGeometry])
    }


    const material = this.getMaterial(this.getPaddelColor(seed));
    const leaves = new THREE.Mesh( mergedGeometry, material );
    // const target = baseCP1.clone().add(sideCP1)
    // leaves.lookAt( target );

    group.add(leaves)

    return group
  }

  unload() {
    this.scene.remove(this.ref);
  }
}
