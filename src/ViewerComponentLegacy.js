import React, { Component } from 'react';

import Viewer from './Viewer.js';

/** @import { ViewerProps } from './ViewerComponent.js'; */

/**
 * React обертка для new Viewer() (до React v16.8)
 * @param {ViewerProps & import('react').HTMLAttributes<HTMLDivElement>} props - props
 * @returns {import('react').JSX.Element}
 */
class ViewerComponentLegacy extends Component {
  /**
   * @param {ViewerProps} props - props
   */
  constructor(props) {
    super(props);

    this.container = null;
    this.viewer = null;

    this.setContainer = (element) => {
      this.container = element;
    };
  }

  /**
   * @returns {void}
   */
  componentDidMount() {
    const { files, closable = true, onChangeFile, onRotate, onRollback, onClose } = this.props;
    this.viewer = new Viewer({
      container: this.container,
      files,
      closable,
      onChangeFile,
      onRotate,
      onRollback,
      onClose,
    });

    if (this.props.open) {
      this.viewer.show(this.props.fileIndex);
    }
  }

  /**
   * @param {ViewerProps} prevProps - prevProps
   * @returns {void}
   */
  componentDidUpdate(prevProps) {
    const { open, fileIndex, files, closable, onChangeFile, onRotate, onRollback, onClose } = this.props;

    if (prevProps.open !== open) {
      if (open) {
        this.viewer.show(fileIndex);
      } else {
        this.viewer.hide();
      }
    }

    if (prevProps.fileIndex !== fileIndex) {
      this.viewer.renderFile(fileIndex);
    }

    if (prevProps.files !== files) {
      this.viewer.setFiles(files);
      if (open) {
        this.viewer.renderFile(fileIndex);
      }
    }

    if (prevProps.closable !== closable) {
      this.viewer.setClosable(closable);
    }

    if (
      prevProps.onChangeFile !== onChangeFile ||
      prevProps.onRotate !== onRotate ||
      prevProps.onRollback !== onRollback ||
      prevProps.onClose !== onClose
    ) {
      this.viewer.onChangeFile = onChangeFile;
      this.viewer.onRotate = onRotate;
      this.viewer.onRollback = onRollback;
      this.viewer.onClose = onClose;
    }
  }

  /**
   * @returns {import('react').JSX.Element}
   */
  render() {
    const {
      files,
      fileIndex,
      open,
      closable,
      onChangeFile,
      onRotate,
      onRollback,
      onClose,
      ...containerProps
    } = this.props;

    return <div {...containerProps} ref={this.setContainer} />;
  }
}

export default ViewerComponentLegacy;
