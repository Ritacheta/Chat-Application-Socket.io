import React, { Component } from "react";

export default class MessageInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      isTyping: false,
      isImage: false,
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.message !== "") {
      this.sendMessage(this.state.message, this.state.isImage);
      this.setState({ message: "", isImage: false });
    }
  };

  sendMessage = (message, isImage) => {
    this.props.sendMessage(message, isImage);
  };

  componentWillUnmount() {
    this.stopCheckingTyping();
  }

  sendTyping = () => {
    this.lastUpdateTime = Date.now();
    if (!this.state.isTyping) {
      this.setState({ isTyping: true });
      this.props.sendTyping(true);
      this.startCheckingTyping();
    }
  };

  startCheckingTyping = () => {
    console.log("Typing");
    this.typingInterval = setInterval(() => {
      if (Date.now() - this.lastUpdateTime > 300) {
        this.setState({ isTyping: false });
        this.stopCheckingTyping();
      }
    }, 300);
  };

  stopCheckingTyping = () => {
    console.log("Stop Typing");
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.props.sendTyping(false);
    }
  };

  handleImage = (e) => {
    e.preventDefault();
    const blobURL = URL.createObjectURL(e.target.files[0]);
    const img = new Image();
    img.src = blobURL;
    img.onerror = () => {
      // Handle the failure properly
      URL.revokeObjectURL(this.src);
      console.log("Cannot load image");
    };
    img.onload = () => {
      URL.revokeObjectURL(this.src);
      let newWidth = 400;
      let newHeight = (newWidth * img.height) / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      let url = canvas.toDataURL();
      canvas.remove();
      console.log(url);
      this.sendMessage(url, true);
    };
  };

  render() {
    const { message } = this.state;
    return (
      <div className="message-input">
        <form onSubmit={this.handleSubmit} className="message-form">
          <input
            id="message"
            ref={"messageinput"}
            type="text"
            className="form-control"
            value={message}
            autoComplete={"off"}
            placeholder="Type something interesting"
            onKeyUp={(e) => {
              e.keyCode !== 13 && this.sendTyping();
            }}
            onChange={({ target }) => {
              this.setState({ message: target.value });
            }}
          />
          <button disabled={message.length < 1} type="submit" className="send">
            <img src="https://img.icons8.com/external-prettycons-lineal-prettycons/49/000000/external-send-social-media-prettycons-lineal-prettycons.png" />
          </button>
        </form>
        <div className="upload-btn-wrapper">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              onChange={this.handleImage}
              style={{ display: "none" }}
            />
            <button className="btn" onClick={() => this.refs.fileInput.click()} >
              <img src="https://img.icons8.com/ios/50/000000/image.png" />
            </button>
          </div>
      </div>
    );
  }
}
