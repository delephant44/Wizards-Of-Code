import {Controlled as CodeMirror} from 'react-codemirror2'
import "codemirror/mode/javascript/javascript";
import React, { Component } from "react";

class CodeArea extends Component {

  render() {
    let options = {
      lineNumbers: true,
      mode: "javascript",
      autoFocus: true,
      gutters: ["CodeMirror-linenumbers", 2]
    };

    return (
      <div className='code-area' onClick={this.props.closeResults}>
        <CodeMirror
          value={this.props.value}
          onBeforeChange={(editor, data, value) => {
            this.props.updateCode(value);
          }}
          onChange={(editor, data, value) => {
          }}
          options={options}
          className={`CodeMirror ${this.props.highlightClass}`}
        />
      </div>
    );
  }
}

export default CodeArea;
