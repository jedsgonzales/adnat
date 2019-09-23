import React from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback, CustomInput } from "reactstrap";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Link } from "react-router-dom";
import { AdnatState } from "../types";
import { connect } from "react-redux";


interface IForgotPasswordProps {
}

interface IForgotPasswordState {
  email: string;
  message: string;
}

class ForgotPassword extends React.Component <IForgotPasswordProps, IForgotPasswordState> {

  constructor(props) {
    super(props);
    this.state = { 
      email: '',
      message: '',
    }
  }

  preventSubmit = (e:React.FormEvent) => {
    e.preventDefault();
  }

  retrievePassword = async () => {
    try {
      return await axios.post("/api/users/password-reset",
      {
        email: this.state.email
      }, {
        headers: { 
          'Content-Type':     'application/json'
        }
      }).then( (resp: AxiosResponse) => {
        this.setState({ ...this.state, message: resp.data.message });
      }).catch( (error:AxiosError) => {
        if(error.response.data.message){
          this.setState({ ...this.state, message: error.response.data.message });
        } else {
          this.setState({ ...this.state, message: 'Try again later.' });
        }
      });

    } catch(error) {
      this.setState({ ...this.state, message: 'Handling error.' });
    }
  }

  renderMessage = () => {
    if(this.state.message.trim() !== ''){
      return <h3>{this.state.message}</h3>;
    } else {
      return <div></div>
    }
  }

  render() {
    return (
      <Container>
        <Row>
        <Col>&nbsp;</Col>
          <Col>
            <h1>Adnat System: Forgot Password</h1>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
        <Col>&nbsp;</Col>
          <Col>
            {this.renderMessage()}
          </Col>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
          <Col>
            <Form onSubmit={this.preventSubmit}>
              <FormGroup>
                <Label for="loginEmail">Email</Label>
                <Input type="email" name="email" id="loginEmail" value={this.state.email} placeholder="user@domain.com" onChange={(e) => {
                  this.setState({ ...this.state, email: e.target.value });
                }} />
              </FormGroup>
              <FormGroup>
                <Button onClick={this.retrievePassword} disabled={this.state.email.trim() === ''}>Retrieve Password</Button>{' '}
              </FormGroup>
              <FormGroup>
                <Link to="/" className="btn btn-primary">Login</Link>{' '}
                <Link to="/register" className="btn btn-secondary">Sign Up</Link>  
              </FormGroup>
            </Form>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
      </Container>
    );
  }
}

export default connect(null, {  })(ForgotPassword);