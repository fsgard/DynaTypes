import ScriptTypeJS from "../index.js";
import * as Utils from "./Utils.js";
import ArgumentsController from "./ArgumentsController.js";

export default class Method {
    _name = '';
    parent = undefined;
    privateName = '';
    arguments = [];
    fn = Function();
    isStatic = false;

    get name() { return this._name; }
    set name(value) {
        this._name = value;
        this.privateName = ScriptTypeJS.getTypeJSNameOf(value);
    }

    override(thisArg) {
        const args = this.arguments;
        const fn = this.f;

        return function () {
            ArgumentsController.on(fn).validate(arguments);
        }.bind(thisArg);
    }

    static fromFunction(fn, parent) {
        const method = new Method();
        const splitedFunction = Method.parse(fn);
        method.parent = parent;
        method.name = fn.name;
        method.arguments = splitedFunction.params;
        method.fn = fn;

        return method;
    }

    static parse(fn) {
        const stringFn = fn.toString().replace(/[/][/].*$/mg, '').split("\n").map(line => line.trim()).join(' ');
        const name = fn.name;

        let indexes = Utils.extractContentBetween('(', ')', stringFn);
        const paramsList = Utils.extractParams(stringFn.substring(indexes.start, indexes.end));

        indexes = Utils.extractContentBetween('{', '}', stringFn, indexes.end + 1);
        const body = stringFn.substring(indexes.start, indexes.end);

        const params = { string: paramsList, collection: Utils.explodeParamsFunction(paramsList) };

        return { name, params, body };
    }
}