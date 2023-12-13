import TypeJS from "..";
import Arguments from "./Arguments";
import Class from "./Class";
import { ArgumentsControllerError } from "./Errors";
import Method from "./Method";

export default class ArgumentsController {
    validate(args) {

        this.arguments = [];
        if (this.method) {
            this.types = this.method.arguments.collection;
        }

        for (let i = 0; i < this.types.length; i++) {

            const expectedArgument = this.types[i];
            const prefixMessage = (this.method ? `Method ${this.method.name}: Argument ${expectedArgument.name} (#${i + 1})` : `Property ${expectedArgument.name}`).trim();

            if (!args[i] && expectedArgument.defaultValue) {
                this.arguments.push(expectedArgument.defaultValue);
            }

            this.arguments.push(args[i]);

            if (!!args[i]) {
                if (!!expectedArgument.type) {
                    const givenType = args[i].constructor.__interfaces ? args[i].constructor.__interfaces : [args[i].constructor];
                    if (expectedArgument.values) {
                        if (!expectedArgument.values.includes(args[i])) {
                            const givenValue = typeof args[i] === 'object' ? JSON.stringify(args[i]) : args[i];
                            throw new ArgumentsControllerError(`${prefixMessage} must be ${expectedArgument.type.name} ${expectedArgument.values.toString()}, ${args[i].constructor.name} ${givenValue} is given`);
                        }
                    }
                    else {
                        if (!givenType.includes(expectedArgument.type) && !(args[i] instanceof expectedArgument.type)) throw new ArgumentsControllerError(`${prefixMessage} must be a ${expectedArgument.type.name}, ${args[i].constructor.name} is given`);
                    }
                }
            }
            else if (expectedArgument.required) {
                if (expectedArgument.values) {
                    throw new ArgumentsControllerError(`${prefixMessage} must be ${expectedArgument.type.name} ${expectedArgument.values.toString()}, undefined is given`);
                }
                if (i < args.length) throw new ArgumentsControllerError(`${prefixMessage} is required, undefined is given`);
                else throw new ArgumentsControllerError(`${prefixMessage} is missing, method required ${this.types.length} arguments, ${args.length} given`);
            }



        }

        return this.arguments;

    }

    static declare(...types) {
        const controller = new ArgumentsController();
        controller.types = types.map(type => new Arguments('', type.prototype ? type : type.contructor, type.prototype ? undefined : type));
        return controller;
    }


    static on(fn, ...types) {
        if (typeof fn === 'function') {
            const controller = new ArgumentsController();

            controller.method = Method.fromFunction(fn);

            if (types.length && fn.name !== 'set') {
                for (let i = 0; i < types.length; i++) {
                    types[i].fn = `${controller.method.name} (${controller.method.arguments.string})`;
                    types[i].equals(controller.method.arguments.collection[i]);
                }
                controller.method.arguments.collection = types
            }

            const __SCRIPT_TYPE_JS__ARGUMENTS_CONTROLLER = function () {
                if (!this[TypeJS.instanciationPropertyName]) {
                    Class.instanciate.call(ArgumentsController, this);
                }

                let result = fn.call(this, ...controller.validate(arguments));
                if (typeof result === 'object') Class.instanciate.call(ArgumentsController, result);

                return result;
            }

            return __SCRIPT_TYPE_JS__ARGUMENTS_CONTROLLER;
        }
        return new Function();
    }
}