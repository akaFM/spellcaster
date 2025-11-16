import { useMemo } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const KEYBOARD_LAYOUT = {
  default: ['q w e r t y u i o p', 'a s d f g h j k l', 'z x c v b n m'],
};

export function OnScreenKeyboard() {
  const keyboardOptions = useMemo(
    () => ({
      layoutName: 'default',
      layout: KEYBOARD_LAYOUT,
      physicalKeyboardHighlight: true,
      physicalKeyboardHighlightPress: true,
      preventMouseDownDefault: true,
      useMouseEvents: false,
      display: {},
      theme: 'hg-theme-default hg-layout-default spellcaster-keyboard',
    }),
    []
  );

  return (
    <div
      className="pointer-events-none select-none"
      aria-hidden="true"
      data-testid="on-screen-keyboard"
    >
      <Keyboard
        {...keyboardOptions}
        onChange={() => undefined}
        onKeyPress={() => undefined}
        disableCaretPositioning
      />
    </div>
  );
}

