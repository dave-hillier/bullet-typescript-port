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

const USE_PATH_COMPRESSION = true;

export interface btElement {
  m_id: number;
  m_sz: number;
}

/**
 * UnionFind calculates connected subsets
 * Implements weighted Quick Union with path compression
 */
export class btUnionFind {
  private m_elements: btElement[] = [];

  constructor() {
    // Constructor implementation
  }

  /**
   * This is a special operation, destroying the content of btUnionFind.
   * It sorts the elements, based on island id, in order to make it easy to iterate over islands
   */
  sortIslands(): void {
    // First, find all unique island IDs and create groups
    const islandGroups: { [key: number]: btElement[] } = {};
    
    for (let i = 0; i < this.m_elements.length; i++) {
      const element = this.m_elements[i];
      const rootId = this.find(i);
      
      if (!islandGroups[rootId]) {
        islandGroups[rootId] = [];
      }
      islandGroups[rootId].push({ m_id: i, m_sz: element.m_sz });
    }

    // Rebuild elements array sorted by island groups
    this.m_elements = [];
    const sortedIslandIds = Object.keys(islandGroups).map(Number).sort((a, b) => a - b);
    
    for (const islandId of sortedIslandIds) {
      this.m_elements.push(...islandGroups[islandId]);
    }
  }

  reset(N: number): void {
    this.allocate(N);
    for (let i = 0; i < N; i++) {
      this.m_elements[i].m_id = i;
      this.m_elements[i].m_sz = 1;
    }
  }

  getNumElements(): number {
    return this.m_elements.length;
  }

  isRoot(x: number): boolean {
    return x === this.m_elements[x].m_id;
  }

  getElement(index: number): btElement {
    return this.m_elements[index];
  }

  allocate(N: number): void {
    this.m_elements = new Array(N);
    for (let i = 0; i < N; i++) {
      this.m_elements[i] = { m_id: i, m_sz: 1 };
    }
  }

  free(): void {
    this.m_elements = [];
  }

  findConnection(p: number, q: number): number {
    return this.find(p) === this.find(q) ? 1 : 0;
  }

  unite(p: number, q: number): void {
    const i = this.find(p);
    const j = this.find(q);
    
    if (i === j) {
      return;
    }

    if (USE_PATH_COMPRESSION) {
      this.m_elements[i].m_id = j;
      this.m_elements[j].m_sz += this.m_elements[i].m_sz;
    } else {
      // weighted quick union, this keeps the 'trees' balanced, and keeps performance of unite O( log(n) )
      if (this.m_elements[i].m_sz < this.m_elements[j].m_sz) {
        this.m_elements[i].m_id = j;
        this.m_elements[j].m_sz += this.m_elements[i].m_sz;
      } else {
        this.m_elements[j].m_id = i;
        this.m_elements[i].m_sz += this.m_elements[j].m_sz;
      }
    }
  }

  find(x: number): number {
    while (x !== this.m_elements[x].m_id) {
      if (USE_PATH_COMPRESSION) {
        // Path compression - flattens the trees and improves find performance dramatically
        const elementPtr = this.m_elements[this.m_elements[x].m_id];
        this.m_elements[x].m_id = elementPtr.m_id;
        x = elementPtr.m_id;
      } else {
        x = this.m_elements[x].m_id;
      }
    }
    return x;
  }
}