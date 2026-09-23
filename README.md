@honeybdg/viewer
===========
UI для просмотра изображений

Установка:
-----------------
```bash
$ npm i @honeybdg/viewer
```

`pdfjs-dist` (версия `2.7.570`) уже входит в пакет. Отдельно устанавливать его не нужно.

Поддерживаются:
  - файлы, которые могут быть отображены через HTML-элемент `<img />`;
  - PDF (`application/pdf`) при подключении нужных модулей.

Оглавление
-----------------
1. [React](#react)
2. [Pure JS](#purejs)
3. [pdf.js](#pdfjs)

<a name="react">React</a>
---------------

```js
import '@honeybdg/viewer/dist/viewer.min.css';
import { ViewerComponent } from '@honeybdg/viewer';

<ViewerComponent
  files={[
    {
      mimeType: 'image/jpeg',
      src: 'http://example.com/image.jpg',
    },
    {
      mimeType: 'application/pdf',
      src: 'http://example.com/document.pdf',
    },
  ]}
  fileIndex={0}
  open={true}
  closable
  onChangeFile={(fileIndex) => {}}
  onRotate={(fileIndex, deg) => {}}
  onRollback={() => {}}
  onClose={() => {}}
/>
```

Если надо использовать в react<`v16.8`, то надо использовать
```js
import { ViewerComponentLegacy } from '@honeybdg/viewer';
```

### Props
| Prop | Тип | Обязательный | Описание |
| --- | --- | --- | --- |
| `files` | `{ mimeType: string; src: string }[]` | Да | Список файлов |
| `fileIndex` | `number` | Нет | Индекс отображаемого файла |
| `open` | `boolean` | Нет | Показать/скрыть Viewer |
| `closable` | `boolean` | Нет | Показывать кнопку закрытия |
| `onChangeFile` | `(fileIndex: number) => void` | Нет | Callback при смене активного файла |
| `onRotate` | `(fileIndex: number, deg: number) => void` | Нет | Callback при повороте файла |
| `onRollback` | `() => void` | Нет | Callback при сбросе |
| `onClose` | `() => void` | Нет | Callback при закрытии |

<a name="purejs">Pure JS</a>
---------------

```html
<link rel="stylesheet" href="node_modules/@honeybdg/viewer/dist/viewer.min.css"/>
<script src="node_modules/@honeybdg/viewer/dist/viewer.min.js"></script>
```
```js
const viewer = new Viewer({
  container: document.getElementById('viewer'),
  files: [
    {
      mimeType: 'image/jpeg',
      src: 'http://example.com/image.jpg',
    },
    {
      mimeType: 'application/pdf',
      src: 'http://example.com/document.pdf',
    },
  ],
  closable: true,
  onChangeFile: (fileIndex) => {},
  onRotate: (fileIndex, deg) => {},
  onRollback: () => {},
  onClose: () => {},
});
```
### Конструктор
| Параметр | Тип | Обязательный | Описание |
| --- | --- | --- | --- |
| `container` | `HTMLElement` | Да | Контейнер Viewer |
| `files` | `{ mimeType: string; src: string }[]` | Да | Список файлов |
| `closable` | `boolean` | Нет | Показывать кнопку закрытия |
| `onChangeFile` | `(fileIndex: number) => void` | Нет | Callback при смене активного файла |
| `onRotate` | `(fileIndex: number, deg: number) => void` | Нет | Callback при повороте файла |
| `onRollback` | `() => void` | Нет | Callback при сбросе |
| `onClose` | `() => void` | Нет | Callback при закрытии |

### Методы
| Метод | Параметры | Возвращает | Описание |
| --- | --- | --- | --- |
| `show` | `index?: number` | `void` | Показать Viewer. `index` — индекс файла для отображения |
| `hide` | — | `void` | Скрыть Viewer |
| `setFiles` | `files: { src: string; mimeType: string }[]` | `void` | Установить список файлов |
| `setClosable` | `value: boolean` | `void` | Показать или скрыть кнопку закрытия |
| `scale` | `value: number` | `void` | Изменить масштаб |
| `rotate` | `value: number` | `void` | Повернуть файл на указанный угол |
| `reset` | — | `void` | Сбросить все параметры к значениям по умолчанию |
| `renderFile` | `index?: number` | `void` | Отобразить файл. `index` — индекс файла |
| `changeFile` | `value: number` | `void` | Изменить активный файл на указанное количество позиций |
| `rollback` | — | `void` | Вернуть файл к первоначальному состоянию |

### Свойства
| Свойство | Тип | Описание |
| --- | --- | --- |
| `container` | `HTMLElement` | Контейнер Viewer |
| `files` | `{ mimeType: string; src: string }[]` | Список файлов |
| `closable` | `boolean` | Возможность закрытия Viewer |
| `fileIndex` | `number` | Индекс активного файла |
| `rotation` | `number` | Текущий угол поворота |

<a name="pdfjs">pdf.js</a>
---------------

Для работы с PDF необходимо подключить модули pdf.js:

### Web Worker (рекомендуется)
```js
import * as pdfjsLib from '@honeybdg/viewer/dist/pdf.min.js';
pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(new URL(
  '@honeybdg/viewer/dist/pdf.worker.min.js',
  import.meta.url
));
window.pdfjsLib = pdfjsLib;
```
или
```html
<script src="node_modules/@honeybdg/viewer/dist/pdf.min.js"></script>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/@honeybdg/viewer/dist/pdf.worker.min.js'
</script>
```

### Fake Worker
```js
import * as pdfjsLib from '@honeybdg/viewer/dist/pdf.min.js';
import * as pdfjsWorker from '@honeybdg/viewer/dist/pdf.worker.min.js';

const global = typeof window !== 'undefined' ? window : {};
global.pdfjsLib = pdfjsLib;
global.pdfjsWorker = pdfjsWorker;
```
или
```html
<script src="node_modules/@honeybdg/viewer/dist/pdf.min.js"></script>
<script src="node_modules/@honeybdg/viewer/dist/pdf.worker.min.js"></script>
```
