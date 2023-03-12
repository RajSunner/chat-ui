import { ChatCompletionRequestMessage } from "openai";
import { v4 as uuidv4 } from "uuid";

export enum ChatActionKind {
	addNewQuestion = "ADD_NEW_QUESTION",
	setEmptyPending = "SET_EMPTY_PENDING",
	streamingText = "STREAMING_TEXT",
	setStreamedText = "SET_STREAMED_TEXT",
	addMessage = "ADD_MESSAGE",
  }
  
  // An interface for our actions
  interface ChatAction {
	type: ChatActionKind;
	payload: any;
  }
  
  // An interface for our state
  interface chatState {
	id: any,
	messages: ChatCompletionRequestMessage[] | any;
	pending?: string;
  }
  
  export default function messageReducer(state: chatState, action: ChatAction) {
	const { type, payload } = action;
	switch (type) {
	  case ChatActionKind.addMessage:
		// const parentIndex = state.messages.findIndex(message => message.id === payload.parentItemId);
		// if (parentIndex === -1) {
		// 	console.error(`Parent item with ID ${payload.parentItemId} not found`);
		// 	return;
		//   }
		return {
		  ...state,
		  messages: [
			...state.messages,
			payload,
		  ]
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