import React from "react";

const Result = props => {

  const {result, previousProblem} = props;

  let inputs, expectedOutputs, userOutputs;

  if (result.userOutputs) {
    inputs = JSON.parse(previousProblem.inputs);
    expectedOutputs = JSON.parse(previousProblem.outputs);
    userOutputs = result.userOutputs;
  }

  return (
    <div className={result.userOutputs ? 'result' : 'result-hidden'}>
        <div className="title-result">{result.correct ? "CORRECT!" : "TRY AGAIN :("}</div>
        <div className='result-box'>
          {result.userOutputs ? (
            <div>
            <table id='result-table'>
              <tr>
                <th>Input</th>
                <th>Your Output</th>
                <th>Expected Output</th>
              </tr>
              {inputs.map((input, index) => {
                const inputString = JSON.stringify(input)
                const formattedInput = inputString.slice(1, inputString.length - 1)
                return (
                <tr key={index}>
                  <td>{formattedInput}</td>
                  <td>{JSON.stringify(userOutputs[index])}</td>
                  <td>{JSON.stringify(expectedOutputs[index])}</td>
                </tr>
              )})}
            </table>
          </div>
      ) : ''}
        </div>
        <small>(click in code area to close)</small>
    </div>
  );
};

export default Result;
