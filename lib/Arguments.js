import { ArgumentsControllerError } from "./Errors";

export default class Arguments {
    constructor(name, type, defaultValue) {
        this.fn = '';
        this.name = name;
        this.type = type;
        this.required = defaultValue === undefined;
        this.defaultValue = defaultValue;
        this.values = undefined
        this.value = undefined
    }

    validate() {
        if (this.value && this.value.constructor !== this.type) throw new ArgumentsControllerError(`Property #${this.name} must be a ${this.type.name}, ${this.value.constructor.name} is given`);
    }

    equals(argument) {
        for (let [property, value] of Object.entries(this)) {
            if (['name', 'required', 'defaultValue'].includes(property)) {
                console.log(property + " " + argument[property] + " " + value);
                if (value != argument[property]) throw new ArgumentsControllerError(`Argument #${property} are wrong in function ${this.fn} declaration: ${value} expected for ${property} of argument, ${argument[property]} is given`);
            }
        };
        return true;
    }
}