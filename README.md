
# Script Type JS

Dynamic JS typed code, using an inheritance prototype and replacing class properties and methods with a validation arguments function.
Generates errors with wrong type information and crashes front-end UI


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Installation

Install Script Type JS with npm

```bash
  npm i script-type-js
```
## Activation
### Configuration file
```javascript
// script_type.config.js
import ScriptTypeJS from "script-type-js";

// mode = 'dev' activate type checking and the errorMode behaviour, other value deactivate
// errorMode = 'frontend' destroy DOM and show error messages on the console and the document.body, other value for only console display
ScriptTypeJS.mode = 'dev';
ScriptTypeJS.errorMode = 'frontend';

export default ScriptTypeJS.apply();
```

### Main file of our project
Just import our configuration file :
```javascript
import ScriptTypeJS from "./script_type.config";
```


## Usage/Examples
### Enums
```javascript
import { Enum } from "script-type-js";

const Sex = new Enum({
    male: 1,
    female: 2
});
```

### Personalized types
```javascript
// Object Type
const TPerson = T({ firstname: String, lastname: String, age: Number });

// Multi native types
const TAvailableType = T({String, Number});
```

### Class
```javascript
import ScriptTypeJS, { Enum } from "script-type-js";

Sex = new Enum({
    male: 1,
    female: 2
});

 class Person {    
    set sex(value = Sex) { this._sex = value; }
    get sex() { return this._sex; }

    get fullname() { return this._fullname; }
    set fullname(value) { this._fullname = value; }

    constructor() {
        this._fullname = '';
        this.firstname = '';
        this.language = Language;
        this.lastname = T({ String, Number });
    }

    // Function setFullName accept multitype for argument lastname
    setFullName(firstname = String, lastname = { String, Number }) {
        this.firstname = firstname;
        this.lastname = lastname;
        this._fullname = firstname + ' ' + lastname;
    }

    setSexe(sex = Sex) {
        this.sex = sex;
    }

    chooseLanguage(language = Language) {
        this.language = language       
    }

    apply(p = Person) {
        this.fullname = p.fullname;
        this.firstname = p.firstname;
        this.lastname = p.lastname;
    }

    static create(fullname = String('John Doe')) {
        const p = new Person();
        p.fullname = fullname;
        const names = fullname.split(' ');
        p.firstname = names[0];
        p.lastname = names[1];
        return p;
    }
}

// Declare to Script Type
ScriptTypeJS.declare({ Sex, Person });
```
Class with interface in function argument
```javascript
class SayHello {
    static staticProp = Number(10);
    static staticFunc() { console.log('Hello'); }

    classProp = String('Hello');

    // Method need a Speaker implementation object
    static run(speaker = Speaker, person = Person) {
        const now = new Date();

        speaker.say('Hello', person, new Date());
    }
}

ScriptTypeJS.declare({ SayHello });
```
### Interface
Class with multi-interfaces implementation
- Interface file Translator.js
```javascript
import ScriptTypeJS, { Enum } from "script-type-js";

const Language = new Enum({
    'FR': 'French',
    'EU': 'English',
    'DE': 'Deutch',
});

class Translator {
    translate(text = String) { }

    setLanguage(language = Language) { }
}
```

- Interface file Speaker.js
```javascript
class Speaker {
    static helloWorld() { }

    say(text = String, to = Person, at = new Date()) { }
}
```

- Class file EnglishSpeaker.js
```javascript
// Class with interfaces implementation
class EnglishSpeaker {    
    say(text, to, at = Date()) {
        console.log(`On ${at.toLocaleString()}\nTo ${to.fullname}: ${text}`);
    }

    translate(text) {
        console.log(`Ok, i'm going to translate "${text}" in english`);
    }

    setLanguage(language) {
        console.log(`I translate ${language}`);
    }
}

// Declare in ScriptTypeJS
// Interfaces are automatically declared with their implementations and could be uses as a type
ScriptTypeJS.declare({ EnglishSpeaker }).implements(Speaker, Translator);
```

## In Action
### Interface contract checking
- Good script
```javascript
class EnglishSpeaker {    
    say(text, to, at = Date()) {
        console.log(`On ${at.toLocaleString()}\nTo ${to.fullname}: ${text}`);
    }

    translate(text) {
        console.log(`Ok, i'm going to translate "${text}" in english`);
    }

    setLanguage(language) {
        console.log(`I translate ${language}`);
    }
}

ScriptTypeJS.declare({ EnglishSpeaker }).implements(Speaker, Translator);
```

- Bad change
  
  _Missing method translate_
```javascript
class EnglishSpeaker {    
    say(text, to, at = Date()) {
        console.log(`On ${at.toLocaleString()}\nTo ${to.fullname}: ${text}`);
    }

    setLanguage(language) {
        console.log(`I translate ${language}`);
    }
}

ScriptTypeJS.declare({ EnglishSpeaker }).implements(Speaker, Translator);
```
Throw error:
> Methods [translate] are not defined on class EnglishSpeaker (class EnglishSpeaker implement interface Translator)

_Bad argument naming_
```javascript
class EnglishSpeaker {    
    say(text, person, at = Date()) { // bad naming of agrument #2
        console.log(`On ${at.toLocaleString()}\nTo ${to.fullname}: ${text}`);
    }

   translate(text) {
        console.log(`Ok, i'm going to translate "${text}" in english`);
    }
    setLanguage(language) {
        console.log(`I translate ${language}`);
    }
}

ScriptTypeJS.declare({ EnglishSpeaker }).implements(Speaker, Translator);
```
Throw error:
> Argument #name are wrong in function say (text,person,at = Date()) declaration: to expected for name of argument, person is given

### Value assignment checking
- Good script
```javascript
import ScriptTypeJS, { Enum } from "script-type-js";

import Person, { Sex } from "./Person";
import { EnglishSpeaker } from "./Test";
import { SayHello } from "./SayHello";
import { Language } from "./Translator";

const englishSpeaker = new EnglishSpeaker();

const john = new Person();
john.setFullName('John', 'DOE'); 
john.setFullName('John', 1);      // Accepted with the multi type { String, Number }
john.sex = Sex.male;

englishSpeaker.say('Hello my friend', john);
```

- Bad changes
```javascript
john.sex = 3;
```
Throw error:
> Method set: Argument value (#1) must be Enum { male: 1, female: 2 }, Number 3 is given

```javascript
john.setFullName('John', true);
```
Throw error:
> Method setFullName: Argument lastname (#2) must be Type { String: String, Number: Number }, Boolean true is given

```javascript
englishSpeaker.say('Hello my friend', 'john');
```
Throw error:
> Method run: Argument person (#2) must be a Person, String is given

## BABEL
If you use babel you must exclude the transform-parameter plugin.

```javascript
"presets": [
        [
            "@babel/preset-env",
            {                
                "exclude": ["transform-parameters"]
            }
        ],
    ]
```



## Limitation
Instance type checking is automatically applied when a first method or setter/getter call is made.
In the case of a direct assignment of a property without any method call, getter or setter beforehand, the check is not performed.
To fix this, you can use the static **Class.instanciate(this)** method at the end of the constructor or the static factory method
