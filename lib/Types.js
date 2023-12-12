import TypeJS from "..";

export class TypeJSType {
    constructor(arg, name) {
        let object = {};

        if (typeof arg === 'object') object = arg;
        else if (typeof arg === 'array') {
            Object.entries(arg).forEach((idx, value) => object[value] = idx);
        }
        else return arg;

        for (const property in object) {
            this[property] = object[property];
        }
        Object.seal(this);
        this.declare(name);
    }

    includes() { return false }

    has(key) {
        return this.hasOwnProperty(key);
    }

    includes(value) {
        return Object.values(this).includes(value);
    }

    keys() {
        return Object.keys(this);
    }

    values() { return Object.values(this); }

    toString() {
        return "{ " + Object.entries(this).map(([key, type]) => key + ": " + (typeof type === 'function' ? type.name : type)).join(', ') + " }";
    }

    declare(name) {
        if (name && TypeJS.mode == 'dev') {
            TypeJS.types[name] = this;
        }
    }
}

export class Enum extends TypeJSType {
    constructor(arg, name) {
        super(arg, name);
    }
}

export class MetaType extends TypeJSType {
    constructor(arg, name) {
        super(arg, name);
        if (TypeJS.mode !== 'dev' || typeof arg !== 'object') return undefined;
    }

    isObject() {
        return !Object.keys(this).every(item => typeof this[item] === 'function' && item === this[item].name)
    };

    includes(value) {
        if (this.isObject()) {
            return Object.keys(this).every(item => value[item] && value[item].constructor === (typeof this[item] === 'function' ? this[item] : this[item].constructor));
        }
        else {
            return Object.values(this).includes(value.constructor);
        }
    }

    keys() {
        if (this.isObject()) {
            return Object.keys(this);
        }
        else {
            return [];
        }
    }

    values() {
        if (this.isObject()) {
            return [];
        }
        else {
            return Object.values(this).map(type => type.name);
        }
    }
}

export function T(paramObject, name) {
    return new MetaType(paramObject, name);
}

