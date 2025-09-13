/**
 * Test suite for b3Contact4 class
 * Verifies contact data management and utility functions
 */

import { b3Contact4 } from './b3Contact4';
import { b3Vector3 } from '../../Bullet3Common/b3Vector3';

describe('b3Contact4', () => {
    let contact: b3Contact4;

    beforeEach(() => {
        contact = new b3Contact4();
    });

    describe('Body ID Management', () => {
        test('should handle positive body IDs correctly', () => {
            contact.m_bodyAPtrAndSignBit = 5;
            contact.m_bodyBPtrAndSignBit = 10;

            expect(contact.getBodyA()).toBe(5);
            expect(contact.getBodyB()).toBe(10);
            expect(contact.isBodyAFixed()).toBe(false);
            expect(contact.isBodyBFixed()).toBe(false);
        });

        test('should handle negative body IDs (fixed bodies) correctly', () => {
            contact.m_bodyAPtrAndSignBit = -5;
            contact.m_bodyBPtrAndSignBit = -10;

            expect(contact.getBodyA()).toBe(5);
            expect(contact.getBodyB()).toBe(10);
            expect(contact.isBodyAFixed()).toBe(true);
            expect(contact.isBodyBFixed()).toBe(true);
        });

        test('should detect invalid contacts', () => {
            contact.m_bodyAPtrAndSignBit = 0;
            contact.m_bodyBPtrAndSignBit = 5;
            expect(contact.isInvalid()).toBe(true);

            contact.m_bodyAPtrAndSignBit = 5;
            contact.m_bodyBPtrAndSignBit = 0;
            expect(contact.isInvalid()).toBe(true);

            contact.m_bodyAPtrAndSignBit = 5;
            contact.m_bodyBPtrAndSignBit = 10;
            expect(contact.isInvalid()).toBe(false);
        });
    });

    describe('Batch Index Management', () => {
        test('should get and set batch index correctly', () => {
            expect(contact.getBatchIdx()).toBe(0);
            
            contact.setBatchIdx(42);
            expect(contact.getBatchIdx()).toBe(42);
        });
    });

    describe('Coefficient Management', () => {
        test('should handle restitution coefficient correctly', () => {
            // Test setting and getting restitution coefficient
            contact.setRestituitionCoeff(0.5);
            expect(contact.getRestituitionCoeff()).toBeCloseTo(0.5, 4);

            contact.setRestituitionCoeff(0.0);
            expect(contact.getRestituitionCoeff()).toBeCloseTo(0.0, 4);

            contact.setRestituitionCoeff(1.0);
            expect(contact.getRestituitionCoeff()).toBeCloseTo(1.0, 4);
        });

        test('should handle friction coefficient correctly', () => {
            // Test setting and getting friction coefficient
            contact.setFrictionCoeff(0.7);
            expect(contact.getFrictionCoeff()).toBeCloseTo(0.7, 4);

            contact.setFrictionCoeff(0.0);
            expect(contact.getFrictionCoeff()).toBeCloseTo(0.0, 4);

            contact.setFrictionCoeff(1.0);
            expect(contact.getFrictionCoeff()).toBeCloseTo(1.0, 4);
        });
    });

    describe('Contact Point Management', () => {
        test('should handle number of contact points', () => {
            // Set number of points via the world normal's w component
            contact.m_worldNormalOnB.w = 3;
            expect(contact.getNPoints()).toBe(3);
        });

        test('should handle penetration depth', () => {
            contact.setPenetration(0, -0.1);
            contact.setPenetration(1, -0.2);
            contact.setPenetration(2, -0.3);
            contact.setPenetration(3, -0.4);

            expect(contact.getPenetration(0)).toBeCloseTo(-0.1);
            expect(contact.getPenetration(1)).toBeCloseTo(-0.2);
            expect(contact.getPenetration(2)).toBeCloseTo(-0.3);
            expect(contact.getPenetration(3)).toBeCloseTo(-0.4);
        });

        test('should handle world normal on body B', () => {
            const normal = new b3Vector3(0, 1, 0);
            contact.setWorldNormalOnB(normal);
            
            const retrievedNormal = contact.getWorldNormalOnB();
            expect(retrievedNormal.getX()).toBeCloseTo(0);
            expect(retrievedNormal.getY()).toBeCloseTo(1);
            expect(retrievedNormal.getZ()).toBeCloseTo(0);
        });

        test('should handle world positions on body B', () => {
            const pos1 = new b3Vector3(1, 2, 3);
            const pos2 = new b3Vector3(4, 5, 6);
            
            contact.setWorldPosB(0, pos1);
            contact.setWorldPosB(1, pos2);
            
            const retrievedPos1 = contact.getWorldPosB(0);
            const retrievedPos2 = contact.getWorldPosB(1);
            
            expect(retrievedPos1.getX()).toBeCloseTo(1);
            expect(retrievedPos1.getY()).toBeCloseTo(2);
            expect(retrievedPos1.getZ()).toBeCloseTo(3);
            
            expect(retrievedPos2.getX()).toBeCloseTo(4);
            expect(retrievedPos2.getY()).toBeCloseTo(5);
            expect(retrievedPos2.getZ()).toBeCloseTo(6);
        });
    });

    describe('Reset Functionality', () => {
        test('should reset all data to default values', () => {
            // Set some non-default values
            contact.m_bodyAPtrAndSignBit = 5;
            contact.m_bodyBPtrAndSignBit = 10;
            contact.setBatchIdx(42);
            contact.setRestituitionCoeff(0.5);
            contact.setFrictionCoeff(0.7);
            contact.m_worldNormalOnB.x = 1;
            contact.m_worldNormalOnB.y = 2;
            contact.m_worldNormalOnB.z = 3;
            contact.m_worldNormalOnB.w = 2;
            
            // Reset and verify
            contact.reset();
            
            expect(contact.getBodyA()).toBe(0);
            expect(contact.getBodyB()).toBe(0);
            expect(contact.getBatchIdx()).toBe(0);
            expect(contact.getRestituitionCoeff()).toBeCloseTo(0);
            expect(contact.getFrictionCoeff()).toBeCloseTo(0);
            expect(contact.getNPoints()).toBe(0);
            
            const normal = contact.getWorldNormalOnB();
            expect(normal.getX()).toBe(0);
            expect(normal.getY()).toBe(0);
            expect(normal.getZ()).toBe(0);
            
            for (let i = 0; i < 4; i++) {
                const pos = contact.getWorldPosB(i);
                expect(pos.getX()).toBe(0);
                expect(pos.getY()).toBe(0);
                expect(pos.getZ()).toBe(0);
                expect(contact.getPenetration(i)).toBe(0);
            }
        });
    });

    describe('Inheritance', () => {
        test('should inherit from b3Contact4Data', () => {
            expect(contact).toBeInstanceOf(b3Contact4);
            // Should have access to base class properties
            expect(contact.m_worldPosB).toBeDefined();
            expect(contact.m_worldNormalOnB).toBeDefined();
            expect(contact.m_batchIdx).toBeDefined();
        });
    });
});