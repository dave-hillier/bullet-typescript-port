// @ts-ignore
import * as THREE from 'three';

// Import physics classes - using relative paths
import { btDefaultCollisionConfiguration } from '../../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import { btCollisionDispatcher } from '../../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btDbvtBroadphase } from '../../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btSequentialImpulseConstraintSolver } from '../../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody, btRigidBodyConstructionInfo } from '../../../src/BulletDynamics/Dynamics/btRigidBody';
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btSphereShape } from '../../../src/BulletCollision/CollisionShapes/btSphereShape';
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';
import { btDefaultMotionState } from '../../../src/LinearMath/btMotionState';

/**
 * HelloWorld Physics Demo
 */
class HelloWorldDemo {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  // Physics world components
  private collisionConfiguration: btDefaultCollisionConfiguration | null = null;
  private dispatcher: btCollisionDispatcher | null = null;
  private broadphase: btDbvtBroadphase | null = null;
  private solver: btSequentialImpulseConstraintSolver | null = null;
  private dynamicsWorld: btDiscreteDynamicsWorld | null = null;

  // Physics bodies and their Three.js counterparts
  private physicsObjects: Array<{
    rigidBody: btRigidBody;
    mesh: THREE.Mesh;
  }> = [];

  // Animation state
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private stepCount: number = 0;

  // UI elements
  private startBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private status: HTMLElement;
  private logOutput: HTMLElement;
  private logs: string[] = [];

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
    this.status = document.getElementById('status') as HTMLElement;
    this.logOutput = document.getElementById('logOutput') as HTMLElement;

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.width / this.canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(15, 10, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.setupEventListeners();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  private setupEventListeners(): void {
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  initPhysics(): void {
    this.log('🔧 Initializing HelloWorld physics...');

    // Create physics world
    this.collisionConfiguration = new btDefaultCollisionConfiguration();
    this.dispatcher = new btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new btDbvtBroadphase();
    this.solver = new btSequentialImpulseConstraintSolver();

    this.dynamicsWorld = new btDiscreteDynamicsWorld(
      this.dispatcher,
      this.broadphase,
      this.solver,
      this.collisionConfiguration
    );

    this.dynamicsWorld.setGravity(new btVector3(0, -10, 0));

    // Create ground and falling sphere
    this.createGround();
    this.createFallingSphere();

    this.log('✅ HelloWorld physics setup complete');
    this.log(`📊 Total objects: ${this.physicsObjects.length}`);
    this.updateStatus('Ready to start');
  }

  private createGround(): void {
    // Physics
    const groundShape = new btBoxShape(new btVector3(50, 50, 50));
    const groundTransform = new btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new btVector3(0, -56, 0));

    const groundMotionState = new btDefaultMotionState(groundTransform);
    const groundRbInfo = new btRigidBodyConstructionInfo(
      0,
      groundMotionState,
      groundShape,
      new btVector3(0, 0, 0)
    );
    const groundBody = new btRigidBody(groundRbInfo);
    this.dynamicsWorld!.addRigidBody(groundBody);

    // Graphics
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0x0044aa });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -56, 0);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: groundBody, mesh });
    this.log('📦 Created ground box (100x100x100) at position (0, -56, 0)');
  }

  private createFallingSphere(): void {
    // Physics
    const sphereShape = new btSphereShape(1.0);
    const startTransform = new btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(new btVector3(2, 10, 0));

    const mass = 1.0;
    const localInertia = new btVector3(0, 0, 0);
    sphereShape.calculateLocalInertia(mass, localInertia);

    const motionState = new btDefaultMotionState(startTransform);
    const rbInfo = new btRigidBodyConstructionInfo(
      mass,
      motionState,
      sphereShape,
      localInertia
    );
    const sphereBody = new btRigidBody(rbInfo);
    this.dynamicsWorld!.addRigidBody(sphereBody);

    // Graphics
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x44aa00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(2, 10, 0);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: sphereBody, mesh });
    this.log('⚽ Created falling sphere (radius=1, mass=1) at position (2, 10, 0)');
  }

  start(): void {
    if (this.isRunning) {
      this.log('⚠️  Simulation already running');
      return;
    }

    this.log('🚀 Starting HelloWorld simulation...');
    this.isRunning = true;
    this.stepCount = 0;
    this.updateStatus('Running simulation...');
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;

    this.runSimulationStep();
  }

  stop(): void {
    if (!this.isRunning) return;

    this.log('⏹️  Simulation stopped');
    this.isRunning = false;
    this.updateStatus('Stopped');
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset(): void {
    this.stop();
    this.log('🔄 Resetting simulation...');

    // Clear graphics
    for (const obj of this.physicsObjects) {
      this.scene.remove(obj.mesh);
    }
    this.physicsObjects = [];

    // Reset physics
    this.exitPhysics();
    this.initPhysics();

    this.stepCount = 0;
    this.updateStatus('Ready to start');
    this.log('✅ Simulation reset complete');
  }

  private runSimulationStep(): void {
    if (!this.isRunning || !this.dynamicsWorld) return;

    // Step physics
    this.dynamicsWorld.stepSimulation(1.0 / 60.0);
    this.stepCount++;

    // Update graphics
    this.syncPhysicsToGraphics();

    // Log positions periodically
    if (this.stepCount % 60 === 0) {
      this.logPositions();
    }

    // Update status
    const seconds = (this.stepCount / 60).toFixed(1);
    this.updateStatus(`Running... (${seconds}s, Step: ${this.stepCount})`);

    // Render
    this.renderer.render(this.scene, this.camera);

    // Continue animation
    this.animationId = requestAnimationFrame(() => {
      this.runSimulationStep();
    });
  }

  private syncPhysicsToGraphics(): void {
    for (const obj of this.physicsObjects) {
      const transform = new btTransform();

      if (obj.rigidBody.getMotionState()) {
        obj.rigidBody.getMotionState()!.getWorldTransform(transform);
      } else {
        transform.assign(obj.rigidBody.getWorldTransform());
      }

      const origin = transform.getOrigin();
      const rotation = transform.getRotation();

      obj.mesh.position.set(origin.x(), origin.y(), origin.z());
      obj.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
  }

  private logPositions(): void {
    this.log(`--- Step ${this.stepCount} ---`);
    for (let i = 0; i < this.physicsObjects.length; i++) {
      const obj = this.physicsObjects[i];
      const pos = obj.mesh.position;
      this.log(`object ${i}: (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`);
    }
  }

  private exitPhysics(): void {
    if (this.dynamicsWorld) {
      for (const obj of this.physicsObjects) {
        this.dynamicsWorld.removeRigidBody(obj.rigidBody);
      }
    }

    this.dynamicsWorld = null;
    this.solver = null;
    this.broadphase = null;
    this.dispatcher = null;
    this.collisionConfiguration = null;
  }

  private log(message: string): void {
    console.log(message);
    this.logs.push(message);
    if (this.logs.length > 50) {
      this.logs.shift();
    }
    this.logOutput.textContent = this.logs.join('\n');
    this.logOutput.scrollTop = this.logOutput.scrollHeight;
  }

  private updateStatus(text: string): void {
    this.status.textContent = text;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize and start the demo
const demo = new HelloWorldDemo();
demo.initPhysics();
demo.render();