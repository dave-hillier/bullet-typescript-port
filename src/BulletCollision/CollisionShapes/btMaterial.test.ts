/*
Bullet Continuous Collision Detection and Physics Library
TypeScript port test suite
*/

import { btMaterial } from './btMaterial';

describe('btMaterial', () => {
    describe('constructor', () => {
        it('should create a material with default constructor', () => {
            const material = new btMaterial();
            
            expect(material).toBeDefined();
            expect(material.m_friction).toBe(0);
            expect(material.m_restitution).toBe(0);
        });

        it('should create a material with specified friction and restitution', () => {
            const friction = 0.7;
            const restitution = 0.3;
            const material = new btMaterial(friction, restitution);
            
            expect(material.m_friction).toBe(friction);
            expect(material.m_restitution).toBe(restitution);
        });
    });

    describe('properties', () => {
        it('should allow modification of friction property', () => {
            const material = new btMaterial(0.5, 0.2);
            const newFriction = 0.8;
            
            material.m_friction = newFriction;
            
            expect(material.m_friction).toBe(newFriction);
        });

        it('should allow modification of restitution property', () => {
            const material = new btMaterial(0.5, 0.2);
            const newRestitution = 0.9;
            
            material.m_restitution = newRestitution;
            
            expect(material.m_restitution).toBe(newRestitution);
        });
    });

    describe('copy and clone', () => {
        it('should copy material properties with static copy method', () => {
            const original = new btMaterial(0.6, 0.4);
            const copy = btMaterial.copy(original);
            
            expect(copy).not.toBe(original); // Different objects
            expect(copy.m_friction).toBe(original.m_friction);
            expect(copy.m_restitution).toBe(original.m_restitution);
        });

        it('should clone material properties with instance clone method', () => {
            const original = new btMaterial(0.6, 0.4);
            const clone = original.clone();
            
            expect(clone).not.toBe(original); // Different objects
            expect(clone.m_friction).toBe(original.m_friction);
            expect(clone.m_restitution).toBe(original.m_restitution);
        });

        it('should create independent copies that can be modified separately', () => {
            const original = new btMaterial(0.5, 0.3);
            const copy = original.clone();
            
            copy.m_friction = 0.9;
            copy.m_restitution = 0.1;
            
            expect(original.m_friction).toBe(0.5);
            expect(original.m_restitution).toBe(0.3);
            expect(copy.m_friction).toBe(0.9);
            expect(copy.m_restitution).toBe(0.1);
        });
    });

    describe('typical physics values', () => {
        it('should handle realistic friction values', () => {
            // Common friction coefficients
            const ice = new btMaterial(0.1, 0.05);
            const rubber = new btMaterial(1.0, 0.8);
            const steel = new btMaterial(0.6, 0.2);
            
            expect(ice.m_friction).toBe(0.1);
            expect(rubber.m_friction).toBe(1.0);
            expect(steel.m_friction).toBe(0.6);
        });

        it('should handle realistic restitution values', () => {
            // Common restitution coefficients
            const clay = new btMaterial(0.7, 0.0);      // No bounce
            const wood = new btMaterial(0.6, 0.3);      // Some bounce
            const rubber = new btMaterial(1.0, 0.9);    // High bounce
            
            expect(clay.m_restitution).toBe(0.0);
            expect(wood.m_restitution).toBe(0.3);
            expect(rubber.m_restitution).toBe(0.9);
        });
    });
});