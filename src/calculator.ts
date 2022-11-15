export enum CalculatorKeys {
    Number0 = "0",
    Number1 = "1",
    Number2 = "2",
    Number3 = "3",
    Number4 = "4",
    Number5 = "5",
    Number6 = "6",
    Number7 = "7",
    Number8 = "8",
    Number9 = "9",
    Period = ".",
    Add = "+",
    Substract = "-",
    Multiply = "*",
    Divide = "/",
    Enter = "_"
}

export type CalculatorOperationKey = 
    | CalculatorKeys.Add
    | CalculatorKeys.Substract
    | CalculatorKeys.Divide
    | CalculatorKeys.Multiply
    | CalculatorKeys.Enter;

export class CalculatorKeyEvent extends CustomEvent<{
    key: CalculatorKeys
}> {    
    constructor(
        public readonly key: CalculatorKeys) {
        super("CalculatorKeyEvent", {
            detail: { key }
        });        
    }
}

export type CalculatorKeyHandler = {
    click: () => void;
}

export interface CalculatorInterface {
    readonly display: string;
    readonly currentValue: string;
    readonly value: number;
    readonly buffer: string;

    addKey: (key: CalculatorKeys) => CalculatorKeyHandler;
    subscribe: (callback: (key: CalculatorKeys, display: string, value: number) => void) => () => void;
}

function isOperationKey(key: any): key is CalculatorOperationKey {
    return key !== undefined;
}

class Calculator implements CalculatorInterface {
    private _subscribers: ((key: CalculatorKeys, display: string, value: number) => void)[] = [];    
    private _buffer: number[] = [];
    private _operations: CalculatorOperationKey[] = [];
    private _value: number = 0;
    private _currentValue: string = "";
    private _dotIndex: number = -1;
    private _lastKey: CalculatorKeys | undefined = undefined;
    private _lastOp: CalculatorOperationKey | undefined = undefined;

    constructor() {}
 
    public get display() {
        if (!this._currentValue?.length) {
            return "0";
        }

        if (this._dotIndex === 0) {
            return `0.${this._currentValue}`;
        }

        if (this._dotIndex === -1 || this._currentValue.length < 2) {
            return this._currentValue;
        }
        
        return this._currentValue.slice(0, this._dotIndex) + '.' + 
            this._currentValue.slice(this._dotIndex);
    }

    public get buffer() {
        if (this._buffer.length === 0) {
            return "";
        }

        return this._buffer.reduce((acc, curr, idx) => {
            let op = this._operations[idx];
            acc = acc + ` ${curr} ${op ?? ""}`;
            return acc;
        }, "").trimStart();
    }

    public get value() {
        return this._value;
    }

    public get currentValue() {
        return this._currentValue;
    }

    addKey(key: CalculatorKeys): CalculatorKeyHandler {
        
        const keyEvent = new CalculatorKeyEvent(key);

        const setLastKey = (key: CalculatorKeys) => {
            this._lastKey = key;
        }

        const setDotIndex = () => {
            if (this._dotIndex === -1 && this._lastKey !== key) {
                setLastKey(CalculatorKeys.Period);
                this._dotIndex = this.currentValue.length;
                this._subscribers.forEach(sub => sub(key, this.display, this.value));
            }
        }

        const operate = () => {
            if (this._lastKey === key || !isOperationKey(key)) { return; }
            setLastKey(key);
            this._lastOp = key;
            this.applyOperation(key);
            this._subscribers.forEach(sub => sub(key, this.display, this.value));
        }

        const calc = () => {
            if (this._lastKey === key) return;
            setLastKey(key);
            if (this._lastOp) {
                this._buffer.push(parseFloat(this.display));
                this._operations.push(this._lastOp);
            }
            this.calculate();
            this._currentValue = this._value?.toString();

            // rest the buffers
            this._buffer = [];
            this._operations = [];

            this._subscribers.forEach(sub => sub(key, this.display, this.value));
        }

        const pushValue = (key: CalculatorKeys) => {
            switch(key) {
                case CalculatorKeys.Number0:                    
                    if (this._currentValue.length > 0) {
                        if (this._lastKey === CalculatorKeys.Enter) {
                            this._currentValue = "";
                        }
                        setLastKey(key);
                        this._currentValue = this._currentValue + "0";                        
                    }                    
                    break;
                default:
                    if (!isNaN(parseFloat(key))) {
                        if (this._lastKey === CalculatorKeys.Enter) {
                            this._currentValue = "";
                        }
                        setLastKey(key);
                        this._currentValue = this._currentValue + key;
                    }
                    break;
            }

            this._subscribers.forEach(sub => sub(key, this.display, this.value));
        }

        return {
            click: function keyClick(this: CalculatorInterface, e: CalculatorKeyEvent) {
                
                switch (e.key) {
                    case CalculatorKeys.Add:
                    case CalculatorKeys.Substract:
                    case CalculatorKeys.Divide:
                    case CalculatorKeys.Multiply:
                        operate();
                        break;
                    case CalculatorKeys.Enter:
                        calc();
                        break;
                    case CalculatorKeys.Period:
                        setDotIndex();
                        break;
                    default:
                        pushValue(e.detail.key);
                        break;
                }
            }.bind(this, keyEvent)
        }
    }

    subscribe (callback: (key: CalculatorKeys, display: string, value: number) => void) {
        this._subscribers.push(callback);

        return () => {
            this._subscribers.splice(this._subscribers.indexOf(callback), 1);
        }
    }

    private calculate() {
        
        if (this._buffer.length === 0) {
            this._value = parseFloat(this.display);
            return;
        }

        let result = this._buffer.reduce((acc, curr, idx) => {
            if (idx === 0) {
                acc = curr;
                return acc;
            }

            let op = this._operations[idx];
            switch (op) {
                case CalculatorKeys.Add:
                    acc = acc + curr;
                    break;
                case CalculatorKeys.Substract:
                    acc = acc - curr;
                    break;
                case CalculatorKeys.Divide:
                    if (curr > 0) {
                        acc = acc / curr;
                    }
                    break;
                case CalculatorKeys.Multiply:
                    acc = acc * curr;
                    break;
            }

            return acc;
        }, 0);

        this._value = result;
    }

    private applyOperation(key: CalculatorKeys) {

        if (isOperationKey(key)) {
            this._buffer.push(parseFloat(this.display));
            this._operations.push(key);
            // reset the display
            this._currentValue = "";

            this.calculate();
            return;
        }

        throw new Error(`Invalid operation: '${key}'`);
    }

    static get Keys() {
        return CalculatorKeys;
    }
}


export default Calculator;