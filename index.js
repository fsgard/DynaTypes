import ArgumentsController from "./lib/ArgumentsController";
import { TypeJSErrorMode, TypeJSError, ArgumentsControllerError, InterfaceError, ClassError } from "./lib/Errors";
import Class from "./lib/Class";
import { Enum, MetaType, T, TypeJSType } from "./lib/Types";

export default class TypeJS {
    static mode = 'dev';
    static errorMode = TypeJSErrorMode.default;
    static interfaces = {};
    static types = {};
    static prefix = '__type_js__';
    static usePrivateSynthax = false;
    static methodPropertyName = TypeJS.prefix + '_methods';
    static instanciationPropertyName = TypeJS.prefix + '_instantiate';
    static globalStatePropertyName = TypeJS.prefix + 'state';
    static bundlerIdentifier = {
        WEBPACK: {
            regex: /(_(.*)__WEBPACK.*__)(\.((.*)(\[.*\])|.*)|.*)/,
            test: function (type) {
                const match = type.match(this.regex);

                if (match) {
                    return {
                        module: match[1],
                        parent: match[2],
                        type: match[4] || match[2]
                    }
                }
                return false;
            }
        }
    }

    static settings(options) {
        if (options) {
            TypeJS.mode = options.mode ?? 'dev';
            TypeJS.errorMode = options.errorMode ?? '';
            TypeJSError.mode = TypeJS.errorMode;
            TypeJS.prefix = options.prefix ?? TypeJS.prefix;
        }

        if (TypeJS.mode == 'dev') {
            Object.entries(TypeJS.types).forEach(([name, declaration]) => {
                if (declaration instanceof TypeJSType) declaration.declare(name);
                else Class.construct(declaration);
            });
        }
        return TypeJS;
    }

    static declare(objects) {
        if (typeof objects === 'function') {
            TypeJS.types[objects.name] = objects;
            return new Class(objects);
        }

        Object.entries(objects).forEach(([name, obj]) => {
            TypeJS.types[name] = obj;
        });

    }

    static getTypeJSPrefix() {
        return `${TypeJS.usePrivateSynthax ? '#' : ''}${TypeJS.prefix}`;
    }

    static getTypeJSNameOf(value) {
        return TypeJS.getTypeJSPrefix() + value;
    }

    static getTypeDeclaration(type) {
        if (!type) return undefined;
        ArgumentsController.declare(String).validate(arguments);

        for (const [bundler, description] of Object.entries(TypeJS.bundlerIdentifier)) {
            const result = description.test(type)
            if (result) type = result.type
        }

        if (TypeJS.types[type]) return `${TypeJS.prefix}.types.${type}`;
        else if (TypeJS.interfaces[type]) return `${TypeJS.prefix}.interfaces.${type}`;
        else {
            const isObjectStaticProperty = type.match(/^(.*)\["(.*)"\]$/)
            if (isObjectStaticProperty) {
                if (TypeJS.types[isObjectStaticProperty[1]]) return `${TypeJS.prefix}.types.${type}`;
            }
            return type
        }
    }
}

global[TypeJS.prefix] = TypeJS;

export { TypeJSErrorMode, TypeJSError, ArgumentsController, ArgumentsControllerError, Class, ClassError, InterfaceError, Enum, MetaType, T };
