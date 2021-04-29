import { GamePadListener } from "./gamepad.js";
import { KeyValuePair } from "./types.js";
import { Vector2 } from "./vector.js";
import { State } from "./types.js";
const INPUT_SPECIAL_EPS = 0.25;
export class InputAction {
    constructor(name, key, button1 = -1, button2 = -2) {
        this.name = name;
        this.key = key;
        this.button1 = button1;
        this.button2 = button2;
        this.state = State.Up;
    }
}
export class InputManager {
    constructor() {
        this.keyStates = new Array();
        this.prevent = new Array();
        this.actions = new Array();
        this.gamepad = new GamePadListener();
        this.stick = new Vector2(0, 0);
        this.oldStick = new Vector2(0, 0);
        this.stickDelta = new Vector2(0, 0);
        window.addEventListener("keydown", (e) => {
            if (this.keyPressed(e.code))
                e.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
            if (this.keyReleased(e.code))
                e.preventDefault();
        });
        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        // To get the focus when embedded to an iframe
        window.addEventListener("mousemove", (e) => {
            window.focus();
        });
        window.addEventListener("mousedown", (e) => {
            window.focus();
        });
        this.anyKeyPressed = false;
    }
    setKeyState(key, s) {
        for (let e of this.keyStates) {
            if (e.key == key) {
                e.value = s;
                return;
            }
        }
    }
    // Pushes key to the key state array if it is
    // not already there
    pushKeyState(key) {
        for (let e of this.keyStates) {
            if (e.key == key)
                return;
        }
        this.keyStates.push(new KeyValuePair(key, State.Up));
    }
    addAction(name, key, button1, button2 = -1) {
        this.actions.push(new InputAction(name, key, button1, button2));
        this.prevent.push(key);
        return this;
    }
    keyPressed(key) {
        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Down) {
            this.anyKeyPressed = true;
            this.setKeyState(key, State.Pressed);
        }
        return this.prevent.includes(key);
    }
    keyReleased(key) {
        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Up)
            this.setKeyState(key, State.Released);
        return this.prevent.includes(key);
    }
    updateStateArray(arr) {
        for (let a of arr) {
            if (a.value == State.Pressed)
                a.value = State.Down;
            else if (a.value == State.Released)
                a.value = State.Up;
        }
    }
    updateStick() {
        const DEADZONE = 0.25;
        let padStick = this.gamepad.getStick();
        this.oldStick = this.stick.clone();
        this.stick.zeros();
        if (Math.abs(padStick.x) >= DEADZONE ||
            Math.abs(padStick.y) >= DEADZONE) {
            this.stick = padStick;
        }
        else {
            if (this.getAction("right") & State.DownOrPressed) {
                this.stick.x = 1;
            }
            else if (this.getAction("left") & State.DownOrPressed) {
                this.stick.x = -1;
            }
            if (this.getAction("down") & State.DownOrPressed) {
                this.stick.y = 1;
            }
            else if (this.getAction("up") & State.DownOrPressed) {
                this.stick.y = -1;
            }
            // Not suitable for a platformer
            // this.stick.normalize();
        }
        this.stickDelta = new Vector2(this.stick.x - this.oldStick.x, this.stick.y - this.oldStick.y);
    }
    // This one is called before the current scene
    // is "refreshed"
    preUpdate() {
        this.gamepad.update();
        for (let a of this.actions) {
            a.state = this.getKeyState(a.key) | State.Up;
            if (a.state == State.Up) {
                if (a.button1 != null)
                    a.state = this.gamepad.getButtonState(a.button1);
                if (a.state == State.Up && a.button2 != null) {
                    a.state = this.gamepad.getButtonState(a.button2);
                }
            }
        }
        this.updateStick();
    }
    // And this one afterwards
    postUpdate() {
        this.updateStateArray(this.keyStates);
        this.anyKeyPressed = false;
    }
    //
    // The next functions makes dealing with gamepad
    // easier in menus
    //
    upPress() {
        return this.stick.y < 0 &&
            this.oldStick.y >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.y < -INPUT_SPECIAL_EPS;
    }
    downPress() {
        return this.stick.y > 0 &&
            this.oldStick.y <= INPUT_SPECIAL_EPS &&
            this.stickDelta.y > INPUT_SPECIAL_EPS;
    }
    leftPress() {
        return this.stick.x < 0 &&
            this.oldStick.x >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.x < -INPUT_SPECIAL_EPS;
    }
    rightPress() {
        return this.stick.x > 0 &&
            this.oldStick.x <= INPUT_SPECIAL_EPS &&
            this.stickDelta.x > INPUT_SPECIAL_EPS;
    }
    anyPressed() {
        return this.anyKeyPressed || this.gamepad.isAnyButtonPressed();
    }
    getStick() {
        return this.stick.clone();
    }
    getAction(name) {
        for (let e of this.actions) {
            if (e.name == name)
                return e.state;
        }
        return State.Up;
    }
    getKeyState(key) {
        for (let e of this.keyStates) {
            if (e.key == key)
                return e.value;
        }
        return State.Up;
    }
}
