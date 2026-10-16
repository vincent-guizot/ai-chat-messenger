import { motion } from 'motion/react';
import { Bot, UsersRound } from 'lucide-react';
import AppLogo from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';

/**
 * Tampilan saat belum ada percakapan yang dipilih.
 */
export default function WelcomeScreen(props) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <AppLogo size="lg" />
        <h2 className="mt-5 text-xl font-semibold text-foreground">Chat with AI, and connect with people</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Get instant answers from the AI Assistant, or start a direct conversation with anyone who is online.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button onClick={props.onStartAiChat} disabled={props.isCreating}>
            <Bot aria-hidden="true" />
            Start AI chat
          </Button>
          <Button variant="outline" onClick={props.onShowContacts}>
            <UsersRound aria-hidden="true" />
            Browse contacts
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
