import React, { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { ChatActionKind } from "@/lib/reducer";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const Form = ({ dispatch, id, show, variant }) => {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();

    variant == "normal"
      ? dispatch({
          type: ChatActionKind.addMessage,
          payload: { role: role, content: message, parentItemId: id },
        })
      : dispatch({
          type: ChatActionKind.addFirstMessage,
          payload: { role: role, content: message },
        });
    variant === "normal" ? show(-1) : show(false);
    setMessage("");
    setRole("user");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="role">Role:</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="assistant">Assistant</option>
          <option value="system">System</option>
        </select>
      </div>
      <MDEditor value={message} onChange={setMessage} />
      <button type="submit">Add</button>
    </form>
  );
};

export default Form;
