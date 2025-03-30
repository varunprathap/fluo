
import React, { useState } from "react";
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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tokens } = useTheme();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // TODO: Implement AWS Amplify chat API call here
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! This is a placeholder response.",
          sender: 'ai',
          timestamp: new Date()
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
        <Card>
          <Flex direction="column" height="90vh">
            {/* Chat Messages */}
            <ScrollView flex="1" padding={tokens.space.medium}>
              <Flex direction="column" gap={tokens.space.medium}>
                {messages.map((msg) => (
                  <Card
                    key={msg.id}
                    variation="elevated"
                    backgroundColor={msg.sender === 'user' ? tokens.colors.purple[10] : tokens.colors.neutral[20]}
                    marginLeft={msg.sender === 'user' ? 'auto' : '0'}
                    marginRight={msg.sender === 'ai' ? 'auto' : '0'}
                    maxWidth="70%"
                  >
                    <Text variation="primary">{msg.text}</Text>
                    <Text
                      variation="tertiary"
                      fontSize={tokens.fontSizes.xs}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </Text>
                  </Card>
                ))}
                {isLoading && (
                  <Card variation="elevated" backgroundColor={tokens.colors.neutral[20]}>
                    <Flex alignItems="center" gap={tokens.space.small}>
                      <Text variation="primary">AI is typing...</Text>
                    </Flex>
                  </Card>
                )}
              </Flex>
            </ScrollView>

            {/* Message Input */}
            <Flex
              as="form"
              direction="row"
              gap={tokens.space.small}
              padding={tokens.space.medium}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <TextAreaField
                flex="1"
                label="Message"
                labelHidden={true}
                value={message}
                placeholder="Type your message..."
                onChange={(e) => setMessage(e.target.value)}
                rows={1}
                autoResize={true}
                hasError={false}
              />
              <Button
                variation="primary"
                isLoading={isLoading}
                onClick={handleSendMessage}
                ariaLabel="Send message"
              >
                <Send size={20} />
              </Button>
            </Flex>
          </Flex>
        </Card>
      </View>
   
  );
} 