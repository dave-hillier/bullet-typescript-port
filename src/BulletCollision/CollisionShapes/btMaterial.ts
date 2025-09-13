/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/**
 * TypeScript port of Bullet3's btMaterial.h
 * This file was originally created by Alex Silverman
 * 
 * Material class to be used by btMultimaterialTriangleMeshShape to store triangle properties
 */

/**
 * Material properties for collision objects.
 * Stores friction and restitution coefficients that affect how objects interact during collisions.
 */
export class btMaterial {
    /** Friction coefficient - controls sliding resistance between surfaces */
    public m_friction: number;
    
    /** Restitution coefficient - controls bounciness (0 = no bounce, 1 = perfectly elastic) */
    public m_restitution: number;

    /**
     * Default constructor - creates a material with uninitialized properties
     */
    constructor();
    
    /**
     * Parameterized constructor - creates a material with specified properties
     * @param friction - Friction coefficient
     * @param restitution - Restitution coefficient
     */
    constructor(friction: number, restitution: number);
    
    /**
     * Implementation of constructor overloads
     */
    constructor(friction?: number, restitution?: number) {
        if (friction !== undefined && restitution !== undefined) {
            this.m_friction = friction;
            this.m_restitution = restitution;
        } else {
            // Default constructor - leave properties uninitialized
            // In TypeScript, they'll be undefined until explicitly set
            this.m_friction = 0;
            this.m_restitution = 0;
        }
    }

    /**
     * Copy constructor equivalent - creates a new material with the same properties
     * @param other - Material to copy from
     * @returns New btMaterial instance
     */
    public static copy(other: btMaterial): btMaterial {
        return new btMaterial(other.m_friction, other.m_restitution);
    }

    /**
     * Clone method - creates a copy of this material
     * @returns New btMaterial instance with the same properties
     */
    public clone(): btMaterial {
        return btMaterial.copy(this);
    }
}