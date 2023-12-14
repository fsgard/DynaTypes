
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
- Enums
```javascript
import { Enum } from "script-type-js";

const Sex = new Enum({
    male: 1,
    female: 2
});
```

- Personalized types
```javascript
import ScriptTypeJS, { T } from "script-type-js";

// Object Type
const TPerson = T({ firstname: String, lastname: String, age: Number });

// Multi native types
const TAvailableType = T({String, Number});

ScriptTypeJS.declare({ TPerson, TAvailableType });
```

- Class

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

- Interface

Class with multi-interfaces implementation
```javascript
import ScriptTypeJS, { Enum } from "script-type-js";

const Language = new Enum({
    'FR': 'French',
    'EU': 'English',
    'DE': 'Deutch',
});


// Interfaces
class Translator {
    translate(text = String) { }

    setLanguage(language = Language) { }
}

class Speaker {
    static helloWorld() { }

    say(text = String, to = Person, at = new Date()) { }
}

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

// Declare to Script Type
// Interfaces are automatically declared with their implementations and could be uses as a type
ScriptTypeJS.declare({ EnglishSpeaker }).implements(Speaker, Translator);
```
> [!NOTE]
> In this case if EnglishSpeaker class doesn't respect the contract of Translator and Speaker, an error is throwed: 
'#FF0000' Uncaught InterfaceError: Methods [translate] are not defined on class EnglishSpeaker (class EnglishSpeaker implement interface Function)

## In Action

- Good script
```javascript
import ScriptTypeJS, { Enum } from "script-type-js";

import Person, { Sex } from "./Person";
import { EnglishSpeaker, FrenchSpeaker } from "./Test";
import { SayHello } from "./SayHello";
import { Language } from "./Translator";

const englishSpeaker = new EnglishSpeaker();

const john = new Person();
john.setFullName('John', 'DOE');
john.sex = Sex.male;

englishSpeaker.say('Hello my friend', john);
```

- Bad types


## Limitation
