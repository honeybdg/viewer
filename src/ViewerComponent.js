import React, { useRef, useEffect } from 'react';

import Viewer from './Viewer';

/** @import { File, OnChangeFile, OnRotate, OnRollback, OnClose } from './Viewer'; */

/**
 * @typedef {object} ViewerProps
 * @property {number=} fileIndex - индекс файла который надо отобразить
 * @property {boolean=} open - показать/скрыть viewer
 * @property {File[]} files - список файлов
 * @property {boolean=} closable - показать/скрыть кнопку закрытия
 * @property {boolean=} nocache - надо ли игнорировать локальный кэш браузера при запросах файлов
 * @property {OnChangeFile=} onChangeFile - callback при смене файла
 * @property {OnRotate=} onRotate - callback при повороте файла
 * @property {OnRollback=} onRollback - callback при сбросе
 * @property {OnClose=} onClose - callback при закрытии
 */

/**
 * React обертка для new Viewer()
 * @param {ViewerProps & import('react').HTMLAttributes<HTMLDivElement>} props - props
 * @returns {import('react').JSX.Element}
 */
function ViewerComponent(props) {
  const { files, fileIndex, open, closable = true, nocache = false, onChangeFile, onRotate, onRollback, onClose, ...containerProps } = props;

  /**
   * @type {{ current: HTMLDivElement }}
   */
  const container = useRef(null);

  /**
   * @type {{ current: Viewer }}
   */
  const viewer = useRef(null);

  useEffect(() => {
    if (!viewer.current) {
      viewer.current = new Viewer({
        container: container.current,
        files,
        closable,
        nocache,
        onChangeFile,
        onRotate,
        onRollback,
        onClose,
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      viewer.current.show(fileIndex);
    } else {
      viewer.current.hide();
    }
  }, [open]);

  useEffect(() => {
    viewer.current.renderFile(fileIndex);
  }, [fileIndex]);

  useEffect(() => {
    viewer.current.setFiles(files);
  }, [files]);

  useEffect(() => {
    viewer.current.nocache = nocache;
  }, [nocache]);

  useEffect(() => {
    viewer.current.setClosable(closable);
  }, [closable]);

  useEffect(() => {
    viewer.current.onChangeFile = onChangeFile;
    viewer.current.onRotate = onRotate;
    viewer.current.onRollback = onRollback;
    viewer.current.onClose = onClose;
  }, [onChangeFile, onRotate, onRollback, onClose]);

  return <div {...containerProps} ref={container} />;
}

export default ViewerComponent;
