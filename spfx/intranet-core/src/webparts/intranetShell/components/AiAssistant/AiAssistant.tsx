import * as React from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';
import { AiChatPanel } from './AiChatPanel';
import styles from './AiAssistant.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export interface IAiAssistantProps {
  /** Whether the assistant is hidden by user */
  isHidden?: boolean;
  /** Callback when user hides the assistant */
  onHide?: () => void;
  /** Accent color for the hub (used for button/header styling) */
  accentColor?: string;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// =============================================================================
// SESSION STORAGE HELPERS
// =============================================================================

const SESSION_KEY_HIDDEN = 'ddre-ai-assistant-hidden';
const SESSION_KEY_POPPED = 'ddre-ai-assistant-popped';

const getSessionBoolean = (key: string): boolean => {
  try {
    return sessionStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const setSessionBoolean = (key: string, value: boolean): void => {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    // Ignore storage errors
  }
};

// =============================================================================
// MESSAGE ID GENERATOR
// =============================================================================

let messageIdCounter = 0;
const generateMessageId = (): string => `msg-${++messageIdCounter}-${Date.now()}`;

// =============================================================================
// SIMULATED RESPONSE HELPER
// =============================================================================

function getSimulatedResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I'm your AI assistant. I can help you find information across the DDRE intranet, answer questions about company policies, or assist with common tasks. What would you like help with?";
  }
  
  if (lower.includes('help')) {
    return "I can help you with:\n• Finding documents and files\n• Answering questions about company policies\n• Navigating the intranet\n• Providing information about team members\n\nJust ask me anything!";
  }
  
  if (lower.includes('policy') || lower.includes('policies')) {
    return "I can help you find company policies. Could you be more specific about which policy you're looking for? For example:\n• Leave policy\n• IT security policy\n• Expense policy\n• Work from home policy";
  }

  return "I understand you're asking about \"" + userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '') + "\". Let me search for relevant information... \n\n*Note: This is a demo response. The actual AI assistant will be connected to the Azure RAG API to provide real answers based on your organization's documents.*";
}

// =============================================================================
// POPUP HTML GENERATOR
// =============================================================================

function getPopupHtml(messages: IChatMessage[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>AI Assistant - DDRE Intranet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #faf9f8; height: 100vh; display: flex; flex-direction: column; }
    .header { background: #0078d4; color: white; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-size: 16px; font-weight: 600; }
    .header button { background: transparent; border: none; color: white; cursor: pointer; padding: 4px 8px; font-size: 14px; }
    .header button:hover { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .messages { flex: 1; overflow-y: auto; padding: 16px; }
    .message { margin-bottom: 12px; max-width: 85%; }
    .message.user { margin-left: auto; }
    .message .bubble { padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4; }
    .message.user .bubble { background: #0078d4; color: white; border-bottom-right-radius: 4px; }
    .message.assistant .bubble { background: white; border: 1px solid #e1dfdd; border-bottom-left-radius: 4px; }
    .input-area { padding: 12px 16px; background: white; border-top: 1px solid #e1dfdd; display: flex; gap: 8px; }
    .input-area input { flex: 1; padding: 10px 12px; border: 1px solid #e1dfdd; border-radius: 4px; font-size: 14px; }
    .input-area input:focus { outline: none; border-color: #0078d4; }
    .input-area button { background: #0078d4; color: white; border: none; border-radius: 4px; padding: 10px 16px; cursor: pointer; font-size: 14px; }
    .input-area button:hover { background: #106ebe; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI Assistant</h1>
    <button onclick="window.opener.postMessage({type:'AI_RETURN'}, '*')">↩ Return to Panel</button>
  </div>
  <div class="messages" id="messages">
    ${messages.map(m => `
      <div class="message ${m.role}">
        <div class="bubble">${m.content.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('')}
  </div>
  <div class="input-area">
    <input type="text" id="input" placeholder="Type your message..." onkeypress="if(event.key==='Enter')sendMessage()" />
    <button onclick="sendMessage()">Send</button>
  </div>
  <script>
    function sendMessage() {
      var input = document.getElementById('input');
      var content = input.value.trim();
      if (!content) return;
      
      var messages = document.getElementById('messages');
      messages.innerHTML += '<div class="message user"><div class="bubble">' + content + '</div></div>';
      messages.scrollTop = messages.scrollHeight;
      
      window.opener.postMessage({ type: 'AI_SEND_MESSAGE', content: content }, '*');
      input.value = '';
    }
    
    window.addEventListener('message', function(e) {
      if (e.data.type === 'AI_RESPONSE') {
        var messages = document.getElementById('messages');
        messages.innerHTML += '<div class="message assistant"><div class="bubble">' + e.data.content.replace(/\\n/g, '<br>') + '</div></div>';
        messages.scrollTop = messages.scrollHeight;
      }
    });
  </script>
</body>
</html>
  `;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * AI Assistant - Floating chatbot button with expandable chat panel.
 * 
 * Features:
 * - Floating action button (bottom-right)
 * - Slide-up chat panel
 * - Pop-out to new window
 * - Session-based hide/show toggle
 * 
 * @example
 * ```tsx
 * <AiAssistant />
 * ```
 */
export const AiAssistant: React.FC<IAiAssistantProps> = ({
  isHidden: isHiddenProp,
  onHide,
  accentColor,
}) => {
  // State
  const [isHiddenInternal, setIsHiddenInternal] = React.useState(() => getSessionBoolean(SESSION_KEY_HIDDEN));
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [isPoppedOut, setIsPoppedOut] = React.useState(() => getSessionBoolean(SESSION_KEY_POPPED));
  const [messages, setMessages] = React.useState<IChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);

  // Use prop if provided, otherwise use internal state
  const isHidden = isHiddenProp ?? isHiddenInternal;

  // Popup window reference
  const popupWindowRef = React.useRef<Window | null>(null);

  // -------------------------------------------------------------------------
  // Handlers - Defined in dependency order (used-by functions come after)
  // -------------------------------------------------------------------------

  // Return from popout - closes popup window and opens panel
  const handleReturnFromPopout = React.useCallback((): void => {
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.close();
    }
    popupWindowRef.current = null;
    setIsPoppedOut(false);
    setIsPanelOpen(true);
    setSessionBoolean(SESSION_KEY_POPPED, false);
  }, []);

  // Simulate AI response (placeholder for Azure RAG API)
  const simulateAiResponse = React.useCallback(async (userMessage: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiMessage: IChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: getSimulatedResponse(userMessage),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  }, []);

  // Send message handler
  const handleSendMessage = React.useCallback(async (content: string): Promise<void> => {
    const userMessage: IChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response (will be replaced with actual API call)
    // TODO: Replace with actual Azure AI RAG API call
    await simulateAiResponse(content);
  }, [simulateAiResponse]);

  // Setup communication with popup window
  const setupPopupCommunication = React.useCallback((popup: Window): void => {
    // Listen for messages from popup
    const handleMessage = (event: MessageEvent): void => {
      if (event.source !== popup) return;
      
      if (event.data.type === 'AI_SEND_MESSAGE') {
        handleSendMessage(event.data.content).catch(console.error);
      } else if (event.data.type === 'AI_RETURN') {
        handleReturnFromPopout();
      }
    };

    window.addEventListener('message', handleMessage);
  }, [handleSendMessage, handleReturnFromPopout]);

  // Pop out to new window
  const handlePopout = React.useCallback((): void => {
    // Open popup window
    const width = 400;
    const height = 600;
    const left = window.screenX + window.outerWidth - width - 50;
    const top = window.screenY + 100;

    const popup = window.open(
      '',
      'ai-assistant-popup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`
    );

    if (popup) {
      popupWindowRef.current = popup;
      setIsPoppedOut(true);
      setIsPanelOpen(false);
      setSessionBoolean(SESSION_KEY_POPPED, true);

      // Write popup content
      popup.document.write(getPopupHtml(messages));
      popup.document.close();

      // Setup message communication
      setupPopupCommunication(popup);
    }
  }, [messages, setupPopupCommunication]);

  // Floating button click handler
  const handleButtonClick = React.useCallback((): void => {
    if (isPoppedOut) {
      // Return from pop-out
      handleReturnFromPopout();
    } else {
      setIsPanelOpen(prev => !prev);
    }
  }, [isPoppedOut, handleReturnFromPopout]);

  // Minimize panel
  const handleMinimize = React.useCallback((): void => {
    setIsPanelOpen(false);
  }, []);

  // Hide assistant
  const handleHide = React.useCallback((): void => {
    setIsPanelOpen(false);
    setIsHiddenInternal(true);
    setSessionBoolean(SESSION_KEY_HIDDEN, true);
    onHide?.();
  }, [onHide]);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Listen for popup window close
  React.useEffect(() => {
    if (!isPoppedOut) return;

    const checkPopupClosed = setInterval(() => {
      if (popupWindowRef.current && popupWindowRef.current.closed) {
        setIsPoppedOut(false);
        setSessionBoolean(SESSION_KEY_POPPED, false);
        popupWindowRef.current = null;
      }
    }, 500);

    return () => clearInterval(checkPopupClosed);
  }, [isPoppedOut]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Don't render if hidden
  if (isHidden) return null;

  // Set CSS variable for accent color
  const containerStyle = accentColor 
    ? { '--ai-accent-color': accentColor } as React.CSSProperties
    : undefined;

  return (
    <div className={styles.aiAssistant} style={containerStyle}>
      {/* Chat Panel */}
      {isPanelOpen && !isPoppedOut && (
        <AiChatPanel
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onMinimize={handleMinimize}
          onHide={handleHide}
          onPopout={handlePopout}
        />
      )}

      {/* Floating Button */}
      <TooltipHost
        content={isPoppedOut ? 'Return chat to panel' : (isPanelOpen ? 'Close AI Assistant' : 'Open AI Assistant')}
      >
        <IconButton
          className={`${styles.floatingButton} ${isPoppedOut ? styles.poppedOut : ''}`}
          iconProps={{ iconName: isPoppedOut ? 'ReturnKey' : 'Robot' }}
          ariaLabel={isPoppedOut ? 'Return AI Assistant from popup' : 'Open AI Assistant'}
          onClick={handleButtonClick}
        />
      </TooltipHost>
    </div>
  );
};

export default AiAssistant;
