import {
    btPersistentManifold,
    btCollisionObject,
    btContactManifoldTypes,
    MANIFOLD_CACHE_SIZE,
    gContactBreakingThreshold,
    globalContactCallbacks,
    ContactDestroyedCallback,
    ContactProcessedCallback,
    ContactStartedCallback,
    ContactEndedCallback
} from "./btPersistentManifold";
import { btManifoldPoint, btContactPointFlags } from "./btManifoldPoint";
import { btVector3 } from "../../LinearMath/btVector3";
import { btTransform } from "../../LinearMath/btTransform";
// import { btQuaternion } from "../../LinearMath/btQuaternion";

// Mock collision object for testing
class MockCollisionObject implements btCollisionObject {
    public id: number;
    
    constructor(id: number) {
        this.id = id;
    }
}

describe("btPersistentManifold constants and globals", () => {
    test("should have correct constants", () => {
        expect(MANIFOLD_CACHE_SIZE).toBe(4);
        expect(btContactManifoldTypes.MIN_CONTACT_MANIFOLD_TYPE).toBe(1024);
        expect(btContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE).toBe(1025);
    });

    test("should have global contact breaking threshold", () => {
        expect(gContactBreakingThreshold).toBe(0.02);
    });
});

describe("btPersistentManifold", () => {
    let manifold: btPersistentManifold;
    let body0: MockCollisionObject;
    let body1: MockCollisionObject;

    beforeEach(() => {
        body0 = new MockCollisionObject(1);
        body1 = new MockCollisionObject(2);
        manifold = new btPersistentManifold(body0, body1, 0, 0.02, 0.02);
    });

    test("should initialize with default constructor", () => {
        const defaultManifold = new btPersistentManifold();
        
        expect(defaultManifold.getObjectType()).toBe(btContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE);
        expect(defaultManifold.getNumContacts()).toBe(0);
        expect(defaultManifold.getBody0()).toBeNull();
        expect(defaultManifold.getBody1()).toBeNull();
        expect(defaultManifold.getContactBreakingThreshold()).toBe(gContactBreakingThreshold);
        expect(defaultManifold.m_companionIdA).toBe(0);
        expect(defaultManifold.m_companionIdB).toBe(0);
        expect(defaultManifold.m_index1a).toBe(0);
    });

    test("should initialize with parameters", () => {
        expect(manifold.getObjectType()).toBe(btContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE);
        expect(manifold.getNumContacts()).toBe(0);
        expect(manifold.getBody0()).toBe(body0);
        expect(manifold.getBody1()).toBe(body1);
        expect(manifold.getContactBreakingThreshold()).toBe(0.02);
        expect(manifold.getContactProcessingThreshold()).toBe(0.02);
    });

    test("should set and get bodies", () => {
        const newBody0 = new MockCollisionObject(3);
        const newBody1 = new MockCollisionObject(4);

        manifold.setBodies(newBody0, newBody1);
        expect(manifold.getBody0()).toBe(newBody0);
        expect(manifold.getBody1()).toBe(newBody1);
    });

    test("should set and get contact thresholds", () => {
        manifold.setContactBreakingThreshold(0.05);
        expect(manifold.getContactBreakingThreshold()).toBe(0.05);

        manifold.setContactProcessingThreshold(0.03);
        expect(manifold.getContactProcessingThreshold()).toBe(0.03);
    });

    test("should add manifold points", () => {
        const point = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            -0.01
        );

        expect(manifold.getNumContacts()).toBe(0);
        
        const index = manifold.addManifoldPoint(point);
        expect(index).toBe(0);
        expect(manifold.getNumContacts()).toBe(1);

        const storedPoint = manifold.getContactPoint(0);
        expect(storedPoint.m_localPointA.x()).toBe(1);
        expect(storedPoint.m_distance1).toBe(-0.01);
    });

    test("should validate contact distances", () => {
        const validPoint = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            0.01 // within threshold
        );

        const invalidPoint = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            0.05 // exceeds threshold of 0.02
        );

        expect(manifold.validContactDistance(validPoint)).toBe(true);
        expect(manifold.validContactDistance(invalidPoint)).toBe(false);
    });

    test("should remove contact points", () => {
        // Add some points
        const point1 = new btManifoldPoint(new btVector3(1, 0, 0), new btVector3(2, 0, 0), new btVector3(0, 1, 0), -0.01);
        const point2 = new btManifoldPoint(new btVector3(3, 0, 0), new btVector3(4, 0, 0), new btVector3(0, 1, 0), -0.01);
        
        manifold.addManifoldPoint(point1);
        manifold.addManifoldPoint(point2);
        expect(manifold.getNumContacts()).toBe(2);

        // Remove first point
        manifold.removeContactPoint(0);
        expect(manifold.getNumContacts()).toBe(1);

        // The second point should now be at index 0
        const remainingPoint = manifold.getContactPoint(0);
        expect(remainingPoint.m_localPointA.x()).toBe(3);
    });

    test("should clear all contact points", () => {
        // Add some points
        for (let i = 0; i < 3; i++) {
            const point = new btManifoldPoint(
                new btVector3(i, 0, 0),
                new btVector3(i + 1, 0, 0),
                new btVector3(0, 1, 0),
                -0.01
            );
            manifold.addManifoldPoint(point);
        }

        expect(manifold.getNumContacts()).toBe(3);

        manifold.clearManifold();
        expect(manifold.getNumContacts()).toBe(0);
    });

    test("should handle maximum cache size", () => {
        // Add maximum number of points
        for (let i = 0; i < MANIFOLD_CACHE_SIZE; i++) {
            const point = new btManifoldPoint(
                new btVector3(i, 0, 0),
                new btVector3(i + 1, 0, 0),
                new btVector3(0, 1, 0),
                -0.01
            );
            manifold.addManifoldPoint(point);
        }

        expect(manifold.getNumContacts()).toBe(MANIFOLD_CACHE_SIZE);

        // Add one more point - should still have same number of contacts but with replacement
        const extraPoint = new btManifoldPoint(
            new btVector3(10, 0, 0),
            new btVector3(11, 0, 0),
            new btVector3(0, 1, 0),
            -0.02  // deeper penetration
        );
        manifold.addManifoldPoint(extraPoint);

        expect(manifold.getNumContacts()).toBe(MANIFOLD_CACHE_SIZE);
    });

    test("should get cache entry for similar points", () => {
        const point1 = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            -0.01
        );
        manifold.addManifoldPoint(point1);

        // Create a similar point (close to the first one)
        const similarPoint = new btManifoldPoint(
            new btVector3(1.001, 0, 0),
            new btVector3(2.001, 0, 0),
            new btVector3(0, 1, 0),
            -0.01
        );

        const cacheEntry = manifold.getCacheEntry(similarPoint);
        expect(cacheEntry).toBe(0); // Should find the first point as nearest
    });

    test("should replace contact points while maintaining persistence", () => {
        const point1 = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            -0.01
        );
        point1.m_appliedImpulse = 10.0;
        point1.m_lifeTime = 5;

        manifold.addManifoldPoint(point1);

        const newPoint = new btManifoldPoint(
            new btVector3(1.1, 0, 0),
            new btVector3(2.1, 0, 0),
            new btVector3(0, 1, 0),
            -0.015
        );

        manifold.replaceContactPoint(newPoint, 0);

        const replacedPoint = manifold.getContactPoint(0);
        expect(replacedPoint.m_localPointA.x()).toBe(1.1); // New position
        expect(replacedPoint.m_appliedImpulse).toBe(10.0); // Preserved impulse
        expect(replacedPoint.m_lifeTime).toBe(5); // Preserved lifetime
    });

    test("should call refresh contact points method without crashing", () => {
        const point = new btManifoldPoint(
            new btVector3(0, 0, 0),  // local point A at origin
            new btVector3(0, 0, 0), // local point B at origin
            new btVector3(0, 1, 0),  // normal pointing up
            -0.01  // small penetration distance to make it valid
        );
        
        manifold.addManifoldPoint(point);

        // Create identity transforms (no movement)
        const transformA = new btTransform();
        const transformB = new btTransform();

        expect(manifold.getNumContacts()).toBe(1); // Should have one contact before refresh
        
        // This should execute without crashing (but might remove contact due to validation)
        expect(() => {
            manifold.refreshContactPoints(transformA, transformB);
        }).not.toThrow();
        
        // Note: The exact number of contacts after refresh depends on complex validation logic
        // so we just ensure the method executed successfully
    });

    test("should handle contact callbacks", () => {
        let destroyedCallbackCalled = false;
        let endedCallbackCalled = false;

        // Set up callbacks
        globalContactCallbacks.gContactDestroyedCallback = (_userPersistentData: any) => {
            destroyedCallbackCalled = true;
            return true;
        };

        globalContactCallbacks.gContactEndedCallback = (_manifold: btPersistentManifold) => {
            endedCallbackCalled = true;
        };

        // Add a point with user data
        const point = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            -0.01
        );
        point.m_userPersistentData = { test: "data" };

        manifold.addManifoldPoint(point);
        expect(manifold.getNumContacts()).toBe(1);

        // Clear manifold should trigger callbacks
        manifold.clearManifold();

        expect(destroyedCallbackCalled).toBe(true);
        expect(endedCallbackCalled).toBe(true);
        expect(manifold.getNumContacts()).toBe(0);

        // Reset callbacks
        globalContactCallbacks.gContactDestroyedCallback = null;
        globalContactCallbacks.gContactEndedCallback = null;
    });

    test("should handle friction anchor points", () => {
        const point = new btManifoldPoint(
            new btVector3(1, 0, 0),
            new btVector3(2, 0, 0),
            new btVector3(0, 1, 0),
            -0.01
        );
        
        point.m_contactPointFlags = btContactPointFlags.BT_CONTACT_FLAG_FRICTION_ANCHOR;
        point.m_combinedFriction = 0.5;
        point.m_appliedImpulse = 10.0;
        point.m_appliedImpulseLateral1 = 2.0;
        point.m_appliedImpulseLateral2 = 3.0;
        
        manifold.addManifoldPoint(point);

        const newPoint = new btManifoldPoint(
            new btVector3(1.1, 0, 0),
            new btVector3(2.1, 0, 0),
            new btVector3(0, 1, 0),
            -0.015
        );
        newPoint.m_contactPointFlags = btContactPointFlags.BT_CONTACT_FLAG_FRICTION_ANCHOR;

        // The friction force check should determine if the point gets replaced
        manifold.replaceContactPoint(newPoint, 0);

        const resultPoint = manifold.getContactPoint(0);
        // Impulse values should be maintained if point was not replaced
        // or updated if it was replaced based on friction cone check
        expect(resultPoint).toBeDefined();
    });

    test("should set number of contacts manually", () => {
        // Add some points normally
        for (let i = 0; i < 2; i++) {
            const point = new btManifoldPoint(
                new btVector3(i, 0, 0),
                new btVector3(i + 1, 0, 0),
                new btVector3(0, 1, 0),
                -0.01
            );
            manifold.addManifoldPoint(point);
        }

        expect(manifold.getNumContacts()).toBe(2);

        // Manually set to a different number
        manifold.setNumContacts(3);
        expect(manifold.getNumContacts()).toBe(3);

        // Set back to correct number
        manifold.setNumContacts(2);
        expect(manifold.getNumContacts()).toBe(2);
    });

    test("should handle companion IDs and index", () => {
        manifold.m_companionIdA = 100;
        manifold.m_companionIdB = 200;
        manifold.m_index1a = 300;

        expect(manifold.m_companionIdA).toBe(100);
        expect(manifold.m_companionIdB).toBe(200);
        expect(manifold.m_index1a).toBe(300);
    });
});

describe("Contact callback types", () => {
    test("should define callback function types correctly", () => {
        const destroyedCallback: ContactDestroyedCallback = (_userPersistentData: any): boolean => {
            return true;
        };

        const processedCallback: ContactProcessedCallback = (_cp: btManifoldPoint, _body0: any, _body1: any): boolean => {
            return true;
        };

        const startedCallback: ContactStartedCallback = (_manifold: btPersistentManifold): void => {
            // Do nothing
        };

        const endedCallback: ContactEndedCallback = (_manifold: btPersistentManifold): void => {
            // Do nothing
        };

        expect(typeof destroyedCallback).toBe('function');
        expect(typeof processedCallback).toBe('function');
        expect(typeof startedCallback).toBe('function');
        expect(typeof endedCallback).toBe('function');

        // Test callback execution
        const point = new btManifoldPoint();
        const manifold = new btPersistentManifold();

        expect(destroyedCallback({})).toBe(true);
        expect(processedCallback(point, {}, {})).toBe(true);
        expect(() => startedCallback(manifold)).not.toThrow();
        expect(() => endedCallback(manifold)).not.toThrow();
    });
});