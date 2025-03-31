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
import { Send, Sparkles } from "lucide-react";
import { AIConversation, ConversationMessage, SendMesageParameters } from '@aws-amplify/ui-react-ai';
import ReactMarkdown from 'react-markdown';

type Message = ConversationMessage;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false); // New loading state
  const { tokens } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Response mappings for AI replies
  const responseMap: { [key: string]: string } = {
    "How many casuals are working today?": "You have 3 casuals working today. Do you want to know details?",
    "Estimate total payment for today": "The total estimated salary for today will be $540 for the 3 casuals",
    "Show me shift details": "All 3 casuals are working for the morning shift from 09:00am to 02:30pm with a 30mins lunch break in between"
  };

  // Suggestions to display 
  const suggestions = [
    "How many casuals are working today?",
    "Estimate total payment for today",
    "Show me shift details"
  ];

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

    // Show thinking state
    setIsThinking(true);
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: [{ text: "Thinking..." }],
      role: 'assistant',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // Simulate AI processing with a delay
    setTimeout(() => {
      // Check if the message exists in responseMap
      if (responseMap[userMessageText]) {
        // Replace thinking message with actual response
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: [{ text: responseMap[userMessageText] }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => {
          // Remove the "Thinking..." message and add the real response
          const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
          return [...updatedMessages, aiMessage];
        });
      } else {
        // Replace thinking message with suggestions card
        const suggestionsCard: Message = {
          id: (Date.now() + 2).toString(),
          content: [{
            text: `Please choose from the suggestions below:\n\n${suggestions.map((suggestion, index) => 
              `${index + 1}. ${suggestion}`
            ).join('\n')}`
          }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => {
          // Remove the "Thinking..." message and add the suggestions card
          const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
          return [...updatedMessages, suggestionsCard];
        });
      }
      setIsThinking(false);
    }, 1000); // 1-second delay to simulate thinking
  };

  // Handler for suggestion clicks with loading state
  const handleSuggestionClick = (suggestion: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: [{ text: suggestion }],
      role: 'user',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, userMessage]);

    // Show thinking state
    setIsThinking(true);
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: [{ text: "Thinking..." }],
      role: 'assistant',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // Simulate AI processing with a delay
    setTimeout(() => {
      // Replace thinking message with actual response
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: [{ text: responseMap[suggestion] }],
        role: 'assistant',
        createdAt: new Date().toISOString(),
        conversationId: '1'
      };
      setMessages(prev => {
        // Remove the "Thinking..." message and add the real response
        const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
        return [...updatedMessages, aiMessage];
      });
      setIsThinking(false);
    }, 1000); // 1-second delay to simulate thinking
  };

  return (
    <View className="chat-container">
      {/* Suggestions Box */}
      <Flex
        direction="row"
        gap={tokens.space.medium}
        padding={tokens.space.medium}
        justifyContent="center"
        backgroundColor={tokens.colors.background.secondary}
        borderRadius="8px"
        marginBottom={tokens.space.medium}
      >
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            backgroundColor={tokens.colors.neutral[20]}
            color={tokens.colors.font.primary}
            borderRadius="12px"
            padding="8px 16px"
            fontSize="14px"
            fontWeight="medium"
            border="none"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            isDisabled={isThinking}
          >
            {suggestion}
          </Button>
        ))}
      </Flex>

      {/* AI Conversation */}
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
       
              <Text color={tokens.colors.font.secondary}>
                Try one of the suggestions above to get started!
              </Text>
            </Flex>
          </Card>
        }
        messageRenderer={{
          text: ({ text }: { text: string }): JSX.Element => {
            // Check if the message contains suggestions
            if (text.includes('Please choose from the suggestions below:')) {
              return (
                <Card
                  variation="elevated"
                  padding={tokens.space.medium}
                  backgroundColor={tokens.colors.background.secondary}
                  borderRadius="12px"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                >
                  <Flex direction="column" gap={tokens.space.medium}>
                    <Text fontSize="16px" color={tokens.colors.font.primary}>
                      Please choose from the suggestions below:
                    </Text>
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        backgroundColor={tokens.colors.neutral[20]}
                        color={tokens.colors.font.primary}
                        borderRadius="8px"
                        padding="8px 16px"
                        fontSize="14px"
                        fontWeight="medium"
                        border="none"
                        boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
                        isDisabled={isThinking}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </Flex>
                </Card>
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