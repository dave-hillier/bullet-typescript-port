/*
Copyright (c) 2013 Advanced Micro Devices, Inc.  

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
 * Configuration settings for Bullet3 collision detection system.
 * Defines capacity limits and memory allocation parameters for various collision components.
 */
export class b3Config {
    public m_maxConvexBodies: number;
    public m_maxConvexShapes: number;
    public m_maxBroadphasePairs: number;
    public m_maxContactCapacity: number;
    public m_compoundPairCapacity: number;

    public m_maxVerticesPerFace: number;
    public m_maxFacesPerShape: number;
    public m_maxConvexVertices: number;
    public m_maxConvexIndices: number;
    public m_maxConvexUniqueEdges: number;

    public m_maxCompoundChildShapes: number;

    public m_maxTriConvexPairCapacity: number;

    constructor() {
        // Initialize default values
        this.m_maxConvexBodies = 128 * 1024;
        this.m_maxVerticesPerFace = 64;
        this.m_maxFacesPerShape = 12;
        this.m_maxConvexVertices = 8192;
        this.m_maxConvexIndices = 81920;
        this.m_maxConvexUniqueEdges = 8192;
        this.m_maxCompoundChildShapes = 8192;
        this.m_maxTriConvexPairCapacity = 256 * 1024;

        // Calculate dependent values
        this.m_maxConvexShapes = this.m_maxConvexBodies;
        this.m_maxBroadphasePairs = 16 * this.m_maxConvexBodies;
        this.m_maxContactCapacity = this.m_maxBroadphasePairs;
        this.m_compoundPairCapacity = 1024 * 1024;
    }
}