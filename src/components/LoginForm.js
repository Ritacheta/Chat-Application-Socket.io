import React, { Component } from "react";
import { VERIFY_USER } from "../Events";

export default class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nickname: "",
      error: "",
      password: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setUser = ({ user, isUser, error="" }) => {
    if (isUser) {
      if(error!=="")
      {
        this.setError(error);
      }
      else{
        if (user.password === this.state.password) {
          this.props.setUser(user);
        } else {
          this.setError("Incorrect Password");
        }
      }
    } else {
      this.setError("");
      this.props.setUser(user);
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { socket } = this.props;
    const { nickname,password } = this.state;
    console.log(this.state);
    socket.emit(VERIFY_USER, nickname, password, this.setUser);
  };

  handleChange = (e) => {
    const value = e.target.value;
    this.setState({
      ...this.state,
      [e.target.name]: value,
    });
  };

  setError = (error) => {
    this.setState({ error });
  };

  render() {
    const { nickname, error, password } = this.state;
    return (
      <div
        style={{
          backgroundImage: `url(https://cdn.dribbble.com/users/1003944/screenshots/15741863/media/96a2668dbf0b4da82efca00d60011ca8.gif)`,
        }}
        className="login"
      >
        <form onSubmit={this.handleSubmit} className="login-form">
          <label htmlFor="nickname">
            <h2>Enter Your Username </h2>
          </label>
          <input
            name="nickname"
            type="text"
            value={nickname}
            onChange={this.handleChange}
            placeholder="Username"
            required
          />
          <label htmlFor="password">
            <h2>Password </h2>
          </label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={this.handleChange}
            placeholder="Password"
            required
          />
          <div className="auth__form-container_fields-content_button">
            <button>Hop into Goppo</button>
          </div>

          <div className="error">{error ? error : null}</div>
        </form>
      </div>
    );
  }
}
