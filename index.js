import Interface from "./lib/Interface";
import ArgumentsController from "./lib/ArgumentsController";
import { TypeJSErrorMode, TypeJSError, ArgumentsControllerError, InterfaceError } from "./lib/Errors";
import Class from "./lib/Class";
import { Enum, TypeDeclaration } from "./lib/Types";

export default class TypeJS {
    static mode = 'dev';
    static errorMode = TypeJSErrorMode.default;
    static classes = {};
    static types = {};
    static declare = {};
    static prefix = '__type_js__';
    static usePrivateSynthax = false;
    static methodPropertyName = TypeJS.prefix + '_methods';
    static instanciationPropertyName = TypeJS.prefix + '_instantiate';
    static globalStatePropertyName = TypeJS.prefix + 'state';

    static settings(options) {

        if (options) {
            TypeJS.mode = options.mode ?? 'dev';
            TypeJS.errorMode = options.errorMode ?? '';
            TypeJSError.mode = TypeJS.errorMode;
            TypeJS.classes = options.classes ?? {};
            TypeJS.enums = options.enums ?? {};
            TypeJS.declare = options.declare ?? {};
            TypeJS.prefix = options.prefix ?? TypeJS.prefix;
        }

        if (TypeJS.mode == 'dev') {
            Object.entries(TypeJS.declare).forEach(([name, declaration]) => {
                declaration.declare(name, declaration);
            });

            Object.values(TypeJS.classes).forEach(overrideClass => {
                Class.construct(overrideClass);
            });
        }
        return TypeJS;
    }

    static getTypeJSPrefix() {
        return `${TypeJS.usePrivateSynthax ? '#' : ''}${TypeJS.prefix}`;
    }

    static getTypeJSNameOf(value) {
        return TypeJS.getTypeJSPrefix() + value;
    }
}

global[TypeJS.prefix] = TypeJS;

export { TypeJSErrorMode, TypeJSError, ArgumentsController, ArgumentsControllerError, Interface, InterfaceError };
