const TypeJSErrorMode = Object.freeze({
    default: '',
    frontend: 'frontend'
});

class TypeJSError extends Error {
    static mode = TypeJSErrorMode.default;

    constructor(message, name) {
        super(message);
        this.name = name;
        if (TypeJSError.mode === TypeJSErrorMode.frontend) {
            const stack = (this.stack || this.stacktrace).split('\n');
            document.body.innerHTML = `<div style="background-color: black; font-size: 1.5em; color:white; padding: 1em; height:100vh">
                <p><span style="color: red; font-weight: 600">${message}</span></br><ul>${stack.map(item => item ? `<li>${item}</li>` : '').join('')}</ul></p>
                <p><span style="color: deepskyblue; font-weight: 600; font-size:0.8em">See console for more informations...</span></p>
                <div>`;
        }
    }
}



class ClassError extends TypeJSError {
    constructor(message) {
        super(message, "ClassError");
    }
}

class InterfaceError extends TypeJSError {
    constructor(message) {
        super(message, "InterfaceError");
    }
}

class ArgumentsControllerError extends TypeJSError {
    constructor(message) {
        super(message, "ArgumentsControllerError");
    }
}

class PropertiesControllerError extends TypeJSError {
    constructor(message) {
        super(message, "ArgumentsControllerError");
    }
}

export { TypeJSErrorMode, TypeJSError, ArgumentsControllerError, PropertiesControllerError, InterfaceError };