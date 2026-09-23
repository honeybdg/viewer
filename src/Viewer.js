import arrowLeftIcon from './images/arrow-left.svg';
import arrowRightIcon from './images/arrow-right.svg';
import closeIcon from './images/close.svg';
import loadingIcon from './images/loading.svg';
import minusIcon from './images/minus.svg';
import plusIcon from './images/plus.svg';
import rollbackIcon from './images/rollback.svg';
import rotateLeftIcon from './images/rotate-left.svg';
import rotateRightIcon from './images/rotate-right.svg';

/**
 * Файл для просмотра
 * @typedef {object} File
 * @property {string} mimeType - mimeType файла
 * @property {string} src - источник файла
 */

/**
 * callback при смене файла
 * @callback OnChangeFile
 * @param {number} fileIndex - индекс активного файла
 * @returns {void}
 */

/**
 * callback при повороте файла
 * @callback OnRotate
 * @param {number} fileIndex - индекс файла
 * @param {number} deg - угол поворота
 * @returns {void}
 */

/**
 * callback при сбросе
 * @callback OnRollback
 * @returns {void}
 */

/**
 * callback при нажатии на крестик
 * @callback OnClose
 * @returns {void}
 */

/**
 * @class
 * @param {object} props - props
 * @param {HTMLElement} props.container - контейнер где будет находится UI
 * @param {File[]} props.files - список файлов
 * @param {boolean=} props.closable - показать/скрыть кнопку "закрыть"
 * @param {OnChangeFile=} props.onChangeFile - callback при смене файла
 * @param {OnRotate=} props.onRotate - callback при повороте файла
 * @param {OnRollback=} props.onRollback - callback при сбросе
 * @param {OnClose=} props.onClose - callback при закрытии
 * @returns {Viewer}
 */
export default function Viewer(props) {
  const { container, files, closable = true, onChangeFile, onRotate, onRollback, onClose } = props;
  this.container = container;
  this.files = files;
  this.closable = closable;
  this.onChangeFile = onChangeFile;
  this.onRotate = onRotate;
  this.onRollback = onRollback;
  this.onClose = onClose;

  /**
   * Дефолтные значения css matrix()
   * @type {number[]}
   */
  this.defaultMatrix = [1, 0, 0, 1, 0, 0];

  /**
   * Дефолтные данные перемещения
   * @type {Record<'fileX'|'fileY'|'x'|'y'|'startScrollTop', number>}
   */
  this.defaultDragData = { fileX: 0, fileY: 0, x: 0, y: 0, startScrollTop: 0 };

  /**
   * Значения css matrix()
   * @type {number[]}
   */
  this.matrix = Array.from(this.defaultMatrix);

  /**
   * Данные перемещения
   * @type {Record<'fileX'|'fileY'|'x'|'y', number>}
   */
  this.dragData = Object.assign({}, this.defaultDragData);

  /**
   * Угол поворота
   * @type {number}
   */
  this.rotation = 0;

  /**
   * Индекс активного файла
   * @type {number}
   */
  this.fileIndex = 0;

  /**
   * Признак что можно перемещать изображение
   * @type {boolean}
   */
  this.isDragging = false;

  /**
   * Значение границы за которую изображение не должно уходить (в px)
   * @type {Record<'x'|'y', number>}
   */
  this.bounder = { x: 0, y: 0 };

  /**
   * @type {HTMLDivElement}
   */
  this.viewer = null;

  /**
   * @type {HTMLInputElement}
   */
  this.inputPercent = null;

  /**
   * @type {HTMLInputElement}
   */
  this.inputNumberFile = null;

  /**
   * @type {HTMLSpanElement}
   */
  this.spanTotalFile = null;

  /**
   * @type {HTMLDivElement}
   */
  this.otherDiv = null;

  /**
   * @type {HTMLButtonElement}
   */
  this.closeButton = null;

  /**
   * @type {HTMLDivElement}
   */
  this.contentContainer = null;

  /**
   * @type {HTMLSpanElement}
   */
  this.fileWrapper = null;

  /**
   * @type {HTMLSpanElement}
   */
  this.loader = null;

  /**
   * @type {HTMLImageElement}
   */
  this.fileImage = null;

  /**
   * @type {HTMLDivElement}
   */
  this.dragPagePdf = null;

  this.build();
}

Viewer.prototype = {
  /**
   * Показать viewer
   * @param {number=} index - индекс файла который надо отобразить
   * @returns {void}
   */
  show(index) {
    this.renderFile(index);
    if (!this.container.contains(this.viewer)) {
      this.container.appendChild(this.viewer);
    }
  },

  /**
   * Скрыть viewer
   * @returns {void}
   */
  hide() {
    this.reset();
    this.viewer.remove();
  },

  /**
   * Установить список файлов
   * @param {{ src: string, mimeType: string }[]} files - список файлов
   * @returns {void}
   */
  setFiles(files) {
    this.files = files;
    this.spanTotalFile.innerHTML = this.files.length;
  },

  /**
   * Установить отображение кнопки "закрыть"
   * @param {boolean} value - true(показать)/false(скрыть)
   * @returns {void}
   */
  setClosable(value) {
    this.closable = Boolean(value);
    const contains = this.otherDiv.contains(this.closeButton);
    if (this.closable && !contains) {
      this.otherDiv.appendChild(this.closeButton);
    } else if (!this.closable && contains) {
      this.closeButton.remove();
    }
  },

  /**
   * Изменить масштаб
   * @param {number} value - коэффициент масштабирования
   * @returns {void}
   */
  scale(value) {
    if (this.files.length) {
      if ((this.matrix[0] === 0.5 && value < 0) || (this.matrix[0] === 4 && value > 0)) { return; }
      this.matrix[0] = parseFloat((this.matrix[0] + value).toFixed(1));
      this.matrix[3] = parseFloat((this.matrix[3] + value).toFixed(1));
      this.inputPercent.value = `${Math.round(this.matrix[0] * 100)}%`;
      this.updateMatrix();
    }
  },

  /**
   * Повернуть
   * @param {number} value - градус поворота
   * @returns {void}
   */
  rotate(value) {
    // это надо чтобы он безумно не крутился при reset
    if (this.rotation === 0 && value === 0) {
      this.fileWrapper.classList.remove('viewer-file-wrapper-rotate');
    } else if (!this.fileWrapper.classList.contains('viewer-file-wrapper-rotate')) {
      this.fileWrapper.classList.add('viewer-file-wrapper-rotate');
    }
    this.rotation += value;

    if (this.files[this.fileIndex].mimeType.indexOf('image/') !== -1) {
      this.fileImage.style.transform = `rotate(${this.rotation}deg)`;
      if (this.onRotate) {
        const normalizedRotation = ((this.rotation % 360) + 360) % 360;
        this.onRotate(this.fileIndex, normalizedRotation);
      }
    } else if (this.files[this.fileIndex].mimeType === 'application/pdf') {
      this.fileWrapper.querySelectorAll('.viewer-content-page-pdf').forEach((page) => {
        page.querySelector('canvas').style.transform = `rotate(${this.rotation}deg)`;

        if (this.rotation === 0 && value === 0) {
          page.style.width = null;
          page.style.height = null;
        } else {
          const clientWidth = page.clientWidth;
          const clientHeight = page.clientHeight;
          page.style.width = clientHeight + 'px';
          page.style.height = clientWidth + 'px';
        }
      });
    }
  },

  /**
   * Сброс всех параметров к дефолту
   * @returns {void}
   */
  reset() {
    // чтобы файл не крутился обратно кучу раз при сбросе :)
    this.matrix = Array.from(this.defaultMatrix);
    this.dragData = Object.assign({}, this.defaultDragData);
    this.rotation = 0;
    this.isDragging = false;
    this.inputPercent.value = '100%';
    this.fileImage.style.transform = null;
    this.updateMatrix();
  },

  /**
   * Отрисовать файл
   * @param {number=} index - индекс файла который надо отобразить
   * @returns {void}
   */
  renderFile(index) {
    this.reset();
    this.fileWrapper.innerHTML = '';
    this.fileIndex = this.files[index] ? index : 0;
    this.contentContainer.style.overflow = null;
    const inputNumberValue = this.fileIndex + 1;
    this.inputNumberFile.size = String(inputNumberValue).length;

    if (this.files.length) {
      this.loader.style.display = 'block';
      this.fileWrapper.style.display = 'none';
      this.inputNumberFile.value = inputNumberValue;
      const file = this.files[this.fileIndex];

      if (file.mimeType.indexOf('image/') !== -1) {
        this.fileImage.src = file.src;
        this.fileWrapper.appendChild(this.fileImage);
      } else if (file.mimeType === 'application/pdf') {
        if (!window.pdfjsLib) {
          throw new Error('pdf.js модуль не найден (window.pdfjsLib). Возможно, он не был подключен');
        }

        const startFile = this.files[this.fileIndex];
        this.contentContainer.style.overflowY = 'auto';
        window.pdfjsLib.getDocument(file.src).promise.then((pdf) => {
          /**
           * Отрисовка страниц pdf
           * @param {number} numPages - номер страницы
           * @returns {void}
           */
          const renderPage = (numPages) => {
            if (numPages > pdf.numPages) {
              this.onLoad();
              return;
            }

            pdf.getPage(numPages).then((page) => {
              const currentFile = this.files[this.fileIndex];
              // если во время отрисовки pdf изменились данные, то останавливаемся т.к уже не актуально
              if (
                startFile !== currentFile ||
                startFile.mimeType !== currentFile.mimeType ||
                startFile.src !== currentFile.src
              ) { return; }

              const wrapper = document.createElement('div');
              wrapper.classList.add('viewer-content-page-pdf');
              const canvas = document.createElement('canvas');
              wrapper.appendChild(canvas);
              this.fileWrapper.appendChild(wrapper);

              const context = canvas.getContext('2d');
              const viewport = page.getViewport({ scale: 2 });

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              page.render({ canvasContext: context, viewport: viewport }).promise.then(() => renderPage(numPages + 1));
            });
          };

          renderPage(1);
        });
      }
    } else {
      this.inputNumberFile.value = 0;
      this.loader.style.display = 'none';
    }
  },

  /**
   * Сменить просматриваемый файл
   * @param {number} value - на сколько надо изменить порядковый номер
   * @returns {void}
   */
  changeFile(value) {
    const index = this.fileIndex + value;
    if (index < 0 || this.files.length === index) { return; }
    this.renderFile(index);
    if (this.onChangeFile) { this.onChangeFile(index); }
  },

  /**
   * откат файла к первоначальному состоянию
   * @returns {void}
   */
  rollback() {
    this.reset();
    // это надо чтобы вызвать this.onRotate при this.reset
    this.rotate(0);
    if (this.onRollback) { this.onRollback(); }
  },

  /**
   * Обновить css функцию matrix()
   * @returns {void}
   */
  updateMatrix() {
    this.fileWrapper.style.transform = `matrix(${this.matrix.toString()})`;
  },

  /**
   * Отключить перемещение
   * @returns {void}
   */
  offMovement() {
    this.isDragging = false;
    this.contentContainer.style.cursor = null;
  },

  /**
   * @returns {void}
   */
  onLoad() {
    this.loader.style.display = 'none';
    this.fileWrapper.style.display = null;
  },

  /**
   * @param {WheelEvent} event - событие
   * @returns {void}
   */
  onWheel(event) {
    if (event.ctrlKey) {
      event.preventDefault();
      const value = Math.sign(event.deltaY) < 0 ? 0.1 : -0.1;
      this.scale(value);
    }
  },

  /**
   * @param {MouseEvent} event - событие
   * @returns {void}
   */
  onMouseDown(event) {
    const { pageX, pageY } = event;

    if (this.files.length) {
      this.isDragging = true;
      this.dragData.fileX = this.matrix[4];
      this.dragData.fileY = this.matrix[5];
      this.dragData.x = pageX;
      this.dragData.y = pageY;
      this.dragData.startScrollTop = this.contentContainer.scrollTop;
      this.contentContainer.style.cursor = 'move';

      let width;
      let height;
      let ratio;
      if (this.files[this.fileIndex].mimeType.indexOf('image/') !== -1) {
        /*
          т.к изображение у нас растянуто на 100% по высоте, ширине
          и установлено object-fit: contain; для нормального отображения
          то рассчитывает размер сами чтобы правильно границы установить
        */
        const { naturalWidth, naturalHeight } = this.fileImage;
        width = this.fileImage.width;
        height = this.fileImage.height;
        ratio = naturalWidth / naturalHeight;
      } else if (this.files[this.fileIndex].mimeType === 'application/pdf') {
        this.dragPagePdf = event.target.closest('.viewer-content-page-pdf') || this.dragPagePdf;
        if (!this.dragPagePdf) { return; }

        const { clientWidth, clientHeight } = this.dragPagePdf;
        width = clientWidth;
        height = clientHeight;
        ratio = clientWidth / clientHeight;
      }

      let size;
      if (ratio > (width / height)) {
        size = [width, width / ratio];
      } else {
        size = [height * ratio, height];
      }

      // учитываем угол поворота
      if ((this.rotation % 180) !== 0) {
        size.reverse();
      }

      // учитываем масштаб и даем утащить только половину за границу
      this.bounder.x = Math.round(size[0] / 2 * this.matrix[0]);
      this.bounder.y = Math.round(size[1] / 2 * this.matrix[0]);
    }

    event.stopPropagation();
    event.preventDefault();
  },

  /**
   * @param {MouseEvent} event - событие
   * @returns {void}
   */
  onMouseMove(event) {
    if (!this.isDragging) { return; }
    event.preventDefault();

    const { pageX, pageY } = event;
    const { fileX, fileY, x, y, startScrollTop } = this.dragData;

    const moveX = fileX - (x - pageX);
    const moveY = fileY - (y - pageY);
    if (moveX <= this.bounder.x && moveX >= -this.bounder.x) { this.matrix[4] = moveX; }
    if (moveY <= this.bounder.y && moveY >= -this.bounder.y) {
      this.matrix[5] = moveY;
    } else if (this.files[this.fileIndex].mimeType === 'application/pdf') {
      this.contentContainer.scrollTop = startScrollTop - (pageY - y);
    }

    this.updateMatrix();
  },

  /**
   * @param {KeyboardEvent} event - событие
   * @returns {void}
   */
  onKeyDown(event) {
    const { ctrlKey, key } = event;
    if (ctrlKey) {
      if (key === 'ArrowLeft') {
        this.rotate(-90);
      } else if (key === 'ArrowRight') {
        this.rotate(90);
      }
    }
  },

  /**
   * Построить viewer
   * @returns {void}
   */
  build() {
    if (!this.viewer) {
      // панель инструментов
      const toolbar = document.createElement('div');
      toolbar.classList.add('viewer-toolbar');

      // масштаб
      const scaleDiv = document.createElement('div');
      scaleDiv.classList.add('viewer-toolbar-scale');
      const minusButton = document.createElement('button');
      minusButton.innerHTML = minusIcon;
      minusButton.setAttribute('title', 'Уменьшить');
      minusButton.addEventListener('click', () => {
        this.scale(-0.1);
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      /**
       * @todo если надо будет можно сделать ручной ввод значения
       */
      this.inputPercent = document.createElement('input');
      this.inputPercent.addEventListener('input', function() { this.value = this.value.replace(/[^\d]/g, ''); });
      this.inputPercent.size = 4;
      this.inputPercent.readOnly = true;
      const plusButton = document.createElement('button');
      plusButton.innerHTML = plusIcon;
      plusButton.setAttribute('title', 'Увеличить');
      plusButton.addEventListener('click', () => {
        this.scale(0.1);
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      scaleDiv.appendChild(minusButton);
      scaleDiv.appendChild(this.inputPercent);
      scaleDiv.appendChild(plusButton);
      toolbar.appendChild(scaleDiv);

      // навигация
      const navDiv = document.createElement('div');
      navDiv.classList.add('viewer-toolbar-nav');
      const arrowLeftButton = document.createElement('button');
      arrowLeftButton.innerHTML = arrowLeftIcon;
      arrowLeftButton.setAttribute('title', 'Предыдущий');
      arrowLeftButton.addEventListener('click', () => {
        this.changeFile(-1);
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      /**
       * @todo если надо будет можно сделать ручной ввод значения
       */
      this.inputNumberFile = document.createElement('input');
      this.inputNumberFile.addEventListener('input', function() { this.value = this.value.replace(/[^\d]/g, ''); });
      this.inputNumberFile.readOnly = true;
      this.spanTotalFile = document.createElement('span');
      this.spanTotalFile.classList.add('viewer-span-total-file');
      this.spanTotalFile.innerHTML = this.files.length;
      const arrowRightButton = document.createElement('button');
      arrowRightButton.innerHTML = arrowRightIcon;
      arrowRightButton.setAttribute('title', 'Следующий');
      arrowRightButton.addEventListener('click', () => {
        this.changeFile(1);
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      navDiv.appendChild(arrowLeftButton);
      navDiv.appendChild(this.inputNumberFile);
      navDiv.appendChild(document.createTextNode('/'));
      navDiv.appendChild(this.spanTotalFile);
      navDiv.appendChild(arrowRightButton);
      toolbar.appendChild(navDiv);

      // прочее
      this.otherDiv = document.createElement('div');
      const rotateLeftButton = document.createElement('button');
      rotateLeftButton.innerHTML = rotateLeftIcon;
      rotateLeftButton.setAttribute('title', 'Повернуть влево');
      rotateLeftButton.addEventListener('click', () => {
        this.rotate(-90);
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      const rotateRightButton = document.createElement('button');
      rotateRightButton.innerHTML = rotateRightIcon;
      rotateRightButton.setAttribute('title', 'Повернуть вправо');
      rotateRightButton.addEventListener('click', () => {
        this.rotate(90);
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      const rollbackButton = document.createElement('button');
      rollbackButton.innerHTML = rollbackIcon;
      rollbackButton.setAttribute('title', 'Сбросить');
      rollbackButton.addEventListener('click', () => {
        this.rollback();
        // чтобы работал поворот по кнопкам клавиатуры
        this.contentContainer.focus();
      });
      this.closeButton = document.createElement('button');
      this.closeButton.innerHTML = closeIcon;
      this.closeButton.setAttribute('title', 'Закрыть');
      this.closeButton.addEventListener('click', () => {
        if (this.onClose) { this.onClose(); }
      });
      this.otherDiv.appendChild(rotateLeftButton);
      this.otherDiv.appendChild(rotateRightButton);
      this.otherDiv.appendChild(rollbackButton);
      if (this.closable) {
        this.otherDiv.appendChild(this.closeButton);
      }
      toolbar.appendChild(this.otherDiv);

      // область контента
      const content = document.createElement('div');
      content.classList.add('viewer-content');
      this.contentContainer = document.createElement('div');
      this.contentContainer.classList.add('viewer-content-container');
      // tabIndex нужен чтобы работало focus() и blur()
      this.contentContainer.tabIndex = -1;
      this.contentContainer.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
      this.contentContainer.addEventListener('keydown', (e) => this.onKeyDown(e));
      this.contentContainer.addEventListener('mousedown', (e) => this.onMouseDown(e));
      this.contentContainer.addEventListener('mouseleave', (e) => this.offMovement(e));
      this.contentContainer.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.contentContainer.addEventListener('mouseup', (e) => this.offMovement(e));
      this.loader = document.createElement('span');
      this.loader.classList.add('viewer-loader');
      this.loader.innerHTML = loadingIcon;
      this.fileWrapper = document.createElement('span');
      this.fileWrapper.classList.add('viewer-file-wrapper');
      this.fileImage = document.createElement('img');
      this.fileImage.addEventListener('load', () => this.onLoad());
      this.fileWrapper.appendChild(this.fileImage);
      this.contentContainer.appendChild(this.loader);
      this.contentContainer.appendChild(this.fileWrapper);
      content.appendChild(this.contentContainer);

      this.viewer = document.createElement('div');
      this.viewer.classList.add('viewer');
      this.viewer.addEventListener('mouseenter', () => this.contentContainer.focus());
      this.viewer.addEventListener('mouseleave', () => this.contentContainer.blur());

      this.viewer.appendChild(toolbar);
      this.viewer.appendChild(content);
    }
  },
};
