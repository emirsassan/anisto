import { Component, createEffect } from "solid-js";

interface KeybindListenerProps {
  actions: {
    [key: string]: () => void;
  };
}

const KeybindListener: Component<KeybindListenerProps> = (props) => {
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key in props.actions) {
        e.preventDefault();
        props.actions[e.key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return null;
};

export default KeybindListener;
