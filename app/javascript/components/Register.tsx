import React from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback, CustomInput } from "reactstrap";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Link, Redirect } from "react-router-dom";
import { AdnatState } from "../types";
import { connect } from "react-redux";


interface IRegisterProps {
}

interface IRegisterState {
  name: string;
  email: string;
  password1: string;
  password2: string;
  message: string;
  errors: Array<string>;
  success: boolean;
}

class Register extends React.Component <IRegisterProps, IRegisterState> {

  constructor(props) {
    super(props);
    this.state = { 
      name: '',
      email: '',
      password1: '',
      password2: '',
      message: '',
      errors: [],
      success: false
    }
  }

  componentDidMount = () => {
    this.setState({
      name: '', 
      email: '',
      password1: '',
      password2: '',
      message: '',
      errors: [],
      success: false
    });
  }

  preventSubmit = (e:React.FormEvent) => {
    e.preventDefault();
  }

  signUp = async () => {
    this.setState({...this.state, message: '', errors: []  });

    try {
      return await axios.post("/api/users",
      {
        name: this.state.name,
        email: this.state.email,
        password: this.state.password1,
        password_confirmation: this.state.password2
      }, {
        headers: { 
          'Content-Type':     'application/json'
        }
      }).then( (resp: AxiosResponse) => {
        this.setState({ ...this.state, success: true });  

      }).catch( (error:AxiosError) => {
        if(error.response.data){
          this.setState({ ...this.state, message: error.response.data.message, errors: error.response.data.errors });
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

  renderErrors = () => {
    if(this.state.errors.length > 0){
      return (
        <ul style={{
          color: '#ff0000'
        }}>
          {this.state.errors.map((error) => {
            return <li>{error}</li>
          })} 
        </ul>
      );
    } else {
      return <div></div>
    }
  }

  renderRedirect = () => {
    return <Redirect to='/' />
  }

  renderSignUp = () => {
    return (
      <Container>
        <Row>
        <Col>&nbsp;</Col>
          <Col>
            <h1>Adnat System: Sign Up</h1>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
          <Col>
            {this.renderMessage()}
            {this.renderErrors()}
          </Col>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
          <Col>
            <Form onSubmit={this.preventSubmit}>
            <FormGroup>
                <Label for="loginEmail">Name</Label>
                <Input type="text" name="loginName" id="loginName" value={this.state.name} placeholder="Name" onChange={(e) => {
                  this.setState({ ...this.state, name: e.target.value });
                }} />
              </FormGroup>
              <FormGroup>
                <Label for="loginEmail">Email</Label>
                <Input type="email" name="email" id="loginEmail" value={this.state.email} placeholder="user@domain.com" onChange={(e) => {
                  this.setState({ ...this.state, email: e.target.value });
                }} />
              </FormGroup>
              <FormGroup>
                <Label for="loginPassword1">Password</Label>
                <Input type="password" name="password1" id="loginPassword1" value={this.state.password1} onChange={(e) => {
                  this.setState({ ...this.state, password1: e.target.value });
                }} />
              </FormGroup>
              <FormGroup>
                <Label for="loginPassword2">Confirm Password</Label>
                <Input type="password" name="password2" id="loginPassword2" value={this.state.password2} onChange={(e) => {
                  this.setState({ ...this.state, password2: e.target.value });
                }} invalid={this.state.password1 !== "" && this.state.password1 !== this.state.password2} />
                <FormFeedback>Confirmation password doesn't match</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Button onClick={this.signUp} 
                  disabled={this.state.email.trim() === '' || 
                    this.state.password1.trim() === '' ||
                    this.state.password2.trim() === '' ||
                    (this.state.password1 !== this.state.password2)}>Register</Button>{' '}
              </FormGroup>
              <FormGroup>
                <Link to="/" className="btn btn-primary">Login</Link>{' '}
                <Link to="/forgot-password" className="btn btn-secondary">Forgot Password</Link>  
              </FormGroup>
            </Form>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
      </Container>
    );
  }

  render(){
    if(this.state.success){
      return this.renderRedirect();
    } else {
      return this.renderSignUp();
    }
  }
}

export default connect(null, null)(Register);