import { btManifoldPoint, btConstraintRow, btContactPointFlags } from "./btManifoldPoint";
import { btVector3 } from "../../LinearMath/btVector3";

describe("btConstraintRow", () => {
    test("should initialize with zero values", () => {
        const row = new btConstraintRow();
        
        expect(row.m_normal).toEqual([0, 0, 0]);
        expect(row.m_rhs).toBe(0);
        expect(row.m_jacDiagInv).toBe(0);
        expect(row.m_lowerLimit).toBe(0);
        expect(row.m_upperLimit).toBe(0);
        expect(row.m_accumImpulse).toBe(0);
    });

    test("should allow setting values", () => {
        const row = new btConstraintRow();
        
        row.m_normal = [1, 0, 0];
        row.m_rhs = 10;
        row.m_jacDiagInv = 0.5;
        row.m_lowerLimit = -100;
        row.m_upperLimit = 100;
        row.m_accumImpulse = 25;

        expect(row.m_normal).toEqual([1, 0, 0]);
        expect(row.m_rhs).toBe(10);
        expect(row.m_jacDiagInv).toBe(0.5);
        expect(row.m_lowerLimit).toBe(-100);
        expect(row.m_upperLimit).toBe(100);
        expect(row.m_accumImpulse).toBe(25);
    });
});

describe("btContactPointFlags", () => {
    test("should have correct flag values", () => {
        expect(btContactPointFlags.BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED).toBe(1);
        expect(btContactPointFlags.BT_CONTACT_FLAG_HAS_CONTACT_CFM).toBe(2);
        expect(btContactPointFlags.BT_CONTACT_FLAG_HAS_CONTACT_ERP).toBe(4);
        expect(btContactPointFlags.BT_CONTACT_FLAG_CONTACT_STIFFNESS_DAMPING).toBe(8);
        expect(btContactPointFlags.BT_CONTACT_FLAG_FRICTION_ANCHOR).toBe(16);
    });
});

describe("btManifoldPoint", () => {
    test("should initialize with default constructor", () => {
        const point = new btManifoldPoint();

        expect(point.m_localPointA).toBeInstanceOf(btVector3);
        expect(point.m_localPointB).toBeInstanceOf(btVector3);
        expect(point.m_positionWorldOnB).toBeInstanceOf(btVector3);
        expect(point.m_positionWorldOnA).toBeInstanceOf(btVector3);
        expect(point.m_normalWorldOnB).toBeInstanceOf(btVector3);
        expect(point.m_lateralFrictionDir1).toBeInstanceOf(btVector3);
        expect(point.m_lateralFrictionDir2).toBeInstanceOf(btVector3);

        expect(point.m_distance1).toBe(0);
        expect(point.m_combinedFriction).toBe(0);
        expect(point.m_combinedRollingFriction).toBe(0);
        expect(point.m_combinedSpinningFriction).toBe(0);
        expect(point.m_combinedRestitution).toBe(0);
        expect(point.m_partId0).toBe(-1);
        expect(point.m_partId1).toBe(-1);
        expect(point.m_index0).toBe(-1);
        expect(point.m_index1).toBe(-1);
        expect(point.m_userPersistentData).toBeNull();
        expect(point.m_contactPointFlags).toBe(0);
        expect(point.m_appliedImpulse).toBe(0);
        expect(point.m_prevRHS).toBe(0);
        expect(point.m_appliedImpulseLateral1).toBe(0);
        expect(point.m_appliedImpulseLateral2).toBe(0);
        expect(point.m_contactMotion1).toBe(0);
        expect(point.m_contactMotion2).toBe(0);
        expect(point.m_lifeTime).toBe(0);
    });

    test("should initialize with parameters", () => {
        const pointA = new btVector3(1, 2, 3);
        const pointB = new btVector3(4, 5, 6);
        const normal = new btVector3(0, 1, 0);
        const distance = -0.1;

        const point = new btManifoldPoint(pointA, pointB, normal, distance);

        expect(point.m_localPointA.x()).toBe(1);
        expect(point.m_localPointA.y()).toBe(2);
        expect(point.m_localPointA.z()).toBe(3);

        expect(point.m_localPointB.x()).toBe(4);
        expect(point.m_localPointB.y()).toBe(5);
        expect(point.m_localPointB.z()).toBe(6);

        expect(point.m_normalWorldOnB.x()).toBe(0);
        expect(point.m_normalWorldOnB.y()).toBe(1);
        expect(point.m_normalWorldOnB.z()).toBe(0);

        expect(point.m_distance1).toBe(-0.1);
    });

    test("should get and set distance", () => {
        const point = new btManifoldPoint();

        expect(point.getDistance()).toBe(0);
        
        point.setDistance(0.5);
        expect(point.getDistance()).toBe(0.5);
        expect(point.m_distance1).toBe(0.5);
    });

    test("should get lifetime", () => {
        const point = new btManifoldPoint();
        
        expect(point.getLifeTime()).toBe(0);
        
        point.m_lifeTime = 10;
        expect(point.getLifeTime()).toBe(10);
    });

    test("should get position world on A", () => {
        const point = new btManifoldPoint();
        const pos = new btVector3(1, 2, 3);
        point.m_positionWorldOnA.copy(pos);

        const result = point.getPositionWorldOnA();
        expect(result.x()).toBe(1);
        expect(result.y()).toBe(2);
        expect(result.z()).toBe(3);
    });

    test("should get position world on B", () => {
        const point = new btManifoldPoint();
        const pos = new btVector3(4, 5, 6);
        point.m_positionWorldOnB.copy(pos);

        const result = point.getPositionWorldOnB();
        expect(result.x()).toBe(4);
        expect(result.y()).toBe(5);
        expect(result.z()).toBe(6);
    });

    test("should get and set applied impulse", () => {
        const point = new btManifoldPoint();

        expect(point.getAppliedImpulse()).toBe(0);
        
        point.m_appliedImpulse = 15.5;
        expect(point.getAppliedImpulse()).toBe(15.5);
    });

    test("should handle contact stiffness and damping", () => {
        const point = new btManifoldPoint();

        // Test stiffness
        expect(point.getCombinedContactStiffness()).toBe(0);
        point.setCombinedContactStiffness(100);
        expect(point.getCombinedContactStiffness()).toBe(100);
        expect(point.m_combinedContactStiffness1).toBe(100);

        // Test damping
        expect(point.getCombinedContactDamping()).toBe(0);
        point.setCombinedContactDamping(50);
        expect(point.getCombinedContactDamping()).toBe(50);
        expect(point.m_combinedContactDamping1).toBe(50);
    });

    test("should handle contact CFM and ERP", () => {
        const point = new btManifoldPoint();

        // Test CFM
        expect(point.getContactCFM()).toBe(0);
        point.setContactCFM(0.01);
        expect(point.getContactCFM()).toBe(0.01);
        expect(point.m_contactCFM).toBe(0.01);

        // Test ERP
        expect(point.getContactERP()).toBe(0);
        point.setContactERP(0.8);
        expect(point.getContactERP()).toBe(0.8);
        expect(point.m_contactERP).toBe(0.8);
    });

    test("should handle contact point flags", () => {
        const point = new btManifoldPoint();

        expect(point.m_contactPointFlags).toBe(0);
        
        // Set friction initialized flag
        point.m_contactPointFlags = btContactPointFlags.BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED;
        expect(point.m_contactPointFlags & btContactPointFlags.BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED).toBeTruthy();

        // Add another flag
        point.m_contactPointFlags |= btContactPointFlags.BT_CONTACT_FLAG_HAS_CONTACT_CFM;
        expect(point.m_contactPointFlags & btContactPointFlags.BT_CONTACT_FLAG_HAS_CONTACT_CFM).toBeTruthy();
        expect(point.m_contactPointFlags & btContactPointFlags.BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED).toBeTruthy();
    });

    test("should handle lateral friction directions", () => {
        const point = new btManifoldPoint();
        
        const dir1 = new btVector3(1, 0, 0);
        const dir2 = new btVector3(0, 0, 1);
        
        point.m_lateralFrictionDir1.copy(dir1);
        point.m_lateralFrictionDir2.copy(dir2);
        
        expect(point.m_lateralFrictionDir1.x()).toBe(1);
        expect(point.m_lateralFrictionDir1.y()).toBe(0);
        expect(point.m_lateralFrictionDir1.z()).toBe(0);
        
        expect(point.m_lateralFrictionDir2.x()).toBe(0);
        expect(point.m_lateralFrictionDir2.y()).toBe(0);
        expect(point.m_lateralFrictionDir2.z()).toBe(1);
    });

    test("should handle combined material properties", () => {
        const point = new btManifoldPoint();

        point.m_combinedFriction = 0.5;
        point.m_combinedRollingFriction = 0.1;
        point.m_combinedSpinningFriction = 0.05;
        point.m_combinedRestitution = 0.8;

        expect(point.m_combinedFriction).toBe(0.5);
        expect(point.m_combinedRollingFriction).toBe(0.1);
        expect(point.m_combinedSpinningFriction).toBe(0.05);
        expect(point.m_combinedRestitution).toBe(0.8);
    });

    test("should handle part and index information", () => {
        const point = new btManifoldPoint();

        point.m_partId0 = 1;
        point.m_partId1 = 2;
        point.m_index0 = 10;
        point.m_index1 = 20;

        expect(point.m_partId0).toBe(1);
        expect(point.m_partId1).toBe(2);
        expect(point.m_index0).toBe(10);
        expect(point.m_index1).toBe(20);
    });
});