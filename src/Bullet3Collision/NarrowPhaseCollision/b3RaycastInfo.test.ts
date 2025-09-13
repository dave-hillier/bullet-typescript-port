/**
 * Unit tests for b3RaycastInfo.ts
 * Tests the ray information and ray hit structures
 */

import { b3RayInfo, b3RayHit } from './b3RaycastInfo';
import { b3Vector3 } from '../../Bullet3Common/b3Vector3';

describe('b3RayInfo', () => {
    test('constructor with default parameters', () => {
        const ray = new b3RayInfo();
        expect(ray.m_from.isZero()).toBe(true);
        expect(ray.m_to.isZero()).toBe(true);
    });

    test('constructor with specified parameters', () => {
        const from = new b3Vector3(1, 2, 3);
        const to = new b3Vector3(4, 5, 6);
        const ray = new b3RayInfo(from, to);
        
        expect(ray.m_from.x).toBe(1);
        expect(ray.m_from.y).toBe(2);
        expect(ray.m_from.z).toBe(3);
        expect(ray.m_to.x).toBe(4);
        expect(ray.m_to.y).toBe(5);
        expect(ray.m_to.z).toBe(6);
    });

    test('setRay method', () => {
        const ray = new b3RayInfo();
        const from = new b3Vector3(10, 20, 30);
        const to = new b3Vector3(40, 50, 60);
        
        ray.setRay(from, to);
        
        expect(ray.m_from.x).toBe(10);
        expect(ray.m_from.y).toBe(20);
        expect(ray.m_from.z).toBe(30);
        expect(ray.m_to.x).toBe(40);
        expect(ray.m_to.y).toBe(50);
        expect(ray.m_to.z).toBe(60);
    });

    test('getDirection method', () => {
        const from = new b3Vector3(1, 1, 1);
        const to = new b3Vector3(4, 5, 6);
        const ray = new b3RayInfo(from, to);
        
        const direction = ray.getDirection();
        expect(direction.x).toBe(3);
        expect(direction.y).toBe(4);
        expect(direction.z).toBe(5);
    });

    test('getLength method', () => {
        const from = new b3Vector3(0, 0, 0);
        const to = new b3Vector3(3, 4, 0);
        const ray = new b3RayInfo(from, to);
        
        expect(ray.getLength()).toBe(5);
    });

    test('clone method', () => {
        const from = new b3Vector3(1, 2, 3);
        const to = new b3Vector3(4, 5, 6);
        const ray = new b3RayInfo(from, to);
        const cloned = ray.clone();
        
        expect(cloned.m_from.equals(ray.m_from)).toBe(true);
        expect(cloned.m_to.equals(ray.m_to)).toBe(true);
        
        // Ensure it's a deep copy
        cloned.m_from.setX(100);
        expect(ray.m_from.x).toBe(1);
    });
});

describe('b3RayHit', () => {
    test('constructor with default parameters', () => {
        const hit = new b3RayHit();
        expect(hit.m_hitFraction).toBe(1.0);
        expect(hit.m_hitBody).toBe(-1);
        expect(hit.m_hitResult1).toBe(-1);
        expect(hit.m_hitResult2).toBe(-1);
        expect(hit.m_hitPoint.isZero()).toBe(true);
        expect(hit.m_hitNormal.isZero()).toBe(true);
    });

    test('constructor with specified parameters', () => {
        const hitPoint = new b3Vector3(1, 2, 3);
        const hitNormal = new b3Vector3(0, 1, 0);
        const hit = new b3RayHit(0.5, 42, 10, 20, hitPoint, hitNormal);
        
        expect(hit.m_hitFraction).toBe(0.5);
        expect(hit.m_hitBody).toBe(42);
        expect(hit.m_hitResult1).toBe(10);
        expect(hit.m_hitResult2).toBe(20);
        expect(hit.m_hitPoint.x).toBe(1);
        expect(hit.m_hitPoint.y).toBe(2);
        expect(hit.m_hitPoint.z).toBe(3);
        expect(hit.m_hitNormal.y).toBe(1);
    });

    test('hasHit method', () => {
        const hit1 = new b3RayHit(0.5);
        const hit2 = new b3RayHit(1.0);
        const hit3 = new b3RayHit(1.5);
        const hit4 = new b3RayHit(-0.1);
        
        expect(hit1.hasHit()).toBe(true);
        expect(hit2.hasHit()).toBe(true);
        expect(hit3.hasHit()).toBe(false);
        expect(hit4.hasHit()).toBe(false);
    });

    test('reset method', () => {
        const hitPoint = new b3Vector3(1, 2, 3);
        const hitNormal = new b3Vector3(0, 1, 0);
        const hit = new b3RayHit(0.5, 42, 10, 20, hitPoint, hitNormal);
        
        hit.reset();
        
        expect(hit.m_hitFraction).toBe(1.0);
        expect(hit.m_hitBody).toBe(-1);
        expect(hit.m_hitResult1).toBe(-1);
        expect(hit.m_hitResult2).toBe(-1);
        expect(hit.m_hitPoint.isZero()).toBe(true);
        expect(hit.m_hitNormal.isZero()).toBe(true);
    });

    test('setHit method', () => {
        const hit = new b3RayHit();
        const hitPoint = new b3Vector3(5, 6, 7);
        const hitNormal = new b3Vector3(1, 0, 0);
        
        hit.setHit(0.75, 123, hitPoint, hitNormal, 99, 88);
        
        expect(hit.m_hitFraction).toBe(0.75);
        expect(hit.m_hitBody).toBe(123);
        expect(hit.m_hitResult1).toBe(99);
        expect(hit.m_hitResult2).toBe(88);
        expect(hit.m_hitPoint.x).toBe(5);
        expect(hit.m_hitPoint.y).toBe(6);
        expect(hit.m_hitPoint.z).toBe(7);
        expect(hit.m_hitNormal.x).toBe(1);
    });

    test('clone method', () => {
        const hitPoint = new b3Vector3(1, 2, 3);
        const hitNormal = new b3Vector3(0, 1, 0);
        const hit = new b3RayHit(0.5, 42, 10, 20, hitPoint, hitNormal);
        const cloned = hit.clone();
        
        expect(cloned.m_hitFraction).toBe(hit.m_hitFraction);
        expect(cloned.m_hitBody).toBe(hit.m_hitBody);
        expect(cloned.m_hitResult1).toBe(hit.m_hitResult1);
        expect(cloned.m_hitResult2).toBe(hit.m_hitResult2);
        expect(cloned.m_hitPoint.equals(hit.m_hitPoint)).toBe(true);
        expect(cloned.m_hitNormal.equals(hit.m_hitNormal)).toBe(true);
        
        // Ensure it's a deep copy
        cloned.m_hitPoint.setX(100);
        expect(hit.m_hitPoint.x).toBe(1);
    });

    test('compareTo method', () => {
        const hit1 = new b3RayHit(0.3);
        const hit2 = new b3RayHit(0.7);
        const hit3 = new b3RayHit(0.3);
        
        expect(hit1.compareTo(hit2)).toBeLessThan(0);
        expect(hit2.compareTo(hit1)).toBeGreaterThan(0);
        expect(hit1.compareTo(hit3)).toBe(0);
    });
});