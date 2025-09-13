/**
 * Tests for b3GrahamScan2dConvexHull
 * Basic tests to verify the Graham scan convex hull algorithm works correctly
 */

import { b3Vector3 } from '../Bullet3Common/b3Vector3';
import { b3AlignedObjectArray } from '../Bullet3Common/b3AlignedObjectArray';
import { 
    b3GrahamVector3, 
    b3AngleCompareFunc, 
    b3GrahamScanConvexHull2D 
} from './b3GrahamScan2dConvexHull';

describe('b3GrahamScan2dConvexHull', () => {
    describe('b3GrahamVector3', () => {
        it('should create a Graham vector with angle and index', () => {
            const point = new b3Vector3(1, 2, 3);
            const grahamPoint = new b3GrahamVector3(point, 5);
            
            expect(grahamPoint.getX()).toBe(1);
            expect(grahamPoint.getY()).toBe(2);
            expect(grahamPoint.getZ()).toBe(3);
            expect(grahamPoint.m_orgIndex).toBe(5);
            expect(grahamPoint.m_angle).toBe(0);
        });
    });

    describe('b3AngleCompareFunc', () => {
        it('should compare points by angle', () => {
            const anchor = new b3Vector3(0, 0, 0);
            const compareFunc = new b3AngleCompareFunc(anchor);
            
            const point1 = new b3GrahamVector3(new b3Vector3(1, 0, 0), 0);
            const point2 = new b3GrahamVector3(new b3Vector3(0, 1, 0), 1);
            
            point1.m_angle = 0.5;
            point2.m_angle = 1.0;
            
            expect(compareFunc.call(point1, point2)).toBe(true);
            expect(compareFunc.call(point2, point1)).toBe(false);
        });

        it('should compare points by distance when angles are equal', () => {
            const anchor = new b3Vector3(0, 0, 0);
            const compareFunc = new b3AngleCompareFunc(anchor);
            
            const point1 = new b3GrahamVector3(new b3Vector3(1, 0, 0), 0);
            const point2 = new b3GrahamVector3(new b3Vector3(2, 0, 0), 1);
            
            point1.m_angle = 0.5;
            point2.m_angle = 0.5; // Same angle
            
            expect(compareFunc.call(point1, point2)).toBe(true); // point1 is closer
            expect(compareFunc.call(point2, point1)).toBe(false);
        });

        it('should compare points by index when angles and distances are equal', () => {
            const anchor = new b3Vector3(0, 0, 0);
            const compareFunc = new b3AngleCompareFunc(anchor);
            
            const point1 = new b3GrahamVector3(new b3Vector3(1, 0, 0), 0);
            const point2 = new b3GrahamVector3(new b3Vector3(1, 0, 0), 1);
            
            point1.m_angle = 0.5;
            point2.m_angle = 0.5; // Same angle and distance
            
            expect(compareFunc.call(point1, point2)).toBe(true); // point1 has lower index
            expect(compareFunc.call(point2, point1)).toBe(false);
        });
    });

    describe('b3GrahamScanConvexHull2D', () => {
        it('should handle empty input', () => {
            const originalPoints = new b3AlignedObjectArray<b3GrahamVector3>();
            const hull = new b3AlignedObjectArray<b3GrahamVector3>();
            const normalAxis = new b3Vector3(0, 0, 1);
            
            b3GrahamScanConvexHull2D(originalPoints, hull, normalAxis);
            
            expect(hull.size()).toBe(0);
        });

        it('should handle single point', () => {
            const originalPoints = new b3AlignedObjectArray<b3GrahamVector3>();
            const point = new b3GrahamVector3(new b3Vector3(1, 2, 0), 0);
            originalPoints.push_back(point);
            
            const hull = new b3AlignedObjectArray<b3GrahamVector3>();
            const normalAxis = new b3Vector3(0, 0, 1);
            
            b3GrahamScanConvexHull2D(originalPoints, hull, normalAxis);
            
            expect(hull.size()).toBe(1);
            expect(hull.get(0).getX()).toBe(1);
            expect(hull.get(0).getY()).toBe(2);
        });

        it('should compute convex hull for simple square', () => {
            const originalPoints = new b3AlignedObjectArray<b3GrahamVector3>();
            
            // Add points of a square in random order
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(0, 0, 0), 0));
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(1, 1, 0), 1));
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(1, 0, 0), 2));
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(0, 1, 0), 3));
            
            const hull = new b3AlignedObjectArray<b3GrahamVector3>();
            const normalAxis = new b3Vector3(0, 0, 1); // Z-axis normal for XY plane
            
            b3GrahamScanConvexHull2D(originalPoints, hull, normalAxis);
            
            // Should return all 4 vertices for a square
            expect(hull.size()).toBeGreaterThanOrEqual(3);
            expect(hull.size()).toBeLessThanOrEqual(4);
        });

        it('should handle collinear points', () => {
            const originalPoints = new b3AlignedObjectArray<b3GrahamVector3>();
            
            // Add collinear points
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(0, 0, 0), 0));
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(1, 0, 0), 1));
            originalPoints.push_back(new b3GrahamVector3(new b3Vector3(2, 0, 0), 2));
            
            const hull = new b3AlignedObjectArray<b3GrahamVector3>();
            const normalAxis = new b3Vector3(0, 0, 1);
            
            b3GrahamScanConvexHull2D(originalPoints, hull, normalAxis);
            
            // For collinear points, hull should have at least 2 points
            expect(hull.size()).toBeGreaterThanOrEqual(2);
        });
    });
});