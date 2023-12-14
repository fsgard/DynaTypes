import ScriptTypeJS, { ArgumentsController } from "..";
import Arguments from "./Arguments";
import { TypeJSType, T } from "./Types";

export function defineClassProperty(thisArg, property) {
    if (thisArg.protorype && Object.getOwnPropertyNames(Object).includes(property)) return;

    const descriptor = Object.getOwnPropertyDescriptor(thisArg, property);
    if (descriptor.configurable) {
        const hasGetter = !!descriptor.get;
        const hasSetter = !!descriptor.set;
        const argument = new Arguments(property);

        if (hasGetter) {
            Object.defineProperty(thisArg, property, {
                get: function () {
                    ScriptTypeJS.checkInstanciation(this);
                    return descriptor.get();
                }
            });
        }

        if (hasSetter) {
            Object.defineProperty(thisArg, property, {
                set: function (value) {
                    ArgumentsController.on(descriptor.set).bind(this)(value);
                }
            });
        }
        else {
            argument.value = typeof thisArg[property] === 'function' ? thisArg[property]() : thisArg[property];

            if (argument.value instanceof TypeJSType) {
                argument.type = argument.value.constructor;
                argument.values = argument.value;
                argument.value = undefined;
                argument.required = true
            }
            else argument.type = typeof thisArg[property] == 'function' ? thisArg[property] : thisArg[property].constructor;

            const privateProperty = ScriptTypeJS.getTypeJSNameOf(property);
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
                        ScriptTypeJS.checkInstanciation(this);
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
    if (!object[ScriptTypeJS.methodPropertyName]) object[ScriptTypeJS.methodPropertyName] = {};
    if (!object[ScriptTypeJS.methodPropertyName][property]) {
        object[property] = ArgumentsController.on(object[property]);
        object[ScriptTypeJS.methodPropertyName][property] = true;
    }
}

export function implementInterfaceMethod(interfaceObject, classObject, method) {
    if (typeof interfaceObject[method.name] === 'function') {
        if (classObject.hasOwnProperty(method.name)) {
            classObject[method.name] = ArgumentsController.on(classObject[method.name], ...method.arguments.collection);
        }
        else {
            return false
        }
        return true;
    }
    return false
}

export function bootstrapProperty(object, property) {
    if (object.hasOwnProperty(ScriptTypeJS.getTypeJSNameOf(property))) return;
    if (property.startsWith(ScriptTypeJS.getTypeJSPrefix())) return;
    if (Object.prototype.hasOwnProperty(property)) return;


    if (typeof object[property] === 'function') {
        defineClassMethod(object, property);
    }
    else {
        defineClassProperty(object, property);
    }
}

export function explodeParamsFunction(paramsList) {
    const newParams = [];

    let params = paramsList.filter(Boolean).map(element => element.split('=').map(element => element.trim()));
    const argsList = params.map(param => param[0] + "=" + ScriptTypeJS.getTypeDeclaration(param[1]));
    const functionBody = `return {${params.map(param => param[0]).join(",")}};`

    params = Function(...argsList, functionBody)();

    Object.entries(params).forEach(([name, value]) => {
        const argument = new Arguments(name);

        if (value) {
            if (value.constructor === Object) {
                value = T(value);

            }
            argument.type = typeof value == 'function' ? value : value.constructor;
            argument.defaultValue = (typeof value == 'function' || value instanceof TypeJSType) ? undefined : value;
            argument.required = !argument.defaultValue;
            argument.values = value instanceof TypeJSType ? value : undefined;
        }
        newParams.push(argument);
    });


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

export function extractParams(paramString) {
    const openChar = ['(', '[', '{'];
    const closeChar = [')', ']', '}'];
    const params = [];
    let paramItem = '';
    let isOpen = 0;
    for (let i = 0; i < paramString.length; i++) {
        const char = paramString[i];
        isOpen += openChar.includes(char) ? 1 : 0;
        isOpen -= closeChar.includes(char) ? 1 : 0;
        if (char == ',' && isOpen == 0) {
            params.push(paramItem.trim());
            paramItem = '';
        }
        else paramItem += char;
    }
    params.push(paramItem.trim());

    return params;
}