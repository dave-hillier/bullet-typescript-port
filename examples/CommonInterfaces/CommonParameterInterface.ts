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

/**
 * TypeScript port of Bullet3's CommonParameterInterface.h
 * Defines interfaces and classes for GUI parameter controls (sliders, buttons, combo boxes)
 */

// Type definitions for callback functions
export type SliderParamChangedCallback = (newVal: number, userPointer?: any) => void;
export type ButtonParamChangedCallback = (buttonId: number, buttonState: boolean, userPointer?: any) => void;
export type ComboBoxCallback = (combobox: number, item: string, userPointer?: any) => void;

/**
 * Parameters for slider controls
 */
export class SliderParams {
    public m_name: string;
    public m_minVal: number;
    public m_maxVal: number;
    public m_callback: SliderParamChangedCallback | null;
    public m_paramValuePointer: { value: number } | null;
    public m_userPointer: any;
    public m_clampToNotches: boolean;
    public m_clampToIntegers: boolean;
    public m_showValues: boolean;

    constructor(name: string, targetValuePointer?: { value: number }) {
        this.m_name = name;
        this.m_minVal = -100;
        this.m_maxVal = 100;
        this.m_callback = null;
        this.m_paramValuePointer = targetValuePointer || null;
        this.m_userPointer = null;
        this.m_clampToNotches = false;
        this.m_clampToIntegers = false;
        this.m_showValues = true;
    }
}

/**
 * Parameters for button controls
 */
export class ButtonParams {
    public m_name: string;
    public m_buttonId: number;
    public m_userPointer: any;
    public m_isTrigger: boolean;
    public m_initialState: boolean;
    public m_callback: ButtonParamChangedCallback | null;

    constructor(name: string, buttonId: number, isTrigger: boolean) {
        this.m_name = name;
        this.m_buttonId = buttonId;
        this.m_userPointer = null;
        this.m_isTrigger = isTrigger;
        this.m_initialState = false;
        this.m_callback = null;
    }
}

/**
 * Parameters for combo box controls
 */
export class ComboBoxParams {
    public m_comboboxId: number;
    public m_numItems: number;
    public m_items: string[];
    public m_startItem: number;
    public m_callback: ComboBoxCallback | null;
    public m_userPointer: any;

    constructor() {
        this.m_comboboxId = -1;
        this.m_numItems = 0;
        this.m_items = [];
        this.m_startItem = 0;
        this.m_callback = null;
        this.m_userPointer = null;
    }
}

/**
 * Interface for parameter management systems
 * This defines the contract for GUI systems that can register and manage
 * various types of UI controls like sliders, buttons, and combo boxes
 */
export interface CommonParameterInterface {
    /**
     * Register a slider parameter control
     * @param params Configuration for the slider
     */
    registerSliderFloatParameter(params: SliderParams): void;

    /**
     * Register a button parameter control
     * @param params Configuration for the button
     */
    registerButtonParameter(params: ButtonParams): void;

    /**
     * Register a combo box control
     * @param params Configuration for the combo box
     */
    registerComboBox(params: ComboBoxParams): void;

    /**
     * Synchronize all parameters (update UI from internal values)
     */
    syncParameters(): void;

    /**
     * Remove all registered parameters
     */
    removeAllParameters(): void;

    /**
     * Set the value of a specific slider
     * @param sliderIndex Index of the slider to update
     * @param sliderValue New value for the slider
     */
    setSliderValue(sliderIndex: number, sliderValue: number): void;
}