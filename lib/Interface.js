import { InterfaceError } from "./Errors";
import Method from "./Method";
import TypeJS from "..";
import { implementInterfaceMethod } from "./Utils";

export default class Interface {
    static _implements(...implementedInterfacesList) {
        if (TypeJS.mode !== 'dev') return;

        const unimplementedMethods = [];
        this.__interfaces = []

        implementedInterfacesList.forEach(implementedInterface => {
            const newInterface = new implementedInterface();
            TypeJS.types[implementedInterface.name] = implementedInterface;
            implementedInterface._methods = {};

            for (const property of Object.getOwnPropertyNames(implementedInterface.prototype.constructor).filter(element => typeof implementedInterface.prototype.constructor[element] === 'function')) {
                const method = Method.fromFunction(implementedInterface.prototype.constructor[property]);
                method.isStatic = true;
                if (!implementInterfaceMethod(implementedInterface.prototype.constructor, this.prototype.constructor, method)) {
                    unimplementedMethods.push(method);
                    implementedInterface._methods[property] = method;
                };
            }

            for (const property of Object.getOwnPropertyNames(implementedInterface.prototype).filter(element => typeof implementedInterface.prototype[element] === 'function' && !Object.getOwnPropertyNames(Object.prototype).includes(element))) {
                const method = Method.fromFunction(implementedInterface.prototype[property]);
                if (!implementInterfaceMethod(implementedInterface.prototype, this.prototype, method)) unimplementedMethods.push(method);
                implementedInterface._methods[property] = method;
            };

            this.__interfaces = [...this.__interfaces, implementedInterface];

            if (unimplementedMethods.length > 0) {
                throw new InterfaceError(`Methods [${unimplementedMethods.map(method => (method.isStatic ? 'static ' : '') + method.name).join(', ')}] are not defined on class ${this.prototype.constructor.name} (class ${this.prototype.constructor.name} implement interface ${implementedInterface.constructor.name})`);
            }
        });
        delete this.implements;
    };

    static on(newClass) {
        if (TypeJS.mode !== 'dev') { implement: () => { } };

        TypeJS.types[newClass.name] = newClass;
        newClass.prototype.constructor.implements = Interface._implements;
        return newClass;
    }
}