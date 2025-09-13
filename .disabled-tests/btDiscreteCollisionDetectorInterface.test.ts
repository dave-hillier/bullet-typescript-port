import {
    btDiscreteCollisionDetectorInterface,
    btStorageResult,
    btClosestPointInput
} from "./btDiscreteCollisionDetectorInterface";
import { btVector3 } from "../../LinearMath/btVector3";
import { btTransform } from "../../LinearMath/btTransform";
import { BT_LARGE_FLOAT } from "../../LinearMath/btScalar";

describe("btClosestPointInput", () => {
    test("should initialize with default values", () => {
        const input = new btClosestPointInput();

        expect(input.m_transformA).toBeInstanceOf(btTransform);
        expect(input.m_transformB).toBeInstanceOf(btTransform);
        expect(input.m_maximumDistanceSquared).toBe(BT_LARGE_FLOAT);
    });

    test("should allow setting transforms", () => {
        const input = new btClosestPointInput();
        
        const transformA = new btTransform();
        transformA.setOrigin(new btVector3(1, 2, 3));
        
        const transformB = new btTransform();
        transformB.setOrigin(new btVector3(4, 5, 6));

        input.m_transformA = transformA;
        input.m_transformB = transformB;

        expect(input.m_transformA.getOrigin().x()).toBe(1);
        expect(input.m_transformA.getOrigin().y()).toBe(2);
        expect(input.m_transformA.getOrigin().z()).toBe(3);

        expect(input.m_transformB.getOrigin().x()).toBe(4);
        expect(input.m_transformB.getOrigin().y()).toBe(5);
        expect(input.m_transformB.getOrigin().z()).toBe(6);
    });

    test("should allow setting maximum distance squared", () => {
        const input = new btClosestPointInput();
        
        input.m_maximumDistanceSquared = 100.0;
        expect(input.m_maximumDistanceSquared).toBe(100.0);
    });
});

describe("btStorageResult", () => {
    test("should initialize with default values", () => {
        const result = new btStorageResult();

        expect(result.m_normalOnSurfaceB).toBeInstanceOf(btVector3);
        expect(result.m_closestPointInB).toBeInstanceOf(btVector3);
        expect(result.m_distance).toBe(BT_LARGE_FLOAT);

        // Check that vectors are initialized to zero
        expect(result.m_normalOnSurfaceB.x()).toBe(0);
        expect(result.m_normalOnSurfaceB.y()).toBe(0);
        expect(result.m_normalOnSurfaceB.z()).toBe(0);

        expect(result.m_closestPointInB.x()).toBe(0);
        expect(result.m_closestPointInB.y()).toBe(0);
        expect(result.m_closestPointInB.z()).toBe(0);
    });

    test("should have default implementation for shape identifiers", () => {
        const result = new btStorageResult();
        
        // These should not throw and should do nothing
        expect(() => result.setShapeIdentifiersA(1, 2)).not.toThrow();
        expect(() => result.setShapeIdentifiersB(3, 4)).not.toThrow();
    });

    test("should add contact points and keep the closest one", () => {
        const result = new btStorageResult();

        // Add first contact point
        const normal1 = new btVector3(0, 1, 0);
        const point1 = new btVector3(1, 0, 0);
        result.addContactPoint(normal1, point1, 0.5);

        expect(result.getDistance()).toBe(0.5);
        expect(result.getNormalOnSurfaceB().y()).toBe(1);
        expect(result.getClosestPointInB().x()).toBe(1);

        // Add a deeper penetration contact point - should replace the first one
        const normal2 = new btVector3(0, 0, 1);
        const point2 = new btVector3(2, 0, 0);
        result.addContactPoint(normal2, point2, -0.2);

        expect(result.getDistance()).toBe(-0.2);
        expect(result.getNormalOnSurfaceB().z()).toBe(1);
        expect(result.getClosestPointInB().x()).toBe(2);

        // Add a less deep contact point - should not replace
        const normal3 = new btVector3(1, 0, 0);
        const point3 = new btVector3(3, 0, 0);
        result.addContactPoint(normal3, point3, 0.1);

        expect(result.getDistance()).toBe(-0.2);
        expect(result.getNormalOnSurfaceB().z()).toBe(1);
        expect(result.getClosestPointInB().x()).toBe(2);
    });

    test("should handle penetrating contacts (negative distances)", () => {
        const result = new btStorageResult();

        const normal = new btVector3(0, 1, 0);
        const point = new btVector3(0, 0, 0);
        
        // Add penetrating contact
        result.addContactPoint(normal, point, -0.1);

        expect(result.getDistance()).toBe(-0.1);
        expect(result.getNormalOnSurfaceB().y()).toBe(1);
    });

    test("should handle separated contacts (positive distances)", () => {
        const result = new btStorageResult();

        const normal = new btVector3(0, 1, 0);
        const point = new btVector3(0, 0, 0);
        
        // Add separated contact
        result.addContactPoint(normal, point, 0.05);

        expect(result.getDistance()).toBe(0.05);
        expect(result.getNormalOnSurfaceB().y()).toBe(1);
    });

    test("should reset correctly", () => {
        const result = new btStorageResult();

        // Add a contact point
        const normal = new btVector3(1, 0, 0);
        const point = new btVector3(1, 2, 3);
        result.addContactPoint(normal, point, -0.5);

        expect(result.getDistance()).toBe(-0.5);
        expect(result.getNormalOnSurfaceB().x()).toBe(1);
        expect(result.getClosestPointInB().x()).toBe(1);

        // Reset
        result.reset();

        expect(result.getDistance()).toBe(BT_LARGE_FLOAT);
        expect(result.getNormalOnSurfaceB().x()).toBe(0);
        expect(result.getNormalOnSurfaceB().y()).toBe(0);
        expect(result.getNormalOnSurfaceB().z()).toBe(0);
        expect(result.getClosestPointInB().x()).toBe(0);
        expect(result.getClosestPointInB().y()).toBe(0);
        expect(result.getClosestPointInB().z()).toBe(0);
    });

    test("should handle multiple contacts with same depth", () => {
        const result = new btStorageResult();

        const normal1 = new btVector3(1, 0, 0);
        const point1 = new btVector3(1, 0, 0);
        result.addContactPoint(normal1, point1, -0.1);

        const normal2 = new btVector3(0, 1, 0);
        const point2 = new btVector3(0, 1, 0);
        result.addContactPoint(normal2, point2, -0.1);

        // Should keep the first one since they have equal depth
        expect(result.getDistance()).toBe(-0.1);
        expect(result.getNormalOnSurfaceB().x()).toBe(1);
        expect(result.getClosestPointInB().x()).toBe(1);
    });

    test("should handle contacts with very small differences", () => {
        const result = new btStorageResult();

        const normal1 = new btVector3(1, 0, 0);
        const point1 = new btVector3(1, 0, 0);
        result.addContactPoint(normal1, point1, -0.100001);

        const normal2 = new btVector3(0, 1, 0);
        const point2 = new btVector3(0, 1, 0);
        result.addContactPoint(normal2, point2, -0.100002);

        // Should use the deeper penetration
        expect(result.getDistance()).toBe(-0.100002);
        expect(result.getNormalOnSurfaceB().y()).toBe(1);
        expect(result.getClosestPointInB().y()).toBe(1);
    });
});

// Test implementation of btDiscreteCollisionDetectorInterface
class TestCollisionDetector extends btDiscreteCollisionDetectorInterface {
    static Result = class extends btDiscreteCollisionDetectorInterface.Result {
        public partIdA: number = -1;
        public indexA: number = -1;
        public partIdB: number = -1;
        public indexB: number = -1;
        public contacts: Array<{ normal: btVector3, point: btVector3, depth: number }> = [];

        setShapeIdentifiersA(partId0: number, index0: number): void {
            this.partIdA = partId0;
            this.indexA = index0;
        }

        setShapeIdentifiersB(partId1: number, index1: number): void {
            this.partIdB = partId1;
            this.indexB = index1;
        }

        addContactPoint(normalOnBInWorld: btVector3, pointInWorld: btVector3, depth: number): void {
            const normal = new btVector3();
            normal.copy(normalOnBInWorld);
            const point = new btVector3();
            point.copy(pointInWorld);
            this.contacts.push({
                normal: normal,
                point: point,
                depth: depth
            });
        }
    };

    getClosestPoints(
        _input: btClosestPointInput,
        output: btDiscreteCollisionDetectorInterface.Result,
        _debugDraw?: any,
        _swapResults?: boolean
    ): void {
        // Simple test implementation - add a test contact
        output.setShapeIdentifiersA(1, 10);
        output.setShapeIdentifiersB(2, 20);
        output.addContactPoint(new btVector3(0, 1, 0), new btVector3(0, 0, 0), -0.1);
    }
}

describe("btDiscreteCollisionDetectorInterface implementation", () => {
    test("should be able to implement the interface", () => {
        const detector = new TestCollisionDetector();
        const input = new btClosestPointInput();
        const result = new TestCollisionDetector.Result();

        detector.getClosestPoints(input, result);

        expect(result.partIdA).toBe(1);
        expect(result.indexA).toBe(10);
        expect(result.partIdB).toBe(2);
        expect(result.indexB).toBe(20);
        expect(result.contacts).toHaveLength(1);
        expect(result.contacts[0].depth).toBe(-0.1);
        expect(result.contacts[0].normal.y()).toBe(1);
    });
});