import { ThemeProvider } from "@/components/ThemeProvider";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function HomePage() {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  );
}
