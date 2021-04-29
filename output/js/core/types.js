export var State;
(function (State) {
    State[State["Up"] = 0] = "Up";
    State[State["Released"] = 2] = "Released";
    State[State["Down"] = 1] = "Down";
    State[State["Pressed"] = 3] = "Pressed";
    State[State["DownOrPressed"] = 1] = "DownOrPressed";
})(State || (State = {}));
export class KeyValuePair {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
