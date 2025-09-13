/*
btQuaternion demonstration showing basic quaternion operations
This demonstrates the key functionality of the TypeScript port
*/

import { btQuaternion, btQuatRotate, btShortestArcQuat, btSlerp } from '../src/LinearMath/btQuaternion';
import { btVector3 } from '../src/LinearMath/btVector3';
import { SIMD_PI } from '../src/LinearMath/btScalar';

console.log('btQuaternion TypeScript Port Demonstration');
console.log('==========================================\n');

// 1. Basic Construction
console.log('1. Basic Construction:');
const identity = btQuaternion.getIdentity();
console.log(`Identity quaternion: [${identity.x()}, ${identity.y()}, ${identity.z()}, ${identity.w()}]`);

const axisAngle = new btQuaternion(new btVector3(0, 0, 1), SIMD_PI / 2); // 90° around Z-axis
console.log(`90° rotation around Z-axis: [${axisAngle.x().toFixed(3)}, ${axisAngle.y().toFixed(3)}, ${axisAngle.z().toFixed(3)}, ${axisAngle.w().toFixed(3)}]`);

// 2. Vector Rotation
console.log('\n2. Vector Rotation:');
const testVector = new btVector3(1, 0, 0); // X-axis unit vector
const rotatedVector = btQuatRotate(axisAngle, testVector);
console.log(`Original vector: [${testVector.x()}, ${testVector.y()}, ${testVector.z()}]`);
console.log(`After 90° Z rotation: [${rotatedVector.x().toFixed(3)}, ${rotatedVector.y().toFixed(3)}, ${rotatedVector.z().toFixed(3)}]`);
console.log(`Expected: [0, 1, 0] (X-axis becomes Y-axis)`);

// 3. Quaternion Multiplication (Composition)
console.log('\n3. Quaternion Composition:');
const rotX90 = new btQuaternion(new btVector3(1, 0, 0), SIMD_PI / 2); // 90° around X
const rotY90 = new btQuaternion(new btVector3(0, 1, 0), SIMD_PI / 2); // 90° around Y
const combined = rotY90.multiplyQuaternion(rotX90); // Apply X rotation, then Y rotation
console.log(`90° X rotation: [${rotX90.x().toFixed(3)}, ${rotX90.y().toFixed(3)}, ${rotX90.z().toFixed(3)}, ${rotX90.w().toFixed(3)}]`);
console.log(`90° Y rotation: [${rotY90.x().toFixed(3)}, ${rotY90.y().toFixed(3)}, ${rotY90.z().toFixed(3)}, ${rotY90.w().toFixed(3)}]`);
console.log(`Combined rotation: [${combined.x().toFixed(3)}, ${combined.y().toFixed(3)}, ${combined.z().toFixed(3)}, ${combined.w().toFixed(3)}]`);

const testVector2 = new btVector3(0, 0, 1); // Z-axis
const finalResult = btQuatRotate(combined, testVector2);
console.log(`Z-axis after combined rotation: [${finalResult.x().toFixed(3)}, ${finalResult.y().toFixed(3)}, ${finalResult.z().toFixed(3)}]`);

// 4. Shortest Arc Rotation
console.log('\n4. Shortest Arc Rotation:');
const from = new btVector3(1, 0, 0); // X-axis
const to = new btVector3(0, 1, 0);   // Y-axis
const shortestArc = btShortestArcQuat(from, to);
console.log(`Shortest rotation from X to Y: [${shortestArc.x().toFixed(3)}, ${shortestArc.y().toFixed(3)}, ${shortestArc.z().toFixed(3)}, ${shortestArc.w().toFixed(3)}]`);

const verifyRotation = btQuatRotate(shortestArc, from);
console.log(`Verification - X rotated to: [${verifyRotation.x().toFixed(3)}, ${verifyRotation.y().toFixed(3)}, ${verifyRotation.z().toFixed(3)}]`);
console.log(`Expected: [0, 1, 0]`);

// 5. Spherical Linear Interpolation (Slerp)
console.log('\n5. Spherical Linear Interpolation:');
const q1 = btQuaternion.getIdentity(); // No rotation
const q2 = new btQuaternion(new btVector3(0, 0, 1), SIMD_PI / 2); // 90° around Z

console.log('Interpolating between identity and 90° Z rotation:');
for (let t = 0; t <= 1.0; t += 0.25) {
    const interpolated = btSlerp(q1, q2, t);
    const angle = interpolated.getAngle() * 180 / SIMD_PI; // Convert to degrees
    console.log(`t=${t.toFixed(2)}: angle=${angle.toFixed(1)}°`);
}

// 6. Euler Angles
console.log('\n6. Euler Angles:');
const euler = new btQuaternion(SIMD_PI / 6, SIMD_PI / 4, SIMD_PI / 3); // 30°, 45°, 60°
console.log(`From Euler (30°, 45°, 60°): [${euler.x().toFixed(3)}, ${euler.y().toFixed(3)}, ${euler.z().toFixed(3)}, ${euler.w().toFixed(3)}]`);

const yaw = { value: 0 };
const pitch = { value: 0 };
const roll = { value: 0 };
euler.getEulerZYX(yaw, pitch, roll);
console.log(`Back to Euler: (${(yaw.value * 180 / SIMD_PI).toFixed(1)}°, ${(pitch.value * 180 / SIMD_PI).toFixed(1)}°, ${(roll.value * 180 / SIMD_PI).toFixed(1)}°)`);

// 7. Mathematical Properties
console.log('\n7. Mathematical Properties:');
const q = new btQuaternion(1, 2, 3, 4).normalized();
const inverse = q.inverse();
const product = q.multiplyQuaternion(inverse);
console.log(`Unit quaternion: [${q.x().toFixed(3)}, ${q.y().toFixed(3)}, ${q.z().toFixed(3)}, ${q.w().toFixed(3)}]`);
console.log(`Its inverse: [${inverse.x().toFixed(3)}, ${inverse.y().toFixed(3)}, ${inverse.z().toFixed(3)}, ${inverse.w().toFixed(3)}]`);
console.log(`q * q^-1: [${product.x().toFixed(6)}, ${product.y().toFixed(6)}, ${product.z().toFixed(6)}, ${product.w().toFixed(6)}]`);
console.log('Expected: [0, 0, 0, 1] (identity)');

console.log('\nDemonstration completed successfully!');