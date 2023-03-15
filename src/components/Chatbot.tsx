import { useState, useMemo, useEffect, useRef, useReducer } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import messageReducer, { ChatActionKind } from "@/lib/reducer";
import { v4 as uuidv4 } from "uuid";
import Message from "./Message";
import Form from "./Form";

export default function ChatGPT() {
  const [messageState, dispatch] = useReducer(messageReducer, {
    messages: [
      { id: uuidv4(), role: "system", content: "You are a helpful assistant." },
    ],
  });

  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { messages, pending } = messageState;

  const [showFormAtIndex, setShowFormAtIndex] = useState(-1);
  const [showForm, setShowForm] = useState(false);

  const messageListRef = useRef<HTMLLIElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      const lastMessage = messageList.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView();
      }
    }
  }, [messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current?.focus();
  }, [loading]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const question = userInput.trim();
    if (question === "") {
      return;
    }
    if (loading) {
      return;
    }

    dispatch({ type: ChatActionKind.addNewQuestion, payload: question });
    setLoading(true);
    setUserInput("");
    dispatch({ type: ChatActionKind.setEmptyPending });

    const response = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: question }],
      }),
    });

    const data = response.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();

    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      dispatch({ type: ChatActionKind.streamingText, payload: value });
    }
    dispatch({ type: ChatActionKind.setStreamedText });
    setLoading(false);
  };

  const handleEnter = (e: any) => {
    if (e.key === "Enter" && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleAddButtonClick = (index) => {
    setShowFormAtIndex(index);
  };

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [{ id: uuidv4(), role: "assistant", content: pending }]
        : []),
    ];
  }, [messages, pending]);

  return (
    <>
      <div className="flex flex-col items-center p-8 h-screen ">
        <ul className="overflow-y-auto rounded-t-lg h-3/4 w-full divide-y divide-slate-200">
          {chatMessages.map((message, index) => (
            <div key={message.id}>
              <Message
                message={message}
                dispatch={dispatch}
                add={handleAddButtonClick}
                index={index}
              />
              {showFormAtIndex === index && (
                <Form
                  variant="normal"
                  dispatch={dispatch}
                  id={message.id}
                  show={setShowFormAtIndex}
                />
              )}
            </div>
          ))}
          {chatMessages.length < 1 && (
            <div className="flex justify-evenly">
              <button onClick={() => setShowForm(true)}>
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          {showForm && (
            <Form
              variant="first"
              dispatch={dispatch}
              id={""}
              show={setShowForm}
            />
          )}
        </ul>
        <div className="w-full bg-slate-100 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex w-full">
            <textarea
              className="ml-2 flex-8 w-full bg-slate-100 rounded-bl-lg p-2 resize-none outline-none"
              disabled={loading}
              ref={textAreaRef}
              autoFocus={false}
              value={userInput}
              rows={1}
              placeholder={
                loading ? "Waiting for response..." : "Type your question..."
              }
              maxLength={512}
              onKeyDown={handleEnter}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button className="flex-2 p-1" type="submit" disabled={loading}>
              {loading ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-cyan-300"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5 fill-slate-300 hover:fill-cyan-300" />
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
