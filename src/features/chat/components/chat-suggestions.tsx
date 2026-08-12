import { View } from 'react-native';

import { Chip } from '@/components/molecules';
import { strings } from '@/lib/strings';

/**
 * Starter prompts, shown only on an empty transcript.
 *
 * The chat does two quite different jobs — recording an expense and answering
 * a question — and nothing on screen tells you the first one is possible. A
 * blank input with "Add an expense or ask about your spending" describes the
 * feature; "Milk 30" demonstrates it, which is the difference between reading
 * about a shortcut and using one.
 *
 * They disappear after the first message. Persistent suggestion chips become
 * furniture you scroll past, and the composer is right there by then.
 */
export function ChatSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <View className="flex-row flex-wrap justify-center gap-2 px-6">
      {strings.chat.suggestions.map((suggestion) => (
        <Chip key={suggestion} label={suggestion} onPress={() => onSelect(suggestion)} />
      ))}
    </View>
  );
}
