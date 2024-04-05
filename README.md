# reset-image-orientation
Reset uploaded image orientation based on EXIF

## Installation

```sh
npm install reset-image-orientation
```

## Javascript example

```javascript
var resetOrientation = require('reset-image-orientation');

var input = document.querySelector('input[type="file"]');
var img = document.querySelector('img');

input.addEventListener('change', function(e) {
    e.preventDefault();

    var file = e.target.files[0];

    resetOrientation.default()(file, function(base64) => {
        img.src = base64;
    });
});
```

## Typescript example

```typescript
import resetOrientation from 'reset-image-orientation';

const input = document.querySelector('input[type="file"]');
const img = document.querySelector('img');

input.addEventListener('change', function(e: Event) {
    e.preventDefault();

    var file = e.target.files[0];

    resetOrientation(file, function(base64: string) => {
        img.src = base64;
    });
});
```

## License

[MIT](LICENSE)
