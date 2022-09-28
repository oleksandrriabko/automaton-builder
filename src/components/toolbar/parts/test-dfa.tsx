import React, { FC } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

interface ITestDfa {
  testString: string;
  setTestString: Function;
  runTesting: Function;
}

const TestDfa: FC<ITestDfa> = (props) => {
  const { testString, setTestString, runTesting } = props;

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setTestString(value);
  };

  const handleKeyDownOnInput = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      runTesting();
    }
  };

  return (
    <div className="toolbar-part">
      <TextField
        margin="dense"
        variant="outlined"
        label="Testing"
        value={testString}
        onChange={handleInputChange}
        placeholder="Enter string to test your DFA"
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          onKeyDown: handleKeyDownOnInput,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        style={{ marginLeft: '0.8rem' }}
        onClick={() => {
          runTesting();
        }}
      >
        Test
      </Button>

    </div>
  );
};

export default TestDfa;
