import { RandomUUIDOptions } from "crypto";
import { ChatCompletionRequestMessage } from "openai";
import { v4 as uuidv4 } from "uuid";


interface Payload {
  parentItemId: string,
  role: string,
  content: string,
}

interface minPayload {
  role: string,
  content: string,
}

export enum ChatActionKind {
  addNewQuestion = "ADD_NEW_QUESTION",
  setEmptyPending = "SET_EMPTY_PENDING",
  streamingText = "STREAMING_TEXT",
  setStreamedText = "SET_STREAMED_TEXT",
  addMessage = "ADD_MESSAGE",
  editMessage = "EDIT_MESSAGE",
  delMessage = "DELETE_MESSAGE",
  addFirstMessage = "ADD_FIRST_MESSAGE",
}

// An interface for our actions
type ChatAction =
  | { type: ChatActionKind.addNewQuestion; payload: string }
  | { type: ChatActionKind.setEmptyPending; }
  | { type: ChatActionKind.streamingText; payload: Uint8Array | undefined }
  | { type: ChatActionKind.setStreamedText; }
  | { type: ChatActionKind.addMessage; payload: Payload }
  | { type: ChatActionKind.editMessage; payload: Payload }
  | { type: ChatActionKind.delMessage; payload: string }
  | { type: ChatActionKind.addFirstMessage; payload: minPayload };

interface Messages extends ChatCompletionRequestMessage {
  id: string;
}

// An interface for our state
interface chatState {
  id: string;
  messages: Messages[];
  pending?: string;
}

export default function messageReducer(state: chatState, action: ChatAction) {
  const { type, payload } = action;
  switch (type) {
    case ChatActionKind.addMessage:
      const arrayOfIndexes = [...state.messages];

      const ind = arrayOfIndexes.findIndex(
        (item) => item.id === payload.parentItemId
      );

      if (ind === -1) {
        console.error(`Parent item with ID ${payload.parentItemId} not found`);
        return;
      }
      // // Insert new item below parent item
      const newItem = {
        id: uuidv4(),
        role: payload.role,
        content: payload.content,
      };

      const arr = [
        ...state.messages.slice(0, ind + 1),
        newItem,
        ...state.messages.slice(ind + 1),
      ];
      return {
        ...state,
        messages: arr,
      };
    case ChatActionKind.editMessage:
      const arrayOfIndexesEd = [...state.messages];

      const indEd = arrayOfIndexesEd.findIndex(
        (item) => item.id === payload.parentItemId
      );

      if (indEd === -1) {
        console.error(`Parent item with ID ${payload.parentItemId} not found`);
        return;
      }
      // // Insert new item below parent item
      const Item = {
        id: payload.parentItemId,
        role: payload.role,
        content: payload.content,
      };

      const arrEd = [
        ...state.messages.slice(0, indEd),
        Item,
        ...state.messages.slice(indEd + 1),
      ];
      return {
        ...state,
        messages: arrEd,
      };
    case ChatActionKind.delMessage:
      return {
        ...state,
        messages: [...state.messages.filter((item) => item.id !== payload)],
      };
    case ChatActionKind.addNewQuestion:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            role: "user",
            content: payload,
          },
        ],
        pending: undefined,
      };
    case ChatActionKind.addFirstMessage:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            role: payload.role,
            content: payload.content,
          },
        ],
      };
    case ChatActionKind.setEmptyPending:
      return {
        ...state,
        pending: "",
      };
    case ChatActionKind.streamingText:
      return {
        ...state,
        pending: (state.pending ?? "") + new TextDecoder().decode(payload),
      };
    case ChatActionKind.setStreamedText:
      return {
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            role: "assistant",
            content: state.pending ?? "",
          },
        ],
        pending: undefined,
      };
    default:
      return state;
  }
}
