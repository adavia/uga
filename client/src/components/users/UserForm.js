import React from 'react';
import {
  Form,
  Label,
  Input,
  Button,
  FormFeedback
} from 'reactstrap';

const UserForm = ({onSubmit, onChange, user}) => {
  return (
    <Form onSubmit={onSubmit}>
      <div className="form-group">
        <Label for="username">Username</Label>
        <Input
          valid={!user.errors.username && null}
          type="username"
          onChange={onChange}
          name="username"
          value={user.username}
          id="username"
          placeholder="Username"
        />
        {user.errors.username &&
          <FormFeedback>{user.errors.username[0]}</FormFeedback>
        }
      </div>
      <div className="form-group">
        <Label for="email">Email</Label>
        <Input
          valid={!user.errors.email && null}
          onChange={onChange}
          name="email"
          value={user.email}
          id="email"
          placeholder="Your email address"
        />
        {user.errors.email &&
          <FormFeedback>{user.errors.email[0]}</FormFeedback>
        }
      </div>
      <div className="form-group">
        <Label for="password">Password</Label>
        <Input
          valid={!user.errors.password && null}
          type="password"
          onChange={onChange}
          name="password"
          value={user.password}
          id="password"
          placeholder="Your password"
        />
        {user.errors.password &&
          <FormFeedback>{user.errors.password[0]}</FormFeedback>
        }
      </div>
      <Button
        outline
        block
        color="success"
        type="submit"
        disabled={user.loading}>
        Submit {user.loading && <i className="fa fa-circle-o-notch fa-spin"></i>}
      </Button>
    </Form>
  );
}

export default UserForm;
