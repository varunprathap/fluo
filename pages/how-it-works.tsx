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
  Loader,
} from "@aws-amplify/ui-react";
import { Send, Sparkles } from "lucide-react";
import { AIConversation, ConversationMessage, SendMesageParameters } from '@aws-amplify/ui-react-ai';
import ReactMarkdown from 'react-markdown';

type Message = ConversationMessage;

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessageIds, setLoadingMessageIds] = useState<string[]>([]); // Track loading per AI message

  const { tokens } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Response mappings for AI replies
  const responseMap: { [key: string]: string } = {
    "Yay!": "Imagine a scenario where you can see all your employees working today, their details, and their payment. You can also add new employees and edit their details. You can also see the payment details for each employee.",
    "You have 3 casuals working today. Do you want to know details?": "3 working for the morning shift 09:00am to 02:30pm with a 30mins lunch break in between",
    "Estimate total payment for today": "The total estimated salary for today will be $540 for the 3 casuals",
    "How many casual employees working today?": "You have 3 casuals working today. Do you want to know details?"
  };

  // Follow-up questions triggered by specific user messages
  const followUpMap: { [key: string]: string } = {
    "Yay!": "How many casual employees working today?",
    "Estimate total payment for today": "Would you like a breakdown of the costs?"
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (input: SendMesageParameters) => {
    if (!input.content?.[0]?.text?.trim()) return;

    const userMessageText = input.content[0].text.trim();
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.content,
      role: 'user',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Prepare and add a loading message for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      const loadingMessage: Message = {
        id: aiMessageId,
        content: [{ text: "" }], // Empty text triggers loader
        role: 'assistant',
        createdAt: new Date().toISOString(),
        conversationId: '1'
      };
      setMessages(prev => [...prev, loadingMessage]);
      setLoadingMessageIds(prev => [...prev, aiMessageId]);

      // Simulate AI response after 2 seconds
      setTimeout(() => {
        const aiMessage: Message = {
          id: aiMessageId,
          content: [{ text: responseMap[userMessageText] || "I'm not sure about that. Could you please rephrase?" }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? aiMessage : msg));
        setLoadingMessageIds(prev => prev.filter(id => id !== aiMessageId));

        // Check for a follow-up question
        const followUpText = followUpMap[userMessageText];
        if (followUpText) {
          setTimeout(() => {
            // Add follow-up user message
            const followUpUserMessageId = (Date.now() + 2).toString();
            const followUpUserMessage: Message = {
              id: followUpUserMessageId,
              content: [{ text: followUpText }],
              role: 'user',
              createdAt: new Date().toISOString(),
              conversationId: '1'
            };
            setMessages(prev => [...prev, followUpUserMessage]);

            // Add loading message for follow-up AI response
            const followUpAiMessageId = (Date.now() + 3).toString();
            const followUpLoadingMessage: Message = {
              id: followUpAiMessageId,
              content: [{ text: "" }], // Empty text triggers loader
              role: 'assistant',
              createdAt: new Date().toISOString(),
              conversationId: '1'
            };
            setMessages(prev => [...prev, followUpLoadingMessage]);
            setLoadingMessageIds(prev => [...prev, followUpAiMessageId]);

            // Simulate follow-up AI response after 2 seconds
            setTimeout(() => {
              const followUpAiMessage: Message = {
                id: followUpAiMessageId,
                content: [{ text: responseMap[followUpText] || "I don’t have more info on that." }],
                role: 'assistant',
                createdAt: new Date().toISOString(),
                conversationId: '1'
              };
              setMessages(prev => prev.map(msg => msg.id === followUpAiMessageId ? followUpAiMessage : msg));
              setLoadingMessageIds(prev => prev.filter(id => id !== followUpAiMessageId));
            }, 2000); // 2-second delay for follow-up AI response
          }, 1000); // 1-second delay before follow-up user message
        }
      }, 2000); // 2-second delay for initial AI response
    } catch (error) {
      console.error('Error sending message:', error);
      setLoadingMessageIds(prev => prev.filter(id => id !== (Date.now() + 1).toString()));
    }
  };

  return (
    <View className="chat-container">
      <AIConversation
        messages={messages}
        welcomeMessage={
          <Card
            variation="elevated"
            padding={tokens.space.large}
            backgroundColor="white"
            borderRadius="20px"
            boxShadow="0 4px 10px rgba(0, 0, 0, 0.08)"
          >
            <Flex direction="column" gap={tokens.space.medium}>
              <Text fontSize="24px" fontWeight="bold" color="#6C3BFF">
                Welcome to Fluo.ai
              </Text>
              <Text fontSize="18px" color={tokens.colors.font.secondary}>
                Do you want to see what's exciting?
              </Text>
              <Flex justifyContent="flex-end">
                <Button
                  onClick={() => handleSendMessage({ content: [{ text: "Yay!" }] })}
                  backgroundColor={tokens.colors.background.secondary}
                  color={tokens.colors.font.secondary}
                  borderRadius="20px"
                  padding="8px 24px"
                  fontSize="16px"
                  fontWeight="bold"
                >
                  <Flex gap={tokens.space.small} alignItems="center">
                    Yay!
                    <Sparkles size={18} />
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          </Card>
        }
        messageRenderer={{
          text: ({ text }: { text: string }): JSX.Element => {
            // Show loader if text is empty and there’s a pending AI response
            if (text === "" && loadingMessageIds.length > 0) {
              return (
                <Flex padding={tokens.space.medium} alignItems="center" gap={tokens.space.small}>
                  <Loader size="small" />
                  <Text color={tokens.colors.font.secondary}>Thinking...</Text>
                </Flex>
              );
            }
            return <ReactMarkdown>{text}</ReactMarkdown>;
          }
        }}
        handleSendMessage={handleSendMessage}
      />
    </View>
  );
}