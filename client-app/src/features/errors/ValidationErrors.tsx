import React from "react";
import { Message } from "semantic-ui-react";

interface Props {
  errors: any;
}
export default function ValidationErrors({ errors }: Props) {
  return (
    <Message error>
      {errors && (console.log(errors.response.data.errors))}
    </Message>
  );
}

/*<Message.List>
          {errors.map((err: any, i: any) => (
            <Message.Item key={i}>{err}</Message.Item>
          ))}
        </Message.List> */
