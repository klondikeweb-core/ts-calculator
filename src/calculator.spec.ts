import Calculator, { CalculatorKeyEvent, CalculatorKeys } from "./calculator";

describe('Calculator', () => {
    it('Should display zero at start', () => {
        let calc = new Calculator();
        expect(calc.display).toEqual("0");
    });

    describe('addKey', () => {
        it('Should return click handler', () => {
            let calc = new Calculator();
            const handler = calc.addKey(CalculatorKeys.Number1);
            expect(handler).toBeDefined();
            expect(handler.click).toBeDefined();
            expect(typeof handler.click).toBe('function');
        });
    
        it('Should add number keys', () => {
            let calc = new Calculator();
            let handler = calc.addKey(CalculatorKeys.Number1);
            handler.click();
            expect(calc.display).toEqual("1");

            handler = calc.addKey(CalculatorKeys.Number2);
            handler.click();
            expect(calc.display).toEqual("12");

            handler = calc.addKey(CalculatorKeys.Number3);
            handler.click();
            expect(calc.display).toEqual("123");

            handler = calc.addKey(CalculatorKeys.Number4);
            handler.click();
            expect(calc.display).toEqual("1234");

            handler = calc.addKey(CalculatorKeys.Number5);
            handler.click();
            expect(calc.display).toEqual("12345");

            handler = calc.addKey(CalculatorKeys.Number6);
            handler.click();
            expect(calc.display).toEqual("123456");

            handler = calc.addKey(CalculatorKeys.Number7);
            handler.click();
            expect(calc.display).toEqual("1234567");

            handler = calc.addKey(CalculatorKeys.Number8);
            handler.click();
            expect(calc.display).toEqual("12345678");

            handler = calc.addKey(CalculatorKeys.Number9);
            handler.click();
            expect(calc.display).toEqual("123456789");

            handler = calc.addKey(CalculatorKeys.Number0);
            handler.click();
            expect(calc.display).toEqual("1234567890");
        })

        it('Should add period first', () => {
            let calc = new Calculator();
            let numHandler = calc.addKey(CalculatorKeys.Number1);
            const handler = calc.addKey(CalculatorKeys.Period);
                        
            handler.click();
            // Should still be 0 as no number has been pressed.
            expect(calc.display).toEqual("0");

            // add a number
            numHandler.click();

            expect(calc.display).toEqual("0.1");
        });

        it('Should add period after', () => {
            let calc = new Calculator();
            let numHandler = calc.addKey(CalculatorKeys.Number1);
            const handler = calc.addKey(CalculatorKeys.Period);

            // number first
            numHandler.click();
            expect(calc.display).toEqual("1");

            handler.click();
            // should still be 1
            expect(calc.display).toEqual("1");

            numHandler.click();
            expect(calc.display).toBe("1.1");
        });

        it('Should ignore second period', () => {
            let calc = new Calculator();
            let numHandler = calc.addKey(CalculatorKeys.Number1);
            const handler = calc.addKey(CalculatorKeys.Period);

            // number first
            numHandler.click();
            expect(calc.display).toEqual("1");

            handler.click();
            // should still be 1
            expect(calc.display).toEqual("1");

            numHandler.click();
            expect(calc.display).toBe("1.1");

            handler.click();
            expect(calc.display).toBe("1.1");

            numHandler.click();
            expect(calc.display).toBe("1.11");
        })
    })

    describe('addKey operation', () => {

        it('Should ignore same operation twice', () => {
            const calc = new Calculator();
            const addHandler = calc.addKey(CalculatorKeys.Add);
            const numHandler = calc.addKey(CalculatorKeys.Number1);

            numHandler.click();
            expect(calc.display).toEqual("1");

            addHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(1);

            addHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(1);

        })

        it('Should add a value', () => {
            let calc = new Calculator();
            const numHandler = calc.addKey(CalculatorKeys.Number1);
            const addHandler = calc.addKey(CalculatorKeys.Add);

            expect(addHandler).toBeDefined();

            numHandler.click();
            expect(calc.display).toBe("1");

            addHandler.click();
            // Should reset the display to zero.
            expect(calc.display).toBe("0");

            numHandler.click();
            expect(calc.display).toEqual("1");

            // Click add again, should calculate
            addHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(2);
        });

        it('Should subtract a value', () => {
            const calc = new Calculator();
            const numHandler = calc.addKey(CalculatorKeys.Number1);
            const subHandler = calc.addKey(CalculatorKeys.Substract);

            numHandler.click();
            numHandler.click();
            expect(calc.display).toEqual("11");

            subHandler.click();
            expect(calc.display).toEqual("0");

            numHandler.click();
            expect(calc.display).toEqual("1");

            subHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(10);
        });

        it('Should divide a value', () => {
            const calc = new Calculator();
            const numHandler = calc.addKey(CalculatorKeys.Number1);
            const numHandler2 = calc.addKey(CalculatorKeys.Number2);
            const divideHandler = calc.addKey(CalculatorKeys.Divide);

            numHandler.click();
            numHandler2.click();
            expect(calc.display).toEqual("12");

            divideHandler.click();
            expect(calc.display).toEqual("0");

            numHandler2.click();
            expect(calc.display).toEqual("2");

            divideHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(6);
        });

        it('Should guard against divide by zero', () => {
            const calc = new Calculator();
            const numHandler = calc.addKey(CalculatorKeys.Number1);
            const numHandler0 = calc.addKey(CalculatorKeys.Number0);
            const divideHandler = calc.addKey(CalculatorKeys.Divide);

            numHandler.click();
            numHandler0.click();
            expect(calc.display).toEqual("10");

            divideHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(10);

            numHandler0.click();
            expect(calc.display).toEqual("0");

            divideHandler.click();
            expect(calc.display).toEqual("0");
            // Should be previous value
            expect(calc.value).toEqual(10);
        });

        it('Should multiply a value', () => {
            const calc = new Calculator();
            const multHandler = calc.addKey(CalculatorKeys.Multiply);
            const numHandler = calc.addKey(CalculatorKeys.Number5);

            numHandler.click();
            expect(calc.display).toEqual("5");

            multHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(5);

            numHandler.click();
            expect(calc.display).toEqual("5");
            
            multHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(25);
        });

        it('Should calculate on enter', () => {
            const calc = new Calculator();
            const enterHandler = calc.addKey(CalculatorKeys.Enter);
            const numHandler = calc.addKey(CalculatorKeys.Number2);
            const multHandler = calc.addKey(CalculatorKeys.Multiply);

            numHandler.click();
            expect(calc.display).toEqual("2");
            expect(calc.value).toEqual(0);

            multHandler.click();
            expect(calc.display).toEqual("0");
            expect(calc.value).toEqual(2);

            numHandler.click();
            expect(calc.display).toEqual("2");
            expect(calc.value).toEqual(2);

            enterHandler.click();
            expect(calc.display).toEqual("4");
            expect(calc.value).toEqual(4);
        })
    })
})