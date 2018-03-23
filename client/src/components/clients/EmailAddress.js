import React from 'react';
import {
  Input,
  FormFeedback,
  Button
} from 'reactstrap'

const EmailAddress = ({
  index,
  emails,
  email,
  errors,
  removeEmailAddress,
  emailAddressChange,
  onChange
}) => {
  return (
    <div className="form-row">
      <div className="form-group col-md-6">
        <Input
          valid={!errors[`emails[${index}].address`] && null}
          onChange={emailAddressChange(index)}
          value={email.address}
          placeholder={`Email address`}
        />
        {errors[`emails[${index}].address`] &&
          <FormFeedback>{errors[`emails[${index}].address`][0]}</FormFeedback>
        }
      </div>
      <div className="form-group col-md-2">
        <Button
          outline
          color="danger"
          type="button"
          onClick={removeEmailAddress(index)}>
          -
        </Button>
      </div>
    </div>
  );
}

export default EmailAddress;
