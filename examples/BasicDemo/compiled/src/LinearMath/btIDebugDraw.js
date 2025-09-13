/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.

Original software license:
This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/
import { btVector3 } from './btVector3';
import { multiplyMatrixVector } from './btMatrix3x3';
/**
 * The btIDebugDraw interface class allows hooking up a debug renderer to visually debug simulations.
 * Typical usage is during fixed timestep simulation/collisionDetection.
 */
export class btIDebugDraw {
    /**
     * Draw sphere
     */
    drawSphere(radius, transform, color) {
        // Default implementation using drawLine - can be overridden for better performance
        const center = transform.getOrigin();
        const step = Math.PI * 2.0 / 10.0;
        for (let i = 0; i < 10; i++) {
            const angle1 = i * step;
            const angle2 = (i + 1) * step;
            let p1 = new btVector3(Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0);
            let p2 = new btVector3(Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0);
            p1 = multiplyMatrixVector(transform.getBasis(), p1).add(center);
            p2 = multiplyMatrixVector(transform.getBasis(), p2).add(center);
            this.drawLine(p1, p2, color);
        }
    }
    /**
     * Draw box
     */
    drawBox(bbMin, bbMax, color) {
        // Draw wireframe box
        const vertices = [
            new btVector3(bbMin.x(), bbMin.y(), bbMin.z()),
            new btVector3(bbMax.x(), bbMin.y(), bbMin.z()),
            new btVector3(bbMax.x(), bbMax.y(), bbMin.z()),
            new btVector3(bbMin.x(), bbMax.y(), bbMin.z()),
            new btVector3(bbMin.x(), bbMin.y(), bbMax.z()),
            new btVector3(bbMax.x(), bbMin.y(), bbMax.z()),
            new btVector3(bbMax.x(), bbMax.y(), bbMax.z()),
            new btVector3(bbMin.x(), bbMax.y(), bbMax.z())
        ];
        // Bottom face
        this.drawLine(vertices[0], vertices[1], color);
        this.drawLine(vertices[1], vertices[2], color);
        this.drawLine(vertices[2], vertices[3], color);
        this.drawLine(vertices[3], vertices[0], color);
        // Top face
        this.drawLine(vertices[4], vertices[5], color);
        this.drawLine(vertices[5], vertices[6], color);
        this.drawLine(vertices[6], vertices[7], color);
        this.drawLine(vertices[7], vertices[4], color);
        // Vertical edges
        this.drawLine(vertices[0], vertices[4], color);
        this.drawLine(vertices[1], vertices[5], color);
        this.drawLine(vertices[2], vertices[6], color);
        this.drawLine(vertices[3], vertices[7], color);
    }
}
// Debug drawing modes
btIDebugDraw.DebugDrawModes = {
    DBG_NoDebug: 0,
    DBG_DrawWireframe: 1,
    DBG_DrawAabb: 2,
    DBG_DrawFeaturesText: 4,
    DBG_DrawContactPoints: 8,
    DBG_NoDeactivation: 16,
    DBG_NoHelpText: 32,
    DBG_DrawText: 64,
    DBG_ProfileTimings: 128,
    DBG_EnableSatComparison: 256,
    DBG_DisableBulletLCP: 512,
    DBG_EnableCCD: 1024,
    DBG_DrawConstraints: 2048,
    DBG_DrawConstraintLimits: 4096,
    DBG_FastWireframe: 8192,
    DBG_DrawNormals: 16384,
    DBG_DrawFrames: 32768,
    DBG_MAX_DEBUG_DRAW_MODE: 65536
};
