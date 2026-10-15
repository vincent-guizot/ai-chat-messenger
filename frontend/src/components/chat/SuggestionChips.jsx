import { motion } from 'motion/react';
import Button from '../ui/Button';

export const ASSISTANT_SUGGESTIONS = [
  'Explain this code',
  'Give me a study plan',
  'Brainstorm an idea',
  'How to handle errors in React?',
];

export default function SuggestionChips(props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-wrap gap-2 pl-[52px]"
    >
      {props.suggestions.map((suggestion) => (
        <Button key={suggestion} variant="ai" size="pill" onClick={() => props.onSelect(suggestion)}>
          {suggestion}
        </Button>
      ))}
    </motion.div>
  );
}
