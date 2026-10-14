import { motion } from 'motion/react';
import { Bot, UsersRound } from 'lucide-react';
import AppLogo from '../ui/AppLogo';
import Button from '../ui/Button';

/**
 * Tampilan saat belum ada percakapan yang dipilih.
 */
export default function WelcomeScreen(props) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <AppLogo variant="bot" size="lg" />
        <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Chat with AI, and connect with people
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          Get instant answers from the AI Assistant, or start a direct conversation with anyone who is online.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={props.onStartAiChat} disabled={props.isCreating}>
            <Bot className="h-5 w-5" aria-hidden="true" />
            Start AI chat
          </Button>
          <Button variant="soft" onClick={props.onShowContacts}>
            <UsersRound className="h-5 w-5" aria-hidden="true" />
            Browse contacts
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
