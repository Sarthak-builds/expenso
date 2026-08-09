import * as React from 'react';
import { View } from 'react-native';
import { ArrowUp } from 'lucide-react-native';

import { PressableScale } from '@/components/molecules';
import { Icon } from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { strings } from '@/lib/strings';

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

/**
 * The message input.
 *
 * Draft text is local state and deliberately not in the chat store — it
 * changes on every keystroke, and persisting a half-typed message to MMKV
 * forty times a sentence is work nobody asked for.
 *
 * The send control is a 44×44 circle that only comes alive with content, so
 * there is nothing to tap until there is something to send.
 */
export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [draft, setDraft] = React.useState('');

  const canSend = draft.trim().length > 0 && !disabled;

  const handleSend = React.useCallback(() => {
    if (!canSend) return;
    onSend(draft);
    setDraft('');
  }, [canSend, draft, onSend]);

  return (
    <View className="flex-row items-end gap-2 border-t border-accents-2 bg-background px-4 pb-2 pt-3">
      <Textarea
        value={draft}
        onChangeText={setDraft}
        placeholder={strings.chat.placeholder}
        className="max-h-32 min-h-[44px] flex-1"
        multiline
        // Return inserts a newline; sending is the button. On a screen where
        // "milk 30" and a full question are both normal, losing multiline to
        // save one tap is the wrong trade.
        blurOnSubmit={false}
      />

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={strings.chat.send}
        accessibilityState={{ disabled: !canSend }}
        depth="firm"
        disabled={!canSend}
        onPress={handleSend}>
        <View
          className={cn(
            'h-11 w-11 items-center justify-center rounded-full',
            canSend ? 'bg-foreground' : 'bg-accents-2'
          )}>
          <Icon
            as={ArrowUp}
            size={18}
            className={canSend ? 'text-background' : 'text-accents-4'}
          />
        </View>
      </PressableScale>
    </View>
  );
}
