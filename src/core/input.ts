import { GamePadListener } from "./gamepad.js";
import { KeyValuePair } from "./types.js";
import { Vector2 } from "./vector.js";
import { State } from "./types.js";


const INPUT_SPECIAL_EPS = 0.25;


export class InputAction {

    public readonly name : string;
    public readonly key : string;
    public readonly button1 : number;
    public readonly button2 : number;

    public state : State;


    constructor(name : string, key : string, button1 = -1, button2 = -2) {

        this.name = name;
        this.key = key;
        this.button1 = button1;
        this.button2 = button2;

        this.state = State.Up;
    }
}


export class InputManager {


    private keyStates : Array<KeyValuePair<State>>;
    private prevent : Array<string>;
    private actions : Array<InputAction>;

    private gamepad : GamePadListener;

    private stick : Vector2;
    private oldStick : Vector2;
    private stickDelta : Vector2;

    private anyKeyPressed : boolean;
    

    constructor() {

        this.keyStates = new Array<KeyValuePair<State>> ();
        this.prevent = new Array<string> ();
        this.actions = new Array<InputAction> ();

        this.gamepad = new GamePadListener();

        this.stick = new Vector2(0, 0);
        this.oldStick = new Vector2(0, 0);
        this.stickDelta = new Vector2(0, 0);

        window.addEventListener("keydown", 
            (e : any) => {

                if (this.keyPressed(e.code)) 
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e : any) => {

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


    private setKeyState(key : string, s : State) {

        for (let e of this.keyStates) {

            if (e.key == key) {

                e.value = s;
                return;
            }
        }
    }


    // Pushes key to the key state array if it is
    // not already there
    private pushKeyState(key : string) {

        for (let e of this.keyStates) {

            if (e.key == key) return;
        }

        this.keyStates.push(new KeyValuePair<State>(key, State.Up));
    }

    
    public addAction(name : string, key : string, 
        button1 : number, button2 = -1) {

        this.actions.push(new InputAction(name, key, button1, button2));
        this.prevent.push(key);

        return this;
    }

    
    public keyPressed(key : string) {

        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Down) {

            this.anyKeyPressed = true;
            this.setKeyState(key, State.Pressed);
        }

        return this.prevent.includes(key);
    }


    public keyReleased(key : string) {

        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Up)
            this.setKeyState(key, State.Released);

        return this.prevent.includes(key);
    }


    private updateStateArray(arr : Array<KeyValuePair<State>>) {

        for (let a of arr) {

            if (a.value == State.Pressed)
                a.value = State.Down;
            else if(a.value == State.Released) 
                a.value = State.Up;
        }
    }


    private updateStick() {

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

        this.stickDelta = new Vector2(
            this.stick.x - this.oldStick.x,
            this.stick.y - this.oldStick.y
        );
    }


    // This one is called before the current scene
    // is "refreshed"
    public preUpdate() {

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
    public postUpdate() {

        this.updateStateArray(this.keyStates);

        this.anyKeyPressed = false;
    }


    //
    // The next functions makes dealing with gamepad
    // easier in menus
    //

    public upPress() : boolean {

        return this.stick.y < 0 && 
            this.oldStick.y >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.y < -INPUT_SPECIAL_EPS;
    }

    public downPress() : boolean {

        return this.stick.y > 0 && 
            this.oldStick.y <= INPUT_SPECIAL_EPS &&
            this.stickDelta.y > INPUT_SPECIAL_EPS;
    }


    public leftPress() : boolean {

        return this.stick.x < 0 && 
            this.oldStick.x >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.x < -INPUT_SPECIAL_EPS;
    }

    public rightPress() : boolean {

        return this.stick.x > 0 && 
            this.oldStick.x <= INPUT_SPECIAL_EPS &&
            this.stickDelta.x > INPUT_SPECIAL_EPS;
    }


    public anyPressed() : boolean {

        return this.anyKeyPressed || this.gamepad.isAnyButtonPressed();
    }


    public getStick() : Vector2 {

        return this.stick.clone();
    }


    public getAction(name : string) : State {

        for (let e of this.actions) {

            if (e.name == name)
                return e.state;
        }
        return State.Up;
    }


    public getKeyState(key : string) : State {

        for (let e of this.keyStates) {

            if (e.key == key)
                return e.value;
        }

        return State.Up;
    }
}
