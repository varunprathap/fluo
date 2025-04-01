import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Flex,
  Card,
  View,
  useTheme,
  Text,
} from "@aws-amplify/ui-react";
import { AIConversation, ConversationMessage, SendMesageParameters } from '@aws-amplify/ui-react-ai';
import ReactMarkdown from 'react-markdown';

type Message = ConversationMessage;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const { tokens } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Conversation flow with responses and next suggestions
  const conversationFlow: { 
    [key: string]: { 
      response: string; 
      suggestions: string[] 
    } 
  } = {
    "How many employees do I have?": {
      response: "You have 8 employees.",
      suggestions: ["How many casual employees?", "How many of them are working today?"]
    },
    "How many casual employees?": {
      response: "Out of 8 employees, you have 3 casuals.",
      suggestions: ["How many of them are working today?", "How many casuals are working this week?"]
    },
    "How many of them are working today?": {
      response: "You have 3 casuals working today.",
      suggestions: ["What are their shift details?", "What's the total payment for today?"]
    },
    "What are their shift details?": {
      response: "All 3 casuals are working the morning shift from 09:00am to 02:30pm with a 30mins lunch break.",
      suggestions: ["What's the total payment for today?", "Who is managing them?"]
    },
    "What's the total payment for today?": {
      response: "The total estimated payment for today is $540 for the 3 casuals.",
      suggestions: ["What about permanent employees?", "What's the weekly total?"]
    },
    "What about permanent employees?": {
      response: "You have 5 permanent employees, none scheduled for today.",
      suggestions: ["What's their weekly schedule?", "What's the monthly payroll?"]
    },
    "What's their weekly schedule?": {
      response: "Permanent employees work Monday-Friday, 9am-5pm.",
      suggestions: ["What's the monthly payroll?", "Any overtime this week?"]
    },
    "What's the monthly payroll?": {
      response: "The monthly payroll for all employees is approximately $12,000.",
      suggestions: ["Any overtime this week?", "What's the annual cost?"]
    },
    "Any overtime this week?": {
      response: "No overtime recorded this week for any employees.",
      suggestions: ["What's the annual cost?", "What's the leave balance?"]
    },
    "What's the annual cost?": {
      response: "The annual employment cost is approximately $144,000.",
      suggestions: ["What's the leave balance?", "How many employees do I have?"] // Loop back
    }
  };

  // Initial suggestions
  const initialSuggestions = ["How many employees do I have?", "How many casual employees?"];

  useEffect(() => {
    setCurrentSuggestions(initialSuggestions);
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (input: SendMesageParameters) => {
    if (!input.content?.[0]?.text?.trim()) return;

    const userMessageText = input.content[0].text.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.content,
      role: 'user',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, userMessage]);

    setIsThinking(true);
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: [{ text: "Thinking..." }],
      role: 'assistant',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    setTimeout(() => {
      if (conversationFlow[userMessageText]) {
        const { response, suggestions } = conversationFlow[userMessageText];
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: [{ text: response }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => {
          const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
          return [...updatedMessages, aiMessage];
        });
        setCurrentSuggestions(suggestions);
      } else {
        // Reset to initial suggestions when answer not found
        const resetMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: [{
            text: "Sorry, I didn't understand that. Let's start over. Please choose from these suggestions:\n\n" +
                  `${initialSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}`
          }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => {
          const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
          return [...updatedMessages, resetMessage];
        });
        setCurrentSuggestions(initialSuggestions);
      }
      setIsThinking(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: [{ text: suggestion }],
      role: 'user',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, userMessage]);

    setIsThinking(true);
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: [{ text: "Thinking..." }],
      role: 'assistant',
      createdAt: new Date().toISOString(),
      conversationId: '1'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    setTimeout(() => {
      if (conversationFlow[suggestion]) {
        const { response, suggestions } = conversationFlow[suggestion];
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: [{ text: response }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => {
          const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
          return [...updatedMessages, aiMessage];
        });
        setCurrentSuggestions(suggestions);
      } else {
        // Reset to initial suggestions when answer not found
        const resetMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: [{
            text: "Sorry, I didn't understand that. Let's start over. Please choose from these suggestions:\n\n" +
                  `${initialSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}`
          }],
          role: 'assistant',
          createdAt: new Date().toISOString(),
          conversationId: '1'
        };
        setMessages(prev => {
          const updatedMessages = prev.filter(msg => msg.content[0].text !== "Thinking...");
          return [...updatedMessages, resetMessage];
        });
        setCurrentSuggestions(initialSuggestions);
      }
      setIsThinking(false);
    }, 1000);
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
              <Text color={tokens.colors.font.secondary}>
                Try one of the suggestions below to get started!
              </Text>
            </Flex>
          </Card>
        }
        messageRenderer={{
          text: ({ text }: { text: string }): JSX.Element => {
            if (text.includes('Please choose from these suggestions:')) {
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
                      Sorry, I didn't understand that. Let's start over. Please choose from these suggestions:
                    </Text>
                    {initialSuggestions.map((suggestion, index) => (
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

      <Flex
        direction="row"
        gap={tokens.space.medium}
        padding={tokens.space.medium}
        justifyContent="center"
        backgroundColor={tokens.colors.background.secondary}
        borderRadius="8px"
        marginBottom={tokens.space.medium}
      >
        {currentSuggestions.map((suggestion, index) => (
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
    </View>
  );
}