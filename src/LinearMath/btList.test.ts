/**
 * Unit tests for btList.ts
 * Tests the doubly-linked list implementation
 */

import { btGEN_Link, btGEN_List } from './btList';

describe('btGEN_Link', () => {
    test('should create link with default null values', () => {
        const link = new btGEN_Link();
        expect(link.getNext()).toBeNull();
        expect(link.getPrev()).toBeNull();
        expect(link.isHead()).toBe(true);
        expect(link.isTail()).toBe(true);
    });

    test('should create link with specified next and prev', () => {
        const next = new btGEN_Link();
        const prev = new btGEN_Link();
        const link = new btGEN_Link(next, prev);
        
        expect(link.getNext()).toBe(next);
        expect(link.getPrev()).toBe(prev);
        expect(link.isHead()).toBe(false);
        expect(link.isTail()).toBe(false);
    });

    test('should insert after another link', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();

        // Set up: link1 -> link3
        link1.setNext(link3);
        link3.setPrev(link1);

        // Insert link2 after link1: link1 -> link2 -> link3
        link2.insertAfter(link1);

        expect(link1.getNext()).toBe(link2);
        expect(link2.getPrev()).toBe(link1);
        expect(link2.getNext()).toBe(link3);
        expect(link3.getPrev()).toBe(link2);
    });

    test('should insert before another link', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();

        // Set up: link1 -> link3
        link1.setNext(link3);
        link3.setPrev(link1);

        // Insert link2 before link3: link1 -> link2 -> link3
        link2.insertBefore(link3);

        expect(link1.getNext()).toBe(link2);
        expect(link2.getPrev()).toBe(link1);
        expect(link2.getNext()).toBe(link3);
        expect(link3.getPrev()).toBe(link2);
    });

    test('should remove link from chain', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();

        // Set up chain: link1 -> link2 -> link3
        link1.setNext(link2);
        link2.setPrev(link1);
        link2.setNext(link3);
        link3.setPrev(link2);

        // Remove link2: link1 -> link3
        link2.remove();

        expect(link1.getNext()).toBe(link3);
        expect(link3.getPrev()).toBe(link1);
    });
});

describe('btGEN_List', () => {
    let list: btGEN_List;

    beforeEach(() => {
        list = new btGEN_List();
    });

    test('should create empty list', () => {
        expect(list.isEmpty()).toBe(true);
        expect(list.getSize()).toBe(0);
        expect(list.getHead()).toBeNull();
        expect(list.getTail()).toBeNull();
    });

    test('should add link to head', () => {
        const link = new btGEN_Link();
        list.addHead(link);

        expect(list.isEmpty()).toBe(false);
        expect(list.getSize()).toBe(1);
        expect(list.getHead()).toBe(link);
        expect(list.getTail()).toBe(link);
    });

    test('should add link to tail', () => {
        const link = new btGEN_Link();
        list.addTail(link);

        expect(list.isEmpty()).toBe(false);
        expect(list.getSize()).toBe(1);
        expect(list.getHead()).toBe(link);
        expect(list.getTail()).toBe(link);
    });

    test('should maintain order with multiple head additions', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();

        list.addHead(link1);
        list.addHead(link2);
        list.addHead(link3);

        expect(list.getSize()).toBe(3);
        expect(list.getHead()).toBe(link3);
        expect(list.getTail()).toBe(link1);
    });

    test('should maintain order with multiple tail additions', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();

        list.addTail(link1);
        list.addTail(link2);
        list.addTail(link3);

        expect(list.getSize()).toBe(3);
        expect(list.getHead()).toBe(link1);
        expect(list.getTail()).toBe(link3);
    });

    test('should handle mixed head and tail additions', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();
        const link4 = new btGEN_Link();

        list.addHead(link1);
        list.addTail(link2);
        list.addHead(link3);
        list.addTail(link4);

        expect(list.getSize()).toBe(4);
        expect(list.getHead()).toBe(link3);
        expect(list.getTail()).toBe(link4);

        // Check the full order: link3 -> link1 -> link2 -> link4
        expect(list.getHead()?.getNext()).toBe(link1);
        expect(link1.getNext()).toBe(link2);
        expect(link2.getNext()).toBe(link4);
    });

    test('should remove links properly', () => {
        const link1 = new btGEN_Link();
        const link2 = new btGEN_Link();
        const link3 = new btGEN_Link();

        list.addTail(link1);
        list.addTail(link2);
        list.addTail(link3);

        expect(list.getSize()).toBe(3);

        // Remove middle link
        link2.remove();

        expect(list.getSize()).toBe(2);
        expect(list.getHead()).toBe(link1);
        expect(list.getTail()).toBe(link3);
        expect(link1.getNext()).toBe(link3);
        expect(link3.getPrev()).toBe(link1);
    });
});