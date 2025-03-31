import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Flex,
  Card,
  ScrollView,
  TextAreaField,
  View,
  useTheme,
  Text,
} from "@aws-amplify/ui-react";
import { Send } from "lucide-react";
import { AIConversation, ConversationMessage, ConversationMessageContent, SendMesageParameters } from '@aws-amplify/ui-react-ai';
import ReactMarkdown from 'react-markdown';

type Message = ConversationMessage;

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tokens } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the input field when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (input: SendMesageParameters) => {
    if (!input.content?.[0]?.text?.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.content,
      role: 'user',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: Implement AWS Amplify chat API call here
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: [{ text: "Thanks for your message! This is a placeholder response." }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (

      <View padding={tokens.space.large}>


      <AIConversation
        welcomeMessage={
          <Card>
            <Text>I am your virtual assistant, ask me any questions you like!</Text>
          </Card>
        }
        messageRenderer={{
          text: ({ text }) => <ReactMarkdown>{text}</ReactMarkdown>
        }}
        messages={messages}
        handleSendMessage={handleSendMessage}
        FallbackResponseComponent={(props) => (
          <Card variation="outlined">{JSON.stringify(props, null, 2)}</Card>
        )}
      />


        
      </View>
   
  );
} 