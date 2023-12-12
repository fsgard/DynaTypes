
# Dyna-type

Dynamic JS typed code, using an inheritance prototype and replacing class properties and methods with a validation arguments function.
Generates errors with wrong type information and crashes front-end UI


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Installation

Install dyna-types with npm

```bash
  npm install dyna-types
```
    
## Usage/Examples
- Enums
```javascript
import { Enum } from "dyna-types";

const Sex = new Enum({
    male: 1,
    female: 2
});
```

- Personalized types
```javascript
import { T } from "dyna-types";

// Object Type
const TPerson = T({ firstname: String, lastname: String, age: Number });

// Multi native types
const TAvailableType = T({String, Number});
```

- Class

```javascript
import { T } from "dyna-types";

Sex = new Enum({
    male: 1,
    female: 2
});

class Person {    
    get fullname() { return this._fullname; }
    set fullname(value) { this._fullname = value; }

    constructor() {
        super();
        this._fullname = '';
        this.firstname = '';
        this.lastname = ''
        this.sex = Sex;
    }

    setFullName(firstname = String, lastname = String('test')) {
        this.firstname = firstname;
        this.lastname = lastname;
        this._fullname = firstname + ' ' + lastname;
    }

    setSexe(sex = Sex) {
        this.sex = sex;
    }

    apply(person = Person) {
        this.firstname = person.firstname;
        this.lastname = person.lastname;
        this._fullname = person.firstname + ' ' + person.lastname;
    }      
}
```

- Interface

Class with multi-interfaces implementation
```javascript
import { Enum, Interface } from "dyna-types";
export const Language = new Enum({
    'FR': 'french',
    'EU': 'English',
    'DE': 'Deutch',
});


class Translator {
    translate(text = String) { }

    setLanguage(language = Language) { }
}

class Speaker {
    static helloWorld() {
        console.log('Interface static function call');
    }

    hello(a = Speaker, b = Date, c = 'Hello') { }
}

class EnglishSpeaker {
    static helloWorld(person, date = new Date()) {
        console.log(`Hello world, my name is ${person.name}, it's ${date.toLocaleString()}`);
    }

    hello(person, date = new Date()) {
        console.log(`Hello ${person.name} at ${date.toLocaleString()}`);
    }

    translate(text) {
        console.log(`Ok, i'm going to translate "${text}" in english`);
    }

    setLanguage(language) {
        console.log(`I translate ${language}`);
    }
}
Interface.on(EnglishSpeaker).implements(Speaker, Translator);

```