import * as React from 'react';
import { 
  IconButton, 
  TextField, 
  Spinner, 
  SpinnerSize,
  Icon,
} from '@fluentui/react';
import type { IChatMessage } from './AiAssistant';
import styles from './AiAssistant.module.scss';

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Convert hex color to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | undefined {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : undefined;
}

/**
 * Generate a much lighter shade of a color (90% lighter).
 * Used for message container background when accent color is provided.
 */
function getLighterShade(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'rgba(255, 255, 255, 0.5)';
  
  // Blend with white at 90% lightness
  const lightened = {
    r: Math.round(rgb.r + (255 - rgb.r) * 0.9),
    g: Math.round(rgb.g + (255 - rgb.g) * 0.9),
    b: Math.round(rgb.b + (255 - rgb.b) * 0.9),
  };
  
  return `rgba(${lightened.r}, ${lightened.g}, ${lightened.b}, 0.4)`;
}

// =============================================================================
// TYPES
// =============================================================================

export interface IAiChatPanelProps {
  messages: IChatMessage[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onMinimize: () => void;
  onHide: () => void;
  onPopout: () => void;
  accentColor?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const AiChatPanel: React.FC<IAiChatPanelProps> = ({
  messages,
  isTyping,
  onSendMessage,
  onMinimize,
  onHide,
  onPopout,
  accentColor,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (): void => {
    const content = inputValue.trim();
    if (!content) return;
    
    onSendMessage(content);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={styles.chatPanel} 
      role="dialog" 
      aria-label="AI Assistant Chat"
      aria-modal="false"
      style={accentColor ? {
        '--ai-accent-color': accentColor,
        '--ai-message-bg': getLighterShade(accentColor),
      } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <Icon iconName="Robot" className={styles.headerIcon} />
          <span>AI Assistant</span>
        </div>
        <div className={styles.headerActions}>
          <IconButton
            iconProps={{ iconName: 'MiniExpand' }}
            title="Pop out to new window"
            ariaLabel="Pop out chat to new window"
            onClick={onPopout}
            className={styles.headerButton}
          />
          <IconButton
            iconProps={{ iconName: 'ChromeMinimize' }}
            title="Minimize"
            ariaLabel="Minimize chat panel"
            onClick={onMinimize}
            className={styles.headerButton}
          />
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            title="Hide AI Assistant"
            ariaLabel="Hide AI Assistant for this session"
            onClick={onHide}
            className={styles.headerButton}
          />
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <Icon iconName="Robot" className={styles.welcomeIcon} />
            <h3>Hi! I&apos;m your AI Assistant</h3>
            <p>Ask me anything about the DDRE intranet, company policies, or how to find information.</p>
          </div>
        )}
        
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`${styles.message} ${styles[message.role]}`}
          >
            <div className={styles.messageBubble}>
              {message.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.typingIndicator}>
              <Spinner size={SpinnerSize.xSmall} />
              <span>AI is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <TextField
          className={styles.inputField}
          placeholder="Type your message..."
          value={inputValue}
          onChange={(_, val) => setInputValue(val || '')}
          onKeyPress={handleKeyPress}
          borderless
          autoComplete="off"
        />
        <IconButton
          iconProps={{ iconName: 'Send' }}
          title="Send message"
          ariaLabel="Send message"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={styles.sendButton}
        />
      </div>
    </div>
  );
};

export default AiChatPanel;
