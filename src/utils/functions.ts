import Typography from "@material-ui/core/Typography";
import { ParsedClassValidatorError } from "../types/errors";

export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const parseClassValidatorError = (
  errors: Array<{ constraints: { key: string }; children: Array<any>; property: string }>
): ParsedClassValidatorError => {
  if (!errors.length) {
    return {};
  }

  return errors.reduce((errAcc, err) => {
    return (errAcc = { ...errAcc, [err.property]: Object.values(err.constraints) });
  }, {});
};
