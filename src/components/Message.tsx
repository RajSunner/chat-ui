import React, { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import {
  PlusIcon,
  PencilSquareIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  CpuChipIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { ChatActionKind } from "@/lib/reducer";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const Message = ({ message, dispatch, add, index }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentValue, setCurrentValue] = useState(message.content);

  const handleUpdate = () => {
    setIsEditMode(false);
    dispatch({
      type: ChatActionKind.editMessage,
      payload: {
        role: message.role,
        content: currentValue,
        parentItemId: message.id,
      },
    });
  };

  let icon;

  if (message.role === "user") {
    icon = <QuestionMarkCircleIcon className="h-6 w-6 stroke-cyan-500" />;
  }
  if (message.role === "system") {
    icon = <CpuChipIcon className="h-6 w-6 stroke-slate-500" />;
  }

  if (message.role === "assistant") {
    icon = (
      <ChatBubbleBottomCenterTextIcon className="h-6 w-6 stroke-indigo-500" />
    );
  }

  return (
    <>
      {isEditMode ? (
        <li>
          <MDEditor value={currentValue} onChange={setCurrentValue} />
          <button onClick={handleUpdate}>Update</button>
        </li>
      ) : (
        <li className="group/item p-4 odd:bg-white even:bg-slate-50">
          <div className="flex">
            <div className="p-1">{icon}</div>
            <div className="p-1 w-full">
              <ReactMarkdown
                children={currentValue}
                className="prose"
                linkTarget="_blank"
              />
            </div>

            <div className="group/edit invisible group-hover/item:visible space-x-2 h-7 w-24 justify-content flex font-bold rounded">
              <button
                onClick={() =>
                  dispatch({
                    type: ChatActionKind.delMessage,
                    payload: message.id,
                  })
                }
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
              <button onClick={() => setIsEditMode(true)}>
                <PencilSquareIcon className="h-5 w-5 " />
              </button>
              <button onClick={() => add(index)}>
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </li>
      )}
    </>
  );
};

export default Message;
