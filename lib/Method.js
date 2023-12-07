import TypeJS from "../index.js";
import * as Utils from "./Utils.js";
import ArgumentsController from "./ArgumentsController.js";

export default class Method {
    _name = '';
    privateName = '';
    arguments = [];
    f = Function();
    isStatic = false;

    get name() { return this._name; }
    set name(value) {
        this._name = value;
        this.privateName = TypeJS.getTypeJSNameOf(value);
    }

    override(thisArg) {
        const args = this.arguments;
        const fn = this.f;

        return function () {
            ArgumentsController.on(fn).validate(arguments);
        }.bind(thisArg);
    }

    static fromFunction(fn, name) {
        const method = new Method();
        const splitedFunction = Method.split(fn);
        method.name = name || splitedFunction.name;
        method.arguments = splitedFunction.params.collection;
        method.f = fn;

        return method;
    }

    static split(fn) {
        const stringFn = fn.toString();
        const start = stringFn.startsWith('function') ? 8 : 0;
        const end = stringFn.indexOf('(');
        const name = stringFn.substring(start, end).trim();
        let indexes = Utils.extractContentBetween('(', ')', stringFn);
        const paramString = stringFn.substring(indexes.start, indexes.end);
        indexes = Utils.extractContentBetween('{', '}', stringFn, indexes.end + 1);
        const body = stringFn.substring(indexes.start, indexes.end);
        const params = { string: paramString, collection: Utils.explodeParamsFunction(paramString) };

        return { name, params, body };
    }
}