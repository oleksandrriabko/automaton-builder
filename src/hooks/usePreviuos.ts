import { useRef, useEffect } from "react";

export function usePrevious(value: any): any {
  const ref = useRef<any>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
