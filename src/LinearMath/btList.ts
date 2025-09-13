/*
Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

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
 * TypeScript port of Bullet3's btList.h
 * Implements a doubly-linked list data structure for the physics engine
 */

/**
 * Represents a single node/link in a doubly-linked list
 * Each link maintains references to the next and previous links in the list
 */
export class btGEN_Link {
    private m_next: btGEN_Link | null = null;
    private m_prev: btGEN_Link | null = null;

    /**
     * Create a new link with optional next and previous references
     * @param next - The next link in the list
     * @param prev - The previous link in the list
     */
    constructor(next?: btGEN_Link | null, prev?: btGEN_Link | null) {
        this.m_next = next || null;
        this.m_prev = prev || null;
    }

    /**
     * Internal method to set the next link (used by btGEN_List)
     * @param next - The next link to set
     */
    setNext(next: btGEN_Link | null): void {
        this.m_next = next;
    }

    /**
     * Internal method to set the previous link (used by btGEN_List)
     * @param prev - The previous link to set
     */
    setPrev(prev: btGEN_Link | null): void {
        this.m_prev = prev;
    }

    /**
     * Get the next link in the list
     * @returns The next link or null if this is the last link
     */
    getNext(): btGEN_Link | null {
        return this.m_next;
    }

    /**
     * Get the previous link in the list
     * @returns The previous link or null if this is the first link
     */
    getPrev(): btGEN_Link | null {
        return this.m_prev;
    }

    /**
     * Check if this link is the head (first) of the list
     * @returns True if this is the head link (no previous link)
     */
    isHead(): boolean {
        return this.m_prev === null;
    }

    /**
     * Check if this link is the tail (last) of the list
     * @returns True if this is the tail link (no next link)
     */
    isTail(): boolean {
        return this.m_next === null;
    }

    /**
     * Insert this link before the specified link
     * Updates the chain to maintain proper linkage
     * @param link - The link to insert before
     */
    insertBefore(link: btGEN_Link): void {
        this.m_next = link;
        this.m_prev = link.m_prev;
        
        if (this.m_next) {
            this.m_next.m_prev = this;
        }
        if (this.m_prev) {
            this.m_prev.m_next = this;
        }
    }

    /**
     * Insert this link after the specified link
     * Updates the chain to maintain proper linkage
     * @param link - The link to insert after
     */
    insertAfter(link: btGEN_Link): void {
        this.m_next = link.m_next;
        this.m_prev = link;
        
        if (this.m_next) {
            this.m_next.m_prev = this;
        }
        if (this.m_prev) {
            this.m_prev.m_next = this;
        }
    }

    /**
     * Remove this link from the list
     * Updates the neighboring links to maintain proper linkage
     */
    remove(): void {
        if (this.m_next) {
            this.m_next.m_prev = this.m_prev;
        }
        if (this.m_prev) {
            this.m_prev.m_next = this.m_next;
        }
    }
}

/**
 * Represents a doubly-linked list container
 * Uses sentinel nodes (head and tail) to simplify insertion and removal operations
 */
export class btGEN_List {
    private readonly m_head: btGEN_Link;
    private readonly m_tail: btGEN_Link;

    /**
     * Create a new empty list with sentinel head and tail nodes
     */
    constructor() {
        this.m_tail = new btGEN_Link(null, null);
        this.m_head = new btGEN_Link(this.m_tail, null);
        // Set up the circular linkage between head and tail sentinels
        this.m_tail.setPrev(this.m_head);
    }

    /**
     * Get the first real link in the list (after the head sentinel)
     * @returns The first link in the list or null if the list is empty
     */
    getHead(): btGEN_Link | null {
        const next = this.m_head.getNext();
        return next === this.m_tail ? null : next;
    }

    /**
     * Get the last real link in the list (before the tail sentinel)
     * @returns The last link in the list or null if the list is empty
     */
    getTail(): btGEN_Link | null {
        const prev = this.m_tail.getPrev();
        return prev === this.m_head ? null : prev;
    }

    /**
     * Add a link to the beginning of the list (after the head sentinel)
     * @param link - The link to add to the head of the list
     */
    addHead(link: btGEN_Link): void {
        link.insertAfter(this.m_head);
    }

    /**
     * Add a link to the end of the list (before the tail sentinel)
     * @param link - The link to add to the tail of the list
     */
    addTail(link: btGEN_Link): void {
        link.insertBefore(this.m_tail);
    }

    /**
     * Check if the list is empty
     * @returns True if the list contains no elements
     */
    isEmpty(): boolean {
        return this.m_head.getNext() === this.m_tail;
    }

    /**
     * Get the number of elements in the list
     * @returns The count of links in the list (excluding sentinels)
     */
    getSize(): number {
        let count = 0;
        let current = this.getHead();
        
        while (current !== null) {
            count++;
            const next = current.getNext();
            current = next === this.m_tail ? null : next;
        }
        
        return count;
    }
}