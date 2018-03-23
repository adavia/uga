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

const InvoiceForm = ({
  invoice,
  action,
  onModalClose,
  onChange,
  onChangeDate,
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
        {action === 'edit' ? invoice.code : 'Create a new invoice'}
      </ModalHeader>
      <Form onSubmit={onSubmit}>
        <ModalBody>
          {invoice.errors.error &&
            <Alert color="danger">
              {invoice.errors.error[0]}
            </Alert>
          }
          <div className="form-row">
            <div className="form-group col-md-6">
              <Label for="code">Code</Label>
              <Input
                valid={!invoice.errors.code && null}
                onChange={onFieldChange}
                disabled={action === 'edit'}
                name="code"
                value={invoice.code}
                id="code"
                placeholder="Code"
              />
              {invoice.errors.code &&
                <FormFeedback>{invoice.errors.code[0]}</FormFeedback>
              }
            </div>
            <div className="form-group col-md-6">
              <Label for="receiver">Receiver</Label>
              <Input
                onChange={onFieldChange}
                name="receiver"
                value={invoice.receiver}
                id="receiver"
                placeholder="Receiver"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">
              <Label for="total">Total</Label>
              <Input
                valid={!invoice.errors.total && null}
                onChange={onFieldChange}
                name="total"
                value={invoice.total}
                id="total"
                placeholder="Total"
              />
              {invoice.errors.total &&
                <FormFeedback>{invoice.errors.total[0]}</FormFeedback>
              }
            </div>
            <div className="form-group col-md-6">
              <Label for="invoiceDate">Date</Label>
              <DatePicker
                className="form-control"
                name="invoiceDate"
                id="invoiceDate"
                onChange={date => onChange('invoiceDate', date)}
                selected={invoice.invoiceDate}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-12">
              <Label for="notes">Notes</Label>
              <Input
                rows="4"
                type="textarea"
                onChange={onFieldChange}
                name="notes"
                value={invoice.notes}
                id="notes"
                placeholder="Notes"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            outline
            color="success"
            type="submit"
            disabled={invoice.loading}>
            {action === 'edit'
              ? <span>Update invoice {invoice.loading && <i className="fa fa-circle-o-notch fa-spin"></i>}</span>
              : <span>Create invoice {invoice.loading && <i className="fa fa-circle-o-notch fa-spin"></i>}</span>
            }
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default InvoiceForm;
