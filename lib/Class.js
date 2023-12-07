import TypeJS, { ArgumentsController } from "..";
import * as Utils from "./Utils";

export default class Class {
    static construct(newClass) {
        if (TypeJS.mode !== 'dev' && !TypeJS.types[newClass.prototype.constructor.name]) return;

        if (!newClass.prototype) throw new ClassError(`${newClass} has no prototype`)
        TypeJS.types[newClass.prototype.constructor.name] = newClass;


        Object.getOwnPropertyNames(newClass.prototype.constructor).forEach(property => {
            Utils.bootstrapProperty(newClass.prototype.constructor, property)
        });

        Object.getOwnPropertyNames(newClass.prototype).forEach(property => {
            Utils.bootstrapProperty(newClass.prototype, property);
        });
    }

    static instanciate(thisArg) {
        if (TypeJS.mode !== 'dev') return;

        if (TypeJS.types.hasOwnProperty(thisArg.constructor.name) && !thisArg[TypeJS.instanciationPropertyName]) {
            if (this == ArgumentsController) {
                const constructorCode = '\n\tIn constructor:\n\t\tconstructor() \n\t\t\t...\n\t\t\tClass.insstanciate(this);\n\t\t}';
                const staticFatoryCode = '\n\tIn static factory: \n\t\tstatic create() {\n\t\t\tconst o = new MyClass();\n\t\t\t...\n\t\t\treturn Class.instanciate(o);\n\t\t}';
                console.warn(`TypeJS: Implicit instanciation from class ${thisArg.constructor.name}, type recognition of some properties may be wrong, if static factory constructor is used, types are defined after static factory is called.\nYou can use an explicite TypeJS class instanciation with Class.instanciate(object):${constructorCode}\n${staticFatoryCode}`);
            }

            Object.getOwnPropertyNames(thisArg).forEach(property => {
                Utils.bootstrapProperty(thisArg, property);
            });

            thisArg[TypeJS.instanciationPropertyName] = true;
        }
        return thisArg;
    };
}
