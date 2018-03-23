import React from 'react';
import DatePicker from 'react-datepicker';

import {
  Form,
  FormFeedback,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert
} from 'reactstrap';

import EmailAddress from './EmailAddress';
import FileUpload from './FileUpload';

const ClientForm = ({
  client,
  action,
  onModalClose,
  onChange,
  onChangeDate,
  addEmailAddress,
  emailAddressChange,
  removeEmailAddress,
  toggleFilesModal,
  clearFilesModal,
  droppedFiles,
  onSubmit
}) => {

  const onFieldChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  }

  return (
    <Modal
      size="lg"
      isOpen={true}
      backdrop={'static'}
      toggle={onModalClose}>
      <ModalHeader
        toggle={onModalClose}>
        {action === 'edit' ? client.socialName : 'Create a new client'}
      </ModalHeader>
      <Form onSubmit={onSubmit}>
        <ModalBody>
          {client.errors.error &&
            <Alert color="danger">
              {client.errors.error[0]}
            </Alert>
          }
          <h4>General information</h4>
          <div className="form-row">
            <div className="form-group col-md-4">
              <Label for="rfc">RFC</Label>
              <Input
                onChange={onFieldChange}
                name="rfc"
                value={client.rfc}
                id="rfc"
                placeholder="RFC"
              />
            </div>
            <div className="form-group col-md-4">
              <Label for="socialName">Social Name</Label>
              <Input
                valid={!client.errors.socialName && null}
                onChange={onFieldChange}
                name="socialName"
                value={client.socialName}
                id="socialName"
                placeholder="Social Name"
              />
              {client.errors.socialName &&
                <FormFeedback>{client.errors.socialName[0]}</FormFeedback>
              }
            </div>
            <div className="form-group col-md-4">
              <Label for="legalRepresentative">Representative</Label>
              <Input
                onChange={onFieldChange}
                name="legalRepresentative"
                value={client.legalRepresentative}
                id="legalRepresentative"
                placeholder="Legal Representative"
              />
            </div>
          </div>
          <h4>Additional information</h4>
          <div className="form-row">
            <div className="form-group col-md-4">
              <Label for="comercialName">Comercial Name</Label>
              <Input
                valid={!client.errors.comercialName && null}
                onChange={onFieldChange}
                name="comercialName"
                value={client.comercialName}
                id="comercialName"
                placeholder="Comercial Name"
              />
              {client.errors.comercialName &&
                <FormFeedback>{client.errors.comercialName[0]}</FormFeedback>
              }
            </div>
            <div className="form-group col-md-4">
              <Label for="responsible">Responsible</Label>
              <Input
                onChange={onFieldChange}
                name="responsible"
                value={client.responsible}
                id="responsible"
                placeholder="Responsible"
              />
            </div>
            <div className="form-group col-md-4">
              <Label for="phone">Phone</Label>
              <Input
                onChange={onFieldChange}
                name="phone"
                value={client.phone}
                id="phone"
                placeholder="Phone"
              />
            </div>
          </div>
          <h4>Contract information</h4>
          <div className="form-row">
            <div className="form-group col-md-4">
              <Label for="oilPayment">Oil Payment</Label>
              <Input
                valid={!client.errors.oilPayment && null}
                onChange={onFieldChange}
                name="oilPayment"
                value={client.oilPayment}
                id="oilPayment"
                placeholder="Oil Payment"
              />
              {client.errors.oilPayment &&
                <FormFeedback>{client.errors.oilPayment[0]}</FormFeedback>
              }
            </div>
            <div className="form-group col-md-4">
              <Label for="contractDate">Contract Date</Label>
              <DatePicker
                className="form-control"
                name="contractDate"
                id="contractDate"
                onChange={date => onChange('contractDate', date)}
                selected={client.contractDate}
              />
            </div>
            <div className="form-group col-md-4">
              <Label for="contractEnd">Contract End</Label>
              <DatePicker
                className="form-control"
                name="contractEnd"
                id="contractEnd"
                onChange={date => onChange('contractEnd', date)}
                selected={client.contractEnd}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">
              <Label for="contact">Contact</Label>
              <Input
                onChange={onFieldChange}
                name="contact"
                value={client.contact}
                id="contact"
                placeholder="Contact"
              />
            </div>
            <div className="form-group col-md-6">
              <Label for="address">Address</Label>
              <Input
                onChange={onFieldChange}
                name="address"
                value={client.address}
                id="address"
                placeholder="Address"
              />
            </div>
          </div>
          <h4>Email addresses</h4>
          {client.emails.map((email, i) => (
            <EmailAddress
              key={i}
              index={i}
              emails={client.emails}
              email={email}
              errors={client.errors}
              emailAddressChange={emailAddressChange}
              removeEmailAddress={removeEmailAddress}
            />
          ))}
          <FileUpload
            filesModal={client.filesModal}
            toggleFilesModal={toggleFilesModal}
            clearFilesModal={clearFilesModal}
            droppedFiles={droppedFiles}
            files={client.files}
            errors={client.errors.files}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            outline
            color="success"
            type="submit"
            disabled={client.loading}>
            {action === 'edit'
              ? <span>Update client {client.loading && <i className="fa fa-circle-o-notch fa-spin"></i>}</span>
              : <span>Create client {client.loading && <i className="fa fa-circle-o-notch fa-spin"></i>}</span>
            }
          </Button>
          <Button
            outline
            type="button"
            onClick={addEmailAddress}>
            Add email address
          </Button>
          <Button
            outline
            onClick={toggleFilesModal}>
            Upload Files
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default ClientForm;
