import { ArgumentsControllerError } from "./Errors";

export default class Arguments {
    constructor(name, type, defaultValue) {
        this.name = name;
        this.type = type;
        this.required = !!defaultValue;
        this.defaultValue = defaultValue;
        this.values = undefined
        this.value = undefined
    }

    validate() {
        if (this.value && this.value.constructor !== this.type) throw new ArgumentsControllerError(`Property #${this.name} must be a ${this.type.name}, ${this.value.constructor.name} is given`);
    }
}