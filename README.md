@honeybdg/viewer
================
UI for viewing images

## Install

```bash
npm install @honeybdg/viewer
```

Or use directly in browser:

```html
<script src="https://unpkg.com/@honeybdg/viewer/dist/viewer.min.js"></script>
```

## Usage

### Vanilla JS

```javascript
import { Viewer } from '@honeybdg/viewer';

const viewer = new Viewer({
  container: document.getElementById('viewer'),
  files: [
    { src: 'image1.jpg' },
    { src: 'image2.jpg' },
  ],
  onChangeFile: (index) => console.log(index),
  onClose: () => viewer.hide(),
});

viewer.show(0);
```

### React

```jsx
import { ViewerComponent } from '@honeybdg/viewer';

<ViewerComponent
  open={true}
  files={[{ src: 'image.jpg' }]}
  onChangeFile={(index) => console.log(index)}
  onClose={() => setOpen(false)}
/>
```

## API

### `new Viewer(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | required | Container element |
| `files` | `{ src: string }[]` | required | Image list |
| `closable` | `boolean` | `true` | Show/hide close button |
| `nocache` | `boolean` | `false` | Add cache-busting to URLs |
| `onChangeFile` | `(index: number) => void` | - | File change callback |
| `onRotate` | `(index: number, deg: number) => void` | - | Rotate callback |
| `onRollback` | `() => void` | - | Reset callback |
| `onClose` | `() => void` | - | Close callback |

### Methods

| Method | Description |
|--------|-------------|
| `show(index?)` | Show viewer |
| `hide()` | Hide viewer |
| `scale(value)` | Zoom in/out (0.5x - 4x) |
| `rotate(deg)` | Rotate image |
| `reset()` | Reset zoom/position/rotation |
| `changeFile(offset)` | Navigate files (-1 prev, +1 next) |
| `setFiles(files)` | Update file list |
| `setClosable(bool)` | Toggle close button |

### `<ViewerComponent>` props

Same as Viewer options plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Show/hide |
| `fileIndex` | `number` | - | Initial file index |

Also accepts any `div` HTML attributes.

## Controls

| Action | How |
|--------|-----|
| Zoom | `Ctrl + Scroll` or buttons |
| Pan | Click and drag |
| Rotate | `Ctrl + ←/→` or buttons |
| Navigate | Arrow buttons |
