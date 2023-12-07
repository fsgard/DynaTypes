import TypeJS from "..";
import Class from "./Class";
import { ArgumentsControllerError } from "./Errors";
import Method from "./Method";

export default class ArgumentsController {
    validate(args) {
        this.arguments = args;
        if (this.method) {
            this.types = this.method.arguments;
        }


        for (let i = 0; i < this.types.length; i++) {
            const expectedArgument = this.types[i];
            if (args[i] !== undefined) {
                const prefixMessage = this.method ? `Method ${this.method.name}: Argument ${expectedArgument.name} (#${i + 1})` : `Property ${expectedArgument.name}`;
                const givenType = args[i].constructor.__interfaces ? args[i].constructor.__interfaces.map(element => element.constructor) : [args[i].constructor];
                if (expectedArgument.values) {
                    if (!expectedArgument.values.includes(args[i])) {
                        const givenValue = typeof args[i] === 'object' ? JSON.stringify(args[i]) : args[i];
                        const errorMessage = `${prefixMessage} must be ${expectedArgument.type.name} ${expectedArgument.values.toString()}, ${args[i].constructor.name} ${givenValue} is given`;
                        throw new ArgumentsControllerError(errorMessage);
                    }
                }
                else {
                    if (!givenType.includes(expectedArgument.type)) throw new ArgumentsControllerError(`${prefixMessage} must be a ${expectedArgument.type.name}, ${args[i].constructor.name} is given`);
                }
            }
            else if (expectedArgument.required) {
                if (expectedArgument.values) throw new ArgumentsControllerError(`${prefixMessage}Argument #${i + 1} ${expectedArgument.name} must have only key [${expectedArgument.values.keys().join(', ')}] or only values a [${expectedArgument.values.values().join(', ')}], undefined is given`);
                if (i < args.length) throw new ArgumentsControllerError(`${prefixMessage}Method required arguments #${i + 1} ${expectedArgument.name}, undefined is given`);
                else throw new ArgumentsControllerError(`${prefixMessage}Method required ${this.types.length} arguments, ${args.length} given`);
            }

        }

    }

    static declare(...types) {
        const controller = new ArgumentsController();
        controller.types = types;
        return controller;
    }


    static on(fn, ...types) {
        if (typeof fn === 'function') {
            const controller = new ArgumentsController();
            controller.method = Method.fromFunction(fn);
            if (types.length) {
                controller.method.arguments = types
            }

            const __type_js_argument_controller__ = function () {
                if (!this[TypeJS.instanciationPropertyName]) {
                    Class.instanciate.call(ArgumentsController, this);
                }
                controller.validate(arguments);
                let result = fn.call(this, ...arguments);
                if (typeof result === 'object') Class.instanciate.call(ArgumentsController, result);
                return result;
            }

            return __type_js_argument_controller__;
        }
        return new Function();
    }
}