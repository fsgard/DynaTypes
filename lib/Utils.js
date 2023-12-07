import TypeJS, { ArgumentsController } from "..";
import Arguments from "./Arguments";
import { TypeJSType, Enum } from "./Types";

export function defineClassProperty(thisArg, property) {
    if (thisArg.protorype && Object.getOwnPropertyNames(Object).includes(property)) return;

    const descriptor = Object.getOwnPropertyDescriptor(thisArg, property);
    if (descriptor.configurable) {
        const hasGetter = !!descriptor.get;
        const hasSetter = !!descriptor.set;
        const argument = new Arguments(property);

        if (hasSetter) {
            const instance = new thisArg.constructor();

            argument.value = instance[property];
            if (argument.value instanceof Enum) {
                argument.type = argument.value.constructor;
                argument.values = argument.value;
                argument.value = undefined;
            }
            else {
                argument.type = argument.value.constructor;
            }
            Object.defineProperty(thisArg, property, {
                set: function (value) {
                    ArgumentsController.on(descriptor.set, argument).bind(this)(value);
                }
            });
        }
        else {
            argument.value = typeof thisArg[property] === 'function' ? thisArg[property]() : thisArg[property];

            if (argument.value instanceof Enum) {
                argument.type = argument.value.constructor;
                argument.values = argument.value;
                argument.value = undefined;
            }
            else argument.type = typeof thisArg[property] == 'function' ? thisArg[property] : thisArg[property].constructor;

            const privateProperty = TypeJS.getTypeJSNameOf(property);
            if (!thisArg.hasOwnProperty(privateProperty)) {

                // Define private property
                Object.defineProperty(thisArg, privateProperty, {
                    writable: true,
                    configurable: false,
                    enumerable: false,
                    value: argument.value
                });

                // Define public property    
                Object.defineProperty(thisArg, property, {
                    get: function () {
                        return this[privateProperty];
                    },
                    set: function (value) {
                        ArgumentsController.declare(argument).validate(arguments);
                        this[privateProperty] = value;
                    }
                });
            }
            argument.validate();
        }
    }
}

export function defineClassMethod(object, property) {
    if (!object[TypeJS.methodPropertyName]) object[TypeJS.methodPropertyName] = {};
    if (!object[TypeJS.methodPropertyName][property]) {
        object[property] = ArgumentsController.on(object[property]);
        object[TypeJS.methodPropertyName][property] = true;
    }
}

export function implementInterfaceMethod(interfaceObject, classObject, method) {
    if (typeof interfaceObject[method.name] === 'function') {
        if (classObject.hasOwnProperty(method.name)) {
            classObject[method.name] = ArgumentsController.on(classObject[method.name], ...method.arguments);
        }
        else {
            return false
        }
        return true;
    }
    return false
}

export function bootstrapProperty(object, property) {
    if (object.hasOwnProperty(TypeJS.getTypeJSNameOf(property))) return;
    if (property.startsWith(TypeJS.getTypeJSPrefix())) return;
    if (Object.prototype.hasOwnProperty(property)) return;


    if (typeof object[property] === 'function') {
        defineClassMethod(object, property);
    }
    else {
        defineClassProperty(object, property);
    }
}

export function evaluateType(parameter) {
    let evalType;

    if (TypeJS.types[parameter]) evalType = TypeJS.types[parameter];
    else {
        const type = `${TypeJS.prefix}.types.${parameter}`;
        try {
            evalType = eval(type);
        }
        catch { }
    }
    if (evalType == undefined) evalType = eval(parameter);

    return evalType;
}

export function explodeParamsFunction(paramString) {
    const newParams = [];
    if (paramString.trim().length) {
        const params = paramString.split(",").map(element => element.split('=').map(element => element.trim()));
        params.forEach(element => {
            if (element[1]) {
                const argument = new Arguments(element[0]);
                const evalType = evaluateType(element[1]);
                argument.type = typeof evalType == 'function' ? evalType : evalType.constructor;
                argument.defaultValue = typeof evalType == 'function' ? undefined : evalType;
                argument.required = !!argument.defaultValue;
                argument.values = evalType instanceof TypeJSType ? evalType : undefined;

                if (argument.type) {
                    newParams.push(argument);
                }
            }
        });
    }

    return newParams;
}

export function extractContentBetween(openChar, closeChar, text, start = 0) {
    let begin = text.indexOf(openChar, start) + 1;
    let end = begin;
    if (begin !== -1) {
        let open = 1;
        for (end; end < text.length && open > 0; end++) {
            if (text[end] == openChar) open++;
            if (text[end] == closeChar) open--;
        }
    }
    end -= 1;

    return { start: begin, end };
}