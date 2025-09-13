/**
 * Tests for b3ReduceContacts contact reduction algorithm
 */

import { b3ReduceContacts } from './b3ReduceContacts';
import { b3Float4, b3MakeFloat4 } from '../../../Bullet3Common/shared/b3Float4';
import { b3Int4 } from '../../../Bullet3Common/shared/b3Int4';

describe('b3ReduceContacts', () => {
    test('returns 0 for empty contact array', () => {
        const contacts: b3Float4[] = [];
        const nearNormal = b3MakeFloat4(0, 0, 1, 0);
        const contactIdx: b3Int4[] = [new b3Int4()];

        const result = b3ReduceContacts(contacts, 0, nearNormal, contactIdx);

        expect(result).toBe(0);
    });

    test('returns all contacts when count is 4 or less', () => {
        const contacts = [
            b3MakeFloat4(1, 0, 0, -0.1),
            b3MakeFloat4(0, 1, 0, -0.2),
            b3MakeFloat4(-1, 0, 0, -0.3)
        ];
        const nearNormal = b3MakeFloat4(0, 0, 1, 0);
        const contactIdx: b3Int4[] = [new b3Int4()];

        const result = b3ReduceContacts(contacts, 3, nearNormal, contactIdx);

        expect(result).toBe(3);
    });

    test('reduces contacts to 4 when more than 4 provided', () => {
        // Create 8 contacts in a square pattern
        const contacts = [
            b3MakeFloat4(1, 1, 0, -0.1),    // Top-right
            b3MakeFloat4(-1, 1, 0, -0.2),   // Top-left
            b3MakeFloat4(-1, -1, 0, -0.3),  // Bottom-left
            b3MakeFloat4(1, -1, 0, -0.4),   // Bottom-right
            b3MakeFloat4(0, 1, 0, -0.05),   // Top-center
            b3MakeFloat4(0, -1, 0, -0.15),  // Bottom-center
            b3MakeFloat4(1, 0, 0, -0.25),   // Right-center
            b3MakeFloat4(-1, 0, 0, -0.35)   // Left-center
        ];
        const nearNormal = b3MakeFloat4(0, 0, 1, 0);
        const contactIdx: b3Int4[] = [new b3Int4()];

        const result = b3ReduceContacts(contacts, 8, nearNormal, contactIdx);

        expect(result).toBe(4);
        
        // Verify that valid indices are returned
        expect(contactIdx[0].x).toBeGreaterThanOrEqual(0);
        expect(contactIdx[0].x).toBeLessThan(8);
        expect(contactIdx[0].y).toBeGreaterThanOrEqual(0);
        expect(contactIdx[0].y).toBeLessThan(8);
        expect(contactIdx[0].z).toBeGreaterThanOrEqual(0);
        expect(contactIdx[0].z).toBeLessThan(8);
        expect(contactIdx[0].w).toBeGreaterThanOrEqual(0);
        expect(contactIdx[0].w).toBeLessThan(8);
    });

    test('includes deepest penetration contact in result', () => {
        // Create contacts where one has much deeper penetration
        const contacts = [
            b3MakeFloat4(1, 0, 0, -0.1),    // Shallow penetration
            b3MakeFloat4(0, 1, 0, -0.1),    // Shallow penetration
            b3MakeFloat4(-1, 0, 0, -0.1),   // Shallow penetration
            b3MakeFloat4(0, -1, 0, -0.1),   // Shallow penetration
            b3MakeFloat4(0.5, 0.5, 0, -1.0), // Deep penetration
            b3MakeFloat4(0.1, 0.1, 0, -0.1)  // Shallow penetration
        ];
        const nearNormal = b3MakeFloat4(0, 0, 1, 0);
        const contactIdx: b3Int4[] = [new b3Int4()];

        const result = b3ReduceContacts(contacts, 6, nearNormal, contactIdx);

        expect(result).toBe(4);
        
        // The deepest contact (index 4) should be included in the result
        const indices = [contactIdx[0].x, contactIdx[0].y, contactIdx[0].z, contactIdx[0].w];
        expect(indices).toContain(4);
    });

    test('handles maximum contact limit of 64', () => {
        // Create more than 64 contacts
        const contacts: b3Float4[] = [];
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * 2 * Math.PI;
            contacts.push(b3MakeFloat4(
                Math.cos(angle),
                Math.sin(angle),
                0,
                -0.1 - i * 0.001 // Varying penetration depth
            ));
        }
        
        const nearNormal = b3MakeFloat4(0, 0, 1, 0);
        const contactIdx: b3Int4[] = [new b3Int4()];

        const result = b3ReduceContacts(contacts, 100, nearNormal, contactIdx);

        expect(result).toBe(4);
        
        // All indices should be less than 64 (the internal limit)
        expect(contactIdx[0].x).toBeLessThan(64);
        expect(contactIdx[0].y).toBeLessThan(64);
        expect(contactIdx[0].z).toBeLessThan(64);
        expect(contactIdx[0].w).toBeLessThan(64);
    });

    test('works with different normal orientations', () => {
        const contacts = [
            b3MakeFloat4(1, 0, 0, -0.1),
            b3MakeFloat4(0, 1, 0, -0.2),
            b3MakeFloat4(-1, 0, 0, -0.3),
            b3MakeFloat4(0, -1, 0, -0.4),
            b3MakeFloat4(0.5, 0.5, 0, -0.5)
        ];
        
        // Test with different normal orientations
        const normals = [
            b3MakeFloat4(1, 0, 0, 0),    // X-axis
            b3MakeFloat4(0, 1, 0, 0),    // Y-axis
            b3MakeFloat4(0, 0, 1, 0),    // Z-axis
            b3MakeFloat4(0.707, 0.707, 0, 0) // Diagonal
        ];
        
        for (const normal of normals) {
            const contactIdx: b3Int4[] = [new b3Int4()];
            const result = b3ReduceContacts(contacts, 5, normal, contactIdx);
            
            expect(result).toBe(4);
            expect(contactIdx[0].x).toBeGreaterThanOrEqual(0);
            expect(contactIdx[0].y).toBeGreaterThanOrEqual(0);
            expect(contactIdx[0].z).toBeGreaterThanOrEqual(0);
            expect(contactIdx[0].w).toBeGreaterThanOrEqual(0);
        }
    });
});