import React, { useState } from "react";
import { ChatActionKind } from "@/lib/reducer";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const EditerMarkdown = dynamic(
  () =>
    import("@uiw/react-md-editor").then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

function Modal({ type, parentItemId, dispatch, contentPackage }) {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(contentPackage.user);
  const [content, setContent] = useState(contentPackage.content);

  const options = ["user", "assistant", "system"];
  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Dispatch action to add new item
    
    if (type === "add") {
      dispatch({
        type: ChatActionKind.addMessage,
        payload: { role: role, content: content, parentItemId },
      });
      setRole("");
      setContent("");
    }

    if (type === "edit") {
      dispatch({
        type: ChatActionKind.editMessage,
        payload: { role: role, content: content, parentItemId },
      });
    }

    // Reset form values

    // Close the modal
    setShowModal(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {type}
      </button>
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            &#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="role"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={handleRoleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option>Select</option>
                      {options.map((option, index) => {
                        return <option value={option} key={index}>{option}</option>;
                      })}
                    </select>
                  </div>
                  <div className="mb-4">
                    {type === "add" ? (
                      <>
                        <label
                          className="block text-gray-700 font-bold mb-2"
                          htmlFor="content"
                        >
                          Content
                        </label>
                        <input
                          type="text"
                          id="content"
                          value={content}
                          onChange={handleContentChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></input>
                      </>
                    ) : (
                      <>
                        <MDEditor value={content} onChange={setContent} />
                        <EditerMarkdown
                          source={content}
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {type}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Modal;
