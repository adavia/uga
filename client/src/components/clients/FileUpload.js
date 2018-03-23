import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';
import Dropzone from 'react-dropzone';

const FileUpload = ({
  filesModal,
  toggleFilesModal,
  droppedFiles,
  clearFilesModal,
  files,
  errors
}) => {
  const filePath = (path) => {
    if (path) {
      return `${process.env.REACT_APP_SERVER_URL}/${path}`;
    }
  }

  return (
    <Modal
      isOpen={filesModal}
      toggle={toggleFilesModal}>
      <ModalHeader>Upload files</ModalHeader>
      <ModalBody>
        <Dropzone
          accept="
          application/pdf,
          application/msword,
          application/vnd.openxmlformats-officedocument.wordprocessingml.document,
          application/vnd.ms-excel,
          application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="files-drop"
          onDrop={droppedFiles}>
          {files.length > 0 ?
            files.map((file, key) =>
              <div key={key}>
                <a href={file.preview || filePath(file.path)} target="_blank">
                  <i className="fa fa-paperclip"></i> {file.name}
                </a>
              </div>
            )
            : <p>Click or drop some files to upload!</p>
          }
        </Dropzone>
        {errors &&
          <p className="text-danger text-center mt-1">{errors[0]}</p>
        }
      </ModalBody>
      <ModalFooter>
        <Button
          outline
          color="success"
          onClick={clearFilesModal}>
          Clear
        </Button>
        <Button
          outline
          onClick={toggleFilesModal}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default FileUpload;
