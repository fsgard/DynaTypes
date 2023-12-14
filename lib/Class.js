import ScriptTypeJS, { InterfaceError, ClassError } from "..";
import Method from "./Method";
import { implementInterfaceMethod, bootstrapProperty } from "./Utils";

export default class Class {
    constructor(newClass) {
        this.class = newClass;
    }

    static construct(newClass) {
        if (ScriptTypeJS.mode !== 'dev' || newClass.__interfaces) return;

        if (!newClass.prototype) throw new ClassError(`${newClass} has no prototype`)
        ScriptTypeJS.types[newClass.prototype.constructor.name] = newClass;


        Object.getOwnPropertyNames(newClass.prototype.constructor).forEach(property => {
            bootstrapProperty(newClass.prototype.constructor, property)
        });

        Object.getOwnPropertyNames(newClass.prototype).forEach(property => {
            bootstrapProperty(newClass.prototype, property);
        });
    }

    static instanciate(thisArg) {
        if (ScriptTypeJS.mode !== 'dev') return;

        if (ScriptTypeJS.types.hasOwnProperty(thisArg.constructor.name) && !thisArg.constructor[ScriptTypeJS.instanciationPropertyName]) {
            if (this == ScriptTypeJS) {
                const constructorCode = '\n\tIn constructor:\n\t\tconstructor() \n\t\t\t...\n\t\t\tClass.instanciate(this);\n\t\t}';
                const staticFatoryCode = '\n\tIn static factory: \n\t\tstatic create() {\n\t\t\tconst o = new MyClass();\n\t\t\t...\n\t\t\treturn Class.instanciate(o);\n\t\t}';
                console.warn(`ScriptTypeJS: Implicit instanciation from class ${thisArg.constructor.name}.\nType recognition of some properties may be wrong, if you use direct assignation property before calling class methods or if static factory constructor is used (types are defined after static factory is called).\nYou can use an explicite ScriptTypeJS class instanciation with Class.instanciate(object):${constructorCode}\n${staticFatoryCode}`);
            }

            Object.getOwnPropertyNames(thisArg).forEach(property => {
                bootstrapProperty(thisArg, property);
            });

            thisArg.constructor[ScriptTypeJS.instanciationPropertyName] = true;
        }

        return thisArg;
    };

    implements(...interfaces) {
        if (ScriptTypeJS.mode !== 'dev') return;

        const unimplementedMethods = [];
        this.class.__interfaces = []

        if (!ScriptTypeJS.interfaces) ScriptTypeJS.interfaces = {};

        interfaces.forEach(implementedInterface => {
            const newInterface = new implementedInterface();
            ScriptTypeJS.interfaces[implementedInterface.name] = implementedInterface;
            implementedInterface._methods = {};

            for (const property of Object.getOwnPropertyNames(implementedInterface.prototype.constructor).filter(element => typeof implementedInterface.prototype.constructor[element] === 'function')) {
                const method = Method.fromFunction(implementedInterface.prototype.constructor[property]);
                method.isStatic = true;
                if (!implementInterfaceMethod(implementedInterface.prototype.constructor, this.class.prototype.constructor, method)) {
                    unimplementedMethods.push(method);
                    implementedInterface._methods[property] = method;
                };
            }

            for (const property of Object.getOwnPropertyNames(implementedInterface.prototype).filter(element => typeof implementedInterface.prototype[element] === 'function' && !Object.getOwnPropertyNames(Object.prototype).includes(element))) {
                const method = Method.fromFunction(implementedInterface.prototype[property]);
                if (!implementInterfaceMethod(implementedInterface.prototype, this.class.prototype, method)) unimplementedMethods.push(method);
                implementedInterface._methods[property] = method;
            };

            this.class.__interfaces = [...this.class.__interfaces, implementedInterface];

            if (unimplementedMethods.length > 0) {
                throw new InterfaceError(`Methods [${unimplementedMethods.map(method => (method.isStatic ? 'static ' : '') + method.name).join(', ')}] are not defined on class ${this.class.prototype.constructor.name} (class ${this.class.prototype.constructor.name} implement interface ${implementedInterface.prototype.constructor.name})`);
            }
        });
    }
}
